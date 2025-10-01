import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
    Task, ChatMessage, BusinessPlanSection, BudgetPlan, StudyGuide, ItineraryOptimization, 
    PitchDeckSlide, MindMapNode, InvestmentSummary, LegalSummary, DomainSuggestion, CustomerPersona, EventPlan, Okr, GddSection, CocktailRecipe, BoardGameIdea, TriviaQuestion, DeclutterTask, UserStory, QuizQuestion, DietaryRecipe 
} from "../types";

const API_KEY = import.meta.env.VITE_API_KEY || process.env.API_KEY;
let ai: GoogleGenAI | null = null;

// Initialize AI client only if API key is available
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY environment variable not set. AI features will not work until configured.");
}

const getAI = () => {
  if (!ai) {
    throw new Error("AI client not initialized. Please configure VITE_API_KEY environment variable.");
  }
  return ai;
};

// Helper function to get thinking config from localStorage
const getThinkingConfig = () => {
    try {
        const thinkingEnabled = localStorage.getItem('accelerate-thinking-enabled');
        // Default to enabled (omit config) if not set. Disable only if explicitly 'false'.
        if (thinkingEnabled === 'false') {
            return { thinkingConfig: { thinkingBudget: 0 } };
        }
    } catch (e) {
        console.error("Could not read thinking setting from localStorage", e);
    }
    return {}; // Omit config by default to enable thinking
};

// Generic function for simple text generation tasks
// FIX: Exported 'generateText' function to make it available for other modules.
export const generateText = async (systemInstruction: string, prompt: string) => {
    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { 
                systemInstruction,
                ...getThinkingConfig()
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating text with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate response: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the response.");
    }
};

// Generic function for structured JSON generation
const generateJson = async (systemInstruction: string, prompt: string, responseSchema: any) => {
     try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
                ...getThinkingConfig()
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating JSON with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate JSON response: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the JSON response.");
    }
}


export const generateImages = async (prompt: string, numImages: number): Promise<string[]> => {
  try {
    const response = await getAI().models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numImages,
        outputMimeType: 'image/png',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("The model did not return any images. It may have refused the request.");
    }

    return response.generatedImages.map(img => {
      const base64ImageBytes: string = img.image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    });

  } catch (error) {
    console.error("Error generating images with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate images: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the images.");
  }
};

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<{ image: string | null; text: string | null }> => {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let editedImage: string | null = null;
    let responseText: string | null = null;

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            editedImage = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          } else if (part.text) {
            responseText = part.text;
          }
        }
    }
    
    if (!editedImage) {
        throw new Error("The model did not return an edited image. It may have refused the request.");
    }

    return { image: editedImage, text: responseText };

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to edit image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while editing the image.");
  }
};


export const polishPrompt = (prompt: string): Promise<string> => 
    generateText("You are an expert prompt engineer specializing in AI image generation. Rewrite the user's prompt to be more vivid, detailed, and imaginative. Add descriptive adjectives, specify the environment, lighting conditions (e.g., 'cinematic lighting', 'golden hour'), artistic style (e.g., 'photorealistic', 'oil painting', 'synthwave'), and camera perspective (e.g., 'wide-angle shot', 'macro view'). Your output must be only the rewritten prompt text and nothing else.", prompt);


export const generateVideoIdeas = (topic: string): Promise<any> => 
    generateJson(
        "You are a viral marketing expert for short-form video platforms like TikTok or VEO. Generate 3 creative, engaging video ideas based on the user's topic. For each idea, provide a catchy title, a short concept, visual suggestions, and a strong opening hook to grab attention in the first 3 seconds.",
        `Generate ideas for this topic: ${topic}`,
        {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A short, catchy, and viral-style title for the video." },
                    concept: { type: Type.STRING, description: "A brief explanation of the video's core idea and narrative." },
                    visuals: { type: Type.STRING, description: "Suggestions for visuals, camera angles, and editing style." },
                    hook: { type: Type.STRING, description: "The opening line or visual for the first 3 seconds to capture viewer attention." }
                },
                required: ["title", "concept", "visuals", "hook"]
            }
        }
    );

export const processNotes = (text: string, mode: 'summarize' | 'extract'): Promise<string> => {
    const instruction = mode === 'summarize' 
        ? "You are an expert at summarizing text. Your task is to take the user's notes and provide a concise, easy-to-read summary that captures the main ideas. Do not add any extra commentary. Output only the summary."
        : "You are an expert at information extraction. Your task is to analyze the user's text and extract the key points, action items, or important facts. Present them as a clear, bulleted list using hyphens (-). Do not add any extra commentary. Output only the key points.";
    return generateText(instruction, text);
};


export const explainCode = (codeSnippet: string, language: string): Promise<string> =>
    generateText(`You are an expert programmer and teacher. Explain the following ${language} code snippet in a clear, concise, and easy-to-understand way. Break down the logic, explain what each part does, and describe the overall purpose of the code. Format your explanation using markdown for readability, including code blocks for examples and bullet points for clarity. Structure your explanation with clear headings.`, `Here is the ${language} code to explain:\n\`\`\`${language}\n${codeSnippet}\n\`\`\``);


export const manageTasks = async (prompt: string, currentTasks: Task[]): Promise<Task[]> => {
    const fullPrompt = `USER PROMPT: "${prompt}"\n\nCURRENT TASKS (JSON):\n${JSON.stringify(currentTasks)}`;
    const tasksFromAI = await generateJson(
        "You are an intelligent task manager. Analyze the user's prompt combined with their current list of tasks. The prompt could be for adding new tasks, modifying existing ones, or reorganizing the list (e.g., 'prioritize my tasks'). Parse new tasks with a 'taskName', 'description', a 'priority' ('High', 'Medium', or 'Low'), and a 'dueDate'. Crucially, if the user provides a date in any format (e.g., 'tomorrow', 'next Friday', 'August 15th', 'in 2 weeks'), you MUST calculate the absolute date based on the current date and format it as YYYY-MM-DD for the 'dueDate' field. When modifying tasks, find the target task and apply changes. Preserve the 'id' of existing tasks. For new tasks, you do not need to generate an id. Always return the *entire*, updated list of tasks as a JSON array. If the task list is empty and the user is adding tasks, create a new list.",
        fullPrompt,
        {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "The unique identifier for an existing task. Preserve it. Omit for new tasks."},
                    taskName: { type: Type.STRING, description: "A concise name for the task." },
                    description: { type: Type.STRING, description: "A brief description of the task." },
                    priority: { type: Type.STRING, description: "Priority level: 'High', 'Medium', or 'Low'." },
                    dueDate: { type: Type.STRING, description: "The due date in YYYY-MM-DD format. Omit if not specified." },
                    completed: { type: Type.BOOLEAN, description: "The completion status of the task. Default to false for new tasks." },
                },
                required: ["taskName", "description", "priority", "completed"]
            }
        }
    );
     // Add unique IDs to new tasks client-side
    return tasksFromAI.map((task: any) => ({
        ...task,
        id: task.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }));
};


export const askWiki = (context: string, question: string): Promise<string> =>
    generateText(
        "You are a helpful AI assistant for a personal wiki. Your task is to answer the user's question based *only* on the provided CONTEXT from their wiki page. Do not use any external knowledge. If the answer cannot be found in the context, you must explicitly state that the information is not available in the note.",
        `CONTEXT:\n---\n${context}\n---\n\nQUESTION: ${question}`
    );


export const socraticTutor = async (topic: string, history: ChatMessage[]): Promise<string> => {
    const conversation = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Tutor'}: ${msg.text}`).join('\n');
    const prompt = `Here is the conversation history:\n${conversation}\n\nTutor:`;

    return generateText(
        `You are a Socratic tutor. Your primary goal is to help the user learn about a specific topic by asking guiding questions. You must never provide direct answers or long explanations. Instead, your responses should always be questions that encourage the user to think critically, make connections, and explore the topic on their own. The user is currently learning about: "${topic}". Keep your questions concise and focused. Your output must be only your next question and nothing else.`,
        prompt
    );
};


// NEWLY IMPLEMENTED SERVICES

// Simple text generators
export const summarizeMeeting = (transcript: string) => generateText("You are a professional meeting summarizer. Your task is to take a meeting transcript and provide a concise summary, a list of key decisions, and a list of action items with assigned owners if mentioned. Format the output with clear markdown headings.", transcript);
export const writeEmail = (prompt: { recipient: string, topic: string, tone: string }) => generateText(`You are an expert email writer. Write a professional email. Tone: ${prompt.tone}. Recipient: ${prompt.recipient}. Topic: ${prompt.topic}. Output only the subject and body.`, `Write an email about ${prompt.topic}`);
export const generateSocialPost = (prompt: { topic: string, platform: string, tone: string }) => generateText(`You are a social media marketing expert. Create an engaging social media post for ${prompt.platform} with a ${prompt.tone} tone about the following topic. Include relevant hashtags.`, prompt.topic);
export const writeStory = (prompt: string) => generateText("You are a creative storyteller. Write a short story based on the user's prompt. Focus on vivid descriptions, compelling characters, and a clear plot.", prompt);
export const writeBlogPost = (prompt: string) => generateText("You are an expert blog writer. Generate a well-structured and engaging blog post based on the user's topic. Include a catchy title, an introduction, a main body with subheadings, and a conclusion.", prompt);
export const generateAdCopy = (prompt: { product: string, targetAudience: string, platform: string }) => generateText(`You are an expert copywriter. Create 3 variations of compelling ad copy for the following product. Tailor it for the specified audience and platform.`, `Product: ${prompt.product}, Audience: ${prompt.targetAudience}, Platform: ${prompt.platform}`);
export const writeProductDescription = (prompt: string) => generateText("You are a persuasive e-commerce copywriter. Write a compelling product description based on the user's input, highlighting key features and benefits.", prompt);
export const generateIdeas = (prompt: string) => generateText("You are a creative idea generator. Brainstorm a list of 10 unique and innovative ideas based on the user's topic or problem.", prompt);
export const writeCoverLetter = (prompt: { jobDescription: string, userSkills: string }) => generateText("You are a professional resume writer. Write a compelling and tailored cover letter based on the provided job description and user's skills. Highlight how the user's experience aligns with the job requirements.", `Job Description:\n${prompt.jobDescription}\n\nMy Skills:\n${prompt.userSkills}`);
export const writeSpeech = (prompt: { topic: string, occasion: string, duration: string }) => generateText(`You are an expert speechwriter. Write a ${prompt.duration} speech for a ${prompt.occasion} on the topic of "${prompt.topic}". It should be engaging, well-structured, and appropriate for the event.`, `Write a speech about ${prompt.topic}`);
export const generateLyrics = (prompt: { topic: string, genre: string, mood: string }) => generateText(`You are a songwriter. Write song lyrics about "${prompt.topic}" in the style of ${prompt.genre} with a ${prompt.mood} mood. Include at least two verses and a chorus.`, `Write a song about ${prompt.topic}`);
export const convertCode = (prompt: { code: string, from: string, to: string }) => generateText(`You are an expert programmer. Convert the following code snippet from ${prompt.from} to ${prompt.to}. Provide only the code, with comments explaining any major changes.`, prompt.code);
export const generateRegex = (description: string) => generateText("You are a regular expression expert. Generate a regex pattern based on the user's description. Also provide a brief explanation of how it works.", description);
export const generateSqlQuery = (description: string) => generateText("You are a SQL expert. Generate a SQL query based on the user's natural language description. Assume a standard database schema if not provided. Provide only the SQL code.", description);
export const writeApiDocs = (code: string) => generateText("You are a technical writer specializing in API documentation. Generate clear and concise documentation for the provided code function, including parameters, return values, and an example.", code);
export const generateBrandNames = (description: string) => generateText("You are a branding expert. Generate 10 unique and catchy brand names based on the user's company description. Provide a mix of modern, classic, and abstract names.", description);
export const writeVideoScript = (prompt: { topic: string, style: string, duration: string }) => generateText(`You are a video scriptwriter. Write a script for a ${prompt.duration} video about "${prompt.topic}" in a ${prompt.style} style. Include visual cues and spoken dialogue.`, `Write a script about ${prompt.topic}`);
export const writePressRelease = (announcement: string) => generateText("You are a public relations professional. Write a professional press release based on the user's announcement. Include a headline, dateline, introduction, body, and contact information.", announcement);
export const writeJobDescription = (prompt: { role: string, responsibilities: string, requirements: string }) => generateText("You are an HR professional. Write a clear and concise job description for the specified role. Include sections for Responsibilities, Qualifications, and Benefits.", `Role: ${prompt.role}. Responsibilities: ${prompt.responsibilities}. Requirements: ${prompt.requirements}.`);
export const generatePersonalizedStory = (prompt: { mainCharacter: string, setting: string, plot: string }) => generateText("You are a children's story writer. Write a short, personalized story based on the user's input.", `Main character: ${prompt.mainCharacter}, Setting: ${prompt.setting}, Plot idea: ${prompt.plot}`);
export const solveEthicalDilemma = (dilemma: string) => generateText("You are an ethics professor. Analyze the following ethical dilemma from multiple philosophical perspectives (e.g., Utilitarianism, Deontology, Virtue Ethics) and provide a nuanced discussion of the potential courses of action.", dilemma);
export const generateAnalogy = (topic: string) => generateText("You are a creative teacher. Explain the complex topic provided by the user by creating a simple and effective analogy.", topic);
export const summarizeResearchPaper = (text: string) => generateText("You are an academic research assistant. Summarize the provided research paper, focusing on the abstract, methodology, key findings, and conclusion.", text);
export const analyzeDietaryLog = (log: string) => generateText("You are a nutritionist. Analyze the user's dietary log and provide feedback on its nutritional balance, potential deficiencies, and suggestions for improvement.", log);
export const translateText = (prompt: { text: string, to: string }) => generateText(`You are a professional translator. Translate the following text to ${prompt.to}.`, prompt.text);
export const summarizeLegalDoc = (text: string) => generateText("You are an AI legal assistant. Summarize the provided legal document in plain, easy-to-understand language. Focus on key clauses, obligations, and potential risks. This is not legal advice.", text);
export const suggestCodeRefactor = (prompt: { code: string, language: string }) => generateText(`You are an expert software engineer. Review the following ${prompt.language} code snippet and suggest refactorings to improve its readability, efficiency, and maintainability. Explain your suggestions clearly using markdown formatting.`, prompt.code);
export const explainEli5 = (topic: string) => generateText("You are an expert at explaining complex topics in a very simple way. Explain the following topic as if you were talking to a curious 5-year-old.", topic);

// All new text generators
export const generateLessonPlan = (prompt: { topic: string, level: string, duration: string }) => generateText("You are an expert curriculum designer. Create a detailed lesson plan based on the user's request. Include learning objectives, activities, materials needed, and assessment methods.", `Topic: ${prompt.topic}, Level: ${prompt.level}, Duration: ${prompt.duration}`);
export const logWorkout = (text: string) => generateText("You are an AI fitness assistant. Take the user's natural language workout description and format it into a structured log. Extract exercises, sets, reps, and weights. Add a brief summary or motivational comment.", text);
export const scriptNegotiation = (prompt: { situation: string, goal: string }) => generateText("You are an expert negotiator. Create a script with key talking points for the user's upcoming negotiation. Include an opening, key arguments, and potential compromises.", `Situation: ${prompt.situation}, Goal: ${prompt.goal}`);
export const researchMarket = (topic: string) => generateText("You are a market research analyst. Provide a brief overview of the current market for the given topic. Include key trends, major players, and potential opportunities.", topic);
export const generateTextAdventure = (history: ChatMessage[]) => {
    const prompt = history.map(msg => `${msg.sender === 'user' ? 'Player' : 'Game Master'}: ${msg.text}`).join('\n');
    return generateText("You are a creative and descriptive Game Master for a text-based adventure game. You set the scene, describe the outcomes of the player's actions, and present them with new choices. Keep the story engaging and responsive to the player's input.", prompt);
};
export const getFitnessCoaching = (history: ChatMessage[]) => {
    const prompt = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Coach'}: ${msg.text}`).join('\n');
    return generateText("You are a supportive and knowledgeable AI fitness coach. Answer the user's questions about exercise, nutrition, and wellness. Provide safe and effective advice. Always include a disclaimer that you are not a medical professional.", prompt);
};
export const checkSymptoms = (symptoms: string) => generateText("You are a helpful AI health assistant. Based on the symptoms provided, list potential conditions and suggest whether it is advisable to see a doctor. IMPORTANT: Always start your response with a clear disclaimer: 'I am an AI assistant and not a medical professional. This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.'", symptoms);
export const chatMentalHealth = (history: ChatMessage[]) => {
    const prompt = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Companion'}: ${msg.text}`).join('\n');
    return generateText("You are a caring and empathetic mental health companion. Your role is to be a supportive listener, offer encouragement, and provide evidence-based coping strategies (like mindfulness or CBT techniques). IMPORTANT: You are not a therapist. Always include a disclaimer in your responses if the user seems to be in distress, e.g., 'It sounds like you're going through a lot. Please remember, I'm an AI and not a substitute for a real therapist. If you're struggling, please consider reaching out to a mental health professional or a crisis hotline.'", prompt);
};
export const generateMeditationScript = (prompt: { theme: string, duration: string }) => generateText(`You are a meditation guide. Write a calming, guided meditation script for a ${prompt.duration} session with the theme of "${prompt.theme}".`, `Write a meditation script.`);
export const chatWithHistoricalFigure = (figure: string, history: ChatMessage[]) => {
    const prompt = history.map(msg => `${msg.sender === 'user' ? 'User' : figure}: ${msg.text}`).join('\n');
    return generateText(`You are acting as ${figure}. Respond to the user's questions and converse with them from the perspective and knowledge of ${figure}. Stay in character.`, prompt);
};
export const summarizeBook = (title: string) => generateText("You are an expert literary analyst. Provide a detailed summary of the book requested by the user. Include the main plot points, key characters, major themes, and the author's overall message.", `Summarize the book: ${title}`);
export const analyzeCompetitor = (competitor: string) => generateText("You are a business analyst. Provide a brief analysis of the specified competitor. Include their main products, target audience, and perceived strengths and weaknesses.", competitor);
export const writeGrantProposal = (prompt: string) => generateText("You are a professional grant writer. Based on the user's project description, write a compelling grant proposal outline. Include sections like Introduction, Problem Statement, Objectives, Methods, and Budget.", prompt);
export const generateAbTestIdeas = (goal: string) => generateText("You are a conversion rate optimization specialist. Generate 5 A/B test ideas to help the user achieve their goal.", `Goal: ${goal}`);
export const analyzeRisk = (scenario: string) => generateText("You are a risk management consultant. Analyze the provided scenario and identify potential risks. Categorize them and suggest mitigation strategies.", scenario);
export const debugErrorMessage = (error: string) => generateText("You are an expert programmer and debugger. The user has provided an error message. Explain what the error means in simple terms, identify the likely cause, and suggest specific steps or code changes to fix it.", error);
export const generateUnitTests = (code: string) => generateText("You are a software quality assurance engineer. Write a set of unit tests for the provided code snippet. Use a common testing framework for the language and cover the main logic and edge cases.", code);
export const suggestApiEndpoints = (description: string) => generateText("You are a software architect specializing in API design. Based on the user's description of their application or data, suggest a set of RESTful API endpoints. Include the HTTP method, URL path, and a brief description of what each endpoint does.", description);
export const explainCronJob = (cron: string) => generateText("You are a system administrator expert. Explain the provided cron job schedule in plain English.", cron);
export const generateInteriorDesignIdeas = (prompt: string) => generateText("You are an interior designer. Based on the user's prompt (e.g., room type, style preferences), provide 3 distinct interior design concepts. For each, describe the color palette, furniture suggestions, and overall mood.", prompt);
export const generateTattooIdeas = (prompt: string) => generateText("You are a creative tattoo artist. Brainstorm 3 unique tattoo ideas based on the user's prompt. Describe the visual elements, style, and potential placement for each idea.", prompt);
export const generatePoetry = (prompt: string) => generateText("You are a poet. Write a poem based on the user's prompt. Pay attention to imagery, meter, and tone.", prompt);
export const recommendMedia = (prompt: string) => generateText("You are a pop culture expert. The user will provide a movie or book they like. Recommend 3 similar movies or books and briefly explain why they would like them.", prompt);
export const writeParody = (prompt: string) => generateText("You are a satirist and parody writer. Rewrite the provided text or create a new piece on the given topic in a humorous, satirical, or parodic style.", prompt);
export const getPlantCareAdvice = (plant: string) => generateText("You are an expert botanist. Provide simple and clear care instructions for the specified plant. Include information on light, water, soil, and common issues.", plant);
export const getCarMaintenanceAdvice = (car: string) => generateText("You are an experienced car mechanic. Provide a general maintenance schedule and common advice for the specified car make and model.", car);
export const coachPublicSpeaking = (speech: string) => generateText("You are a public speaking coach. Analyze the provided speech text and offer feedback on its structure, clarity, and impact. Suggest areas for improvement.", speech);
export const planDiyProject = (project: string) => generateText("You are a DIY expert. Create a step-by-step plan for the user's project. Include a list of required materials and tools, and safety precautions. Format the output with clear markdown headings.", project);
export const rephraseText = (prompt: { text: string, tone: string }) => generateText(`You are an expert writer. Rephrase the following text to have a ${prompt.tone} tone.`, prompt.text);
export const generateIcebreakers = (context: string) => generateText("You are an expert at fostering connections. Generate 5 fun and appropriate icebreaker questions for the given context.", context);
export const generateAffirmations = (goal: string) => generateText("You are a life coach specializing in positive psychology. Create 5 personalized, positive affirmations to help the user achieve their goal. The affirmations should be short, in the present tense, and empowering. Output only the 5 affirmations, each on a new line, without numbers or bullet points.", `Goal: ${goal}`);
export const adviseOnConflict = (situation: string) => generateText("You are a conflict resolution advisor. Analyze the situation provided and suggest a calm, constructive approach to resolve the conflict. Provide sample phrasing using 'I' statements.", situation);
export const generateGitCommand = (task: string) => generateText("You are a Git expert. Convert the user's natural language request into the corresponding Git command. Provide the command and a brief explanation.", task);
export const craftElevatorPitch = (idea: string) => generateText("You are a startup coach. Take the user's idea and craft a compelling 30-second elevator pitch.", idea);
export const createBrandVoiceGuide = (description: string) => generateText("You are a branding strategist. Based on the company description, create a brand voice and tone guide. Include brand personality, tone words (do's and don'ts), and sample copy.", description);
export const assistWorldBuilding = (history: ChatMessage[]) => {
    const prompt = history.map(msg => `${msg.sender === 'user' ? 'User' : 'World Smith'}: ${msg.text}`).join('\n');
    return generateText("You are a creative partner and world-building assistant for a writer. The user will provide ideas for their fictional world. Your job is to ask clarifying questions, brainstorm related concepts, and help them flesh out the details of their world's history, cultures, magic systems, etc.", prompt);
};
export const generateHistoricalWhatIf = (scenario: string) => generateText("You are a historian specializing in counterfactual history. Explore the likely consequences of the 'what if' scenario provided by the user.", scenario);
export const suggestHobbies = (interests: string) => generateText("You are a hobby consultant. Based on the user's interests, suggest 5 hobbies they might enjoy and briefly explain why.", interests);
export const respondToTextMessage = (message: string) => generateText("You are an expert at social communication. The user needs help responding to a text message. Provide 3 different response options: one direct, one polite, and one funny.", `Help me respond to this text: "${message}"`);
export const adviseOnStyle = (prompt: string) => generateText("You are a personal stylist. Provide fashion advice and outfit suggestions based on the user's request (e.g., event, personal style, body type).", prompt);
export const interpretAstrology = (chartInfo: string) => generateText("You are an astrologer. Provide a simple, positive interpretation of the provided birth chart information (e.g., sun, moon, and rising signs). This is for entertainment purposes only.", chartInfo);
export const generateHaiku = (topic: string) => generateText("You are a Haiku poet. Write a haiku (5-7-5 syllables) about the given topic.", topic);
export const explainAcronym = (acronym: string) => generateText("You are a helpful AI assistant. Explain the meaning of the provided acronym. If there are multiple common meanings, list the most relevant ones.", acronym);
export const generateSlogan = (product: string) => generateText("You are a marketing copywriter. Generate 5 catchy slogans or taglines for the given product or company.", product);
export const generateApiPayload = (description: string) => generateText("You are a senior software engineer. Based on the user's description of an API endpoint, generate a realistic sample JSON payload for a request. Format it as a code block.", description);
export const explainSystemDesign = (concept: string) => generateText("You are a principal software engineer. Explain the high-level system design concept provided by the user in an easy-to-understand way. Use analogies if helpful.", concept);
export const estimateCloudCosts = (description: string) => generateText("You are a cloud solutions architect. Based on the user's application description, provide a high-level, estimated monthly cloud cost breakdown. Make reasonable assumptions about traffic and resource usage. Include a disclaimer that this is a rough estimate.", description);
export const explainSecurityVulnerability = (vulnerability: string) => generateText("You are a cybersecurity expert. Explain the specified security vulnerability in simple terms. Describe how it works, what the risks are, and how to prevent it.", vulnerability);
export const generateQbr = (data: string) => generateText("You are a business strategist. Take the provided quarterly data and generate a structured outline and key talking points for a Quarterly Business Review (QBR) presentation.", data);
export const writeSalesSequence = (product: string) => generateText("You are a sales expert. Write a 3-step cold email sequence to sell the described product. Each email should have a clear goal.", product);
export const draftInvestorUpdate = (updates: string) => generateText("You are a startup founder. Draft a concise and professional monthly investor update based on the provided bullet points.", updates);
export const analyzeFinancialStatement = (statement: string) => generateText("You are a financial analyst. Provide a summary and high-level analysis of the provided financial statement. Point out key positive and negative indicators. This is not financial advice.", statement);
export const estimateMarketSize = (product: string) => generateText("You are a market research analyst. Provide a high-level market sizing estimate (TAM, SAM, SOM) for the described product. Explain your reasoning and assumptions.", product);
export const formatScreenplay = (text: string) => generateText("You are a screenplay editor. Take the user's text and format it into standard screenplay format. Correctly identify scene headings, character names, dialogue, and action lines.", text);
export const createMagicSystem = (prompt: string) => generateText("You are a fantasy author. Brainstorm a unique magic system based on the user's prompt. Describe its source, rules, costs, and limitations.", prompt);
export const writeStandUpJoke = (topic: string) => generateText("You are a stand-up comedian. Write a short stand-up joke or bit based on the user's topic.", topic);
export const suggestArchitecturalStyle = (prompt: string) => generateText("You are an architect. Based on the user's preferences (e.g., location, climate, aesthetic), suggest a suitable architectural style for their building and explain why.", prompt);
export const generateHypothesis = (topic: string) => generateText("You are a research scientist. Based on the research area provided, generate 3 testable scientific hypotheses.", topic);
export const identifyLiteraryDevice = (text: string) => generateText("You are a literary critic. Analyze the provided text and identify any literary devices used (e.g., metaphor, simile, personification, alliteration, irony). For each device found, provide the quoted text where it appears and a brief explanation of how it functions in the text. Format your response using markdown with clear headings for each device.", text);
export const generateThoughtExperiment = (topic: string) => generateText("You are a philosopher. Create an interesting and thought-provoking thought experiment related to the user's topic.", topic);
export const generateCounterArgument = (argument: string) => generateText("You are a debate champion. Provide a strong counter-argument to the user's statement. Address their points and present an alternative perspective.", argument);
export const identifyCognitiveBias = (scenario: string) => generateText("You are a behavioral psychologist. Analyze the provided scenario and identify any potential cognitive biases at play. Explain how they might be influencing judgment.", scenario);
export const createSkincareRoutine = (prompt: string) => generateText("You are a dermatologist. Based on the user's skin type and concerns, create a simple morning and evening skincare routine. Suggest types of products to use. Include a disclaimer that this is not medical advice.", prompt);
export const suggestMealPrep = (prompt: string) => generateText("You are a nutritionist and chef. Suggest 3 easy meal prep ideas based on the user's dietary preferences and goals.", prompt);
export const generateJournalingPrompts = (topic: string) => generateText("You are a therapist specializing in journal therapy. Generate 5 thoughtful journaling prompts related to the user's topic to encourage self-reflection.", topic);
export const writeWeddingVow = (prompt: string) => generateText("You are a romantic writer. Help the user write heartfelt and personal wedding vows based on the information they provide about their partner and relationship.", prompt);
export const generateExcuse = (situation: string) => generateText("You are a creative excuse generator (for entertainment purposes only). Provide 3 excuses for the given situation: one plausible, one funny, and one wildly outlandish.", situation);
export const adviseOnEtiquette = (situation: string) => generateText("You are an etiquette expert. Provide advice on the proper etiquette for the social or professional situation described by the user.", situation);
export const analyzeRecipeNutrition = (recipe: string) => generateText("You are a nutritionist. Analyze the provided recipe and give an estimated nutritional breakdown (calories, protein, carbs, fat) and suggestions for making it healthier. Include a disclaimer that this is an estimate.", recipe);
export const mapArgument = (argument: string) => generateText("You are a logician. Take the user's argument and map it out in a structured format, identifying premises and conclusions. Format using markdown.", argument);
export const checkWorkoutForm = (description: string) => generateText("You are a certified personal trainer. Based on the user's description of how they perform an exercise, provide feedback on their form and suggest improvements for safety and effectiveness. Structure your feedback with clear headings (e.g., 'Positive Points', 'Areas for Improvement', 'Key Cues'). Always start your response with a clear disclaimer: 'Disclaimer: I am an AI assistant and not a certified personal trainer. This feedback is based on the text you provided and is for informational purposes only. It is not a substitute for professional, in-person coaching. Always prioritize safety and consult with a qualified professional before starting any new exercise program.'", description);
export const scaleRecipe = (prompt: { recipe: string, servings: string }) => generateText(
    `You are an expert chef. Take the following recipe and scale the ingredients to a new number of servings. Also, suggest modifications if requested (e.g., make it vegan, gluten-free). Rewrite the entire recipe with the adjusted quantities and instructions. Format the output with clear markdown headings for 'Ingredients' and 'Instructions'.`, 
    `Original Recipe:\n${prompt.recipe}\n\nNew Servings/Modifications: ${prompt.servings}`
);
export const analyzeSentiment = (text: string) => generateText("You are a sentiment analysis expert. Analyze the following text and determine if the sentiment is Positive, Negative, or Neutral. Provide a brief explanation for your choice.", text);


// JSON Generators
export const createRecipe = (ingredients: string) => generateJson(
    "You are a creative chef. Generate a detailed recipe based on the list of ingredients provided by the user.",
    `Ingredients: ${ingredients}`,
    {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING }, description: { type: Type.STRING }, prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING }, servings: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions"]
    }
);

export const createFitnessPlan = (prompt: { goal: string, days: string, level: string }) => generateJson(
    "You are a certified personal trainer. Create a weekly fitness plan based on the user's goals, available days, and fitness level.",
    `Goal: ${prompt.goal}, Days per week: ${prompt.days}, Fitness level: ${prompt.level}`,
    {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING }, goal: { type: Type.STRING }, duration: { type: Type.STRING },
            frequency: { type: Type.STRING },
            schedule: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { day: { type: Type.STRING }, workout: { type: Type.STRING }, focus: { type: Type.STRING } },
                    required: ["day", "workout", "focus"]
                }
            }
        },
        required: ["title", "goal", "duration", "frequency", "schedule"]
    }
);

export const planTravel = (prompt: { destination: string, duration: string, interests: string }) => generateJson(
    "You are an expert travel agent. Create a detailed, day-by-day travel itinerary based on the user's request.",
    `Destination: ${prompt.destination}, Duration: ${prompt.duration}, Interests: ${prompt.interests}`,
    {
        type: Type.OBJECT,
        properties: {
            destination: { type: Type.STRING }, duration: { type: Type.STRING }, budget: { type: Type.STRING },
            dailyPlan: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.INTEGER }, title: { type: Type.STRING },
                        activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                        diningSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["day", "title", "activities", "diningSuggestions"]
                }
            }
        },
        required: ["destination", "duration", "budget", "dailyPlan"]
    }
);

export const buildResume = (text: string) => generateJson(
    "You are a professional resume builder. Analyze the user's provided career information and structure it into a professional resume format. Refine the language to be more impactful and action-oriented.",
    text,
    {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            experiences: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        company: { type: Type.STRING }, role: { type: Type.STRING },
                        date: { type: Type.STRING },
                        points: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["company", "role", "date", "points"]
                }
            },
            education: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        institution: { type: Type.STRING }, degree: { type: Type.STRING }, date: { type: Type.STRING }
                    },
                    required: ["institution", "degree", "date"]
                }
            },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "experiences", "education", "skills"]
    }
);

export const createCharacter = (description: string) => generateJson(
    "You are a creative writer and character designer. Based on the user's description, create a detailed character profile.",
    description,
    {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING }, age: { type: Type.INTEGER }, appearance: { type: Type.STRING },
            personality: { type: Type.STRING }, backstory: { type: Type.STRING }
        },
        required: ["name", "age", "appearance", "personality", "backstory"]
    }
);

export const generateDomainNames = (keywords: string) => generateJson(
    "You are a domain name specialist. Generate 5 creative and brandable domain name suggestions based on the user's keywords. For each suggestion, indicate if it's likely available and provide a brief reason for the suggestion.",
    `Keywords: ${keywords}`,
    {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING }, available: { type: Type.BOOLEAN }, reason: { type: Type.STRING }
            },
            required: ["name", "available", "reason"]
        }
    }
);

export const generateColorPalette = (prompt: string) => generateJson(
    "You are a professional designer. Generate a color palette with 5 harmonious colors based on the user's theme or prompt. Provide the name of the palette and the hex codes for each color.",
    prompt,
    {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            hexCodes: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["name", "hexCodes"]
    }
);

export const generateSwotAnalysis = (companyInfo: string) => generateJson(
    "You are a business strategist. Conduct a SWOT analysis based on the provided company information.",
    companyInfo,
    {
        type: Type.OBJECT,
        properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            threats: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["strengths", "weaknesses", "opportunities", "threats"]
    }
);

export const createGtmStrategy = (productInfo: string) => generateJson(
    "You are a marketing strategist. Generate a Go-To-Market (GTM) strategy outline for the provided product.",
    `Product Info: ${productInfo}`,
    {
        type: Type.OBJECT,
        properties: {
            targetAudience: { type: Type.STRING }, valueProposition: { type: Type.STRING },
            channels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Marketing and distribution channels" },
            marketingInitiatives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key marketing campaigns or actions" },
            successMetrics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "KPIs to measure success" }
        },
        required: ["targetAudience", "valueProposition", "channels", "marketingInitiatives", "successMetrics"]
    }
);

export const generateDebateTopic = (theme: string) => generateJson(
    "You are a debate coach. Generate a compelling debate topic based on the user's theme. Provide a list of key arguments for both the 'Pro' and 'Con' sides.",
    `Theme: ${theme}`,
    {
        type: Type.OBJECT,
        properties: {
            topic: { type: Type.STRING },
            pro: { type: Type.ARRAY, items: { type: Type.STRING } },
            con: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["topic", "pro", "con"]
    }
);

export const generateGiftIdeas = (prompt: { recipient: string, age: string, interests: string, budget: string }) => generateJson(
    "You are an expert gift-giving consultant. Based on the user's description, generate 3 unique and thoughtful gift ideas.",
    `Recipient: ${prompt.recipient}, Age: ${prompt.age}, Interests: ${prompt.interests}, Budget: ${prompt.budget}`,
    {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                idea: { type: Type.STRING },
                reason: { type: Type.STRING },
                estimatedCost: { type: Type.STRING }
            },
            required: ["idea", "reason", "estimatedCost"]
        }
    }
);

export const interpretDream = (dream: string) => generateJson(
    "You are a dream interpreter, drawing on common symbolic meanings from psychology and mythology. Analyze the user's dream and provide a possible interpretation, highlighting key themes.",
    `Dream: ${dream}`,
    {
        type: Type.OBJECT,
        properties: {
            dream: { type: Type.STRING },
            themes: { type: Type.ARRAY, items: { type: Type.STRING } },
            interpretation: { type: Type.STRING }
        },
        required: ["dream", "themes", "interpretation"]
    }
);

// All new JSON generators
export const outlineBusinessPlan = (idea: string): Promise<BusinessPlanSection[]> => generateJson(
    "You are a business consultant. Create a concise business plan outline based on the user's idea. Provide the main sections (e.g., Executive Summary, Market Analysis) with bullet points for each.",
    idea,
    { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "content"] } }
);

export const createBudgetPlan = (prompt: { income: string, expenses: string }): Promise<BudgetPlan> => generateJson(
    "You are a financial planner. Create a simple monthly budget plan based on the user's income and expenses. Categorize expenses and calculate totals.",
    `Income: ${prompt.income}, Expenses: ${prompt.expenses}`,
    { type: Type.OBJECT, properties: { income: { type: Type.NUMBER }, categories: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, allocated: { type: Type.NUMBER }, spent: { type: Type.NUMBER, default: 0 } }, required: ["name", "allocated"] } } }, required: ["income", "categories"] }
);

export const createStudyGuide = (topic: string): Promise<StudyGuide> => generateJson(
    "You are an expert educator. Generate a study guide for the given topic. Include key concepts with brief explanations, and some practice questions.",
    topic,
    { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, keyConcepts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { concept: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["concept", "explanation"] } }, practiceQuestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["topic", "keyConcepts", "practiceQuestions"] }
);

export const optimizeItinerary = (itinerary: string): Promise<ItineraryOptimization> => generateJson(
    "You are an expert travel agent and logistics coordinator. Analyze the provided travel itinerary and optimize it for efficiency (e.g., geographical clustering of activities, better use of time). Provide the optimized plan and suggestions.",
    itinerary,
    { type: Type.OBJECT, properties: { optimizedPlan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.INTEGER }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["day", "activities"] } }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["optimizedPlan", "suggestions"] }
);

export const createPitchDeck = (idea: string): Promise<PitchDeckSlide[]> => generateJson(
    "You are a venture capitalist and startup coach. Create a 10-slide pitch deck outline for the user's business idea. For each slide, provide a title and key content points.",
    idea,
    { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { slideNumber: { type: Type.INTEGER }, title: { type: Type.STRING }, content: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["slideNumber", "title", "content"] } }
);

export const generateMindMap = (topic: string): Promise<MindMapNode> => generateJson(
    "You are an expert at structuring information. Create a mind map for the given central topic. Generate a root node with several main branches, and add a few sub-branches to each. Keep text concise.",
    topic,
    { type: Type.OBJECT, properties: { id: { type: Type.STRING }, text: { type: Type.STRING }, children: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, text: { type: Type.STRING }, children: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, text: { type: Type.STRING } }, required: ["id", "text"] } } }, required: ["id", "text"] } } }, required: ["id", "text"] }
);

export const analyzeInvestment = (ticker: string): Promise<InvestmentSummary> => generateJson(
    "You are a financial analyst. Provide a brief, neutral summary of the company associated with the stock ticker provided. Include a few key positive and negative points, and an overall sentiment. This is not financial advice.",
    `Analyze stock ticker: ${ticker}`,
    { type: Type.OBJECT, properties: { ticker: { type: Type.STRING }, companyName: { type: Type.STRING }, summary: { type: Type.STRING }, keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }, sentiment: { type: Type.STRING, description: "'Positive', 'Negative', or 'Neutral'" } }, required: ["ticker", "companyName", "summary", "keyPoints", "sentiment"] }
);

export const analyzeContract = (contract: string): Promise<LegalSummary> => generateJson(
    "You are an AI legal assistant. Analyze the provided contract text. Identify the document type, summarize the key clauses, and provide an overall summary. Highlight the potential risk level for each key clause. This is not legal advice.",
    contract,
    { type: Type.OBJECT, properties: { documentType: { type: Type.STRING }, keyClauses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { clause: { type: Type.STRING }, summary: { type: Type.STRING }, potentialRisk: { type: Type.STRING, description: "'High', 'Medium', 'Low', or 'None'" } }, required: ["clause", "summary", "potentialRisk"] } }, overallSummary: { type: Type.STRING } }, required: ["documentType", "keyClauses", "overallSummary"] }
);

export const planMeal = (prompt: string) => generateJson(
    "You are a nutritionist. Create a 3-day meal plan based on the user's dietary preferences and goals. Include breakfast, lunch, and dinner for each day.",
    prompt,
    { type: Type.OBJECT, properties: { planTitle: { type: Type.STRING }, dailyPlan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.INTEGER }, breakfast: { type: Type.STRING }, lunch: { type: Type.STRING }, dinner: { type: Type.STRING } }, required: ["day", "breakfast", "lunch", "dinner"] } } }, required: ["planTitle", "dailyPlan"] }
);

export const generateCustomerPersona = (info: string): Promise<CustomerPersona> => generateJson("You are a marketing strategist. Create a detailed customer persona based on the provided information.", info, { type: Type.OBJECT, properties: { name: { type: Type.STRING }, age: { type: Type.INTEGER }, jobTitle: { type: Type.STRING }, goals: { type: Type.ARRAY, items: { type: Type.STRING } }, painPoints: { type: Type.ARRAY, items: { type: Type.STRING } }, bio: { type: Type.STRING } }, required: ["name", "age", "jobTitle", "goals", "painPoints", "bio"] });
export const planEvent = (info: string): Promise<EventPlan> => generateJson("You are a professional event planner. Create an event plan with a timeline and checklist based on the user's event description.", info, { type: Type.OBJECT, properties: { eventName: { type: Type.STRING }, theme: { type: Type.STRING }, timeline: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timeframe: { type: Type.STRING }, task: { type: Type.STRING } }, required: ["timeframe", "task"] } }, checklist: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["eventName", "theme", "timeline", "checklist"] });
export const generateOkr = (info: string): Promise<Okr> => generateJson("You are a business management consultant. Based on the user's goal, generate a clear Objective and 3-5 measurable Key Results (OKRs).", info, { type: Type.OBJECT, properties: { objective: { type: Type.STRING }, keyResults: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { result: { type: Type.STRING }, metric: { type: Type.STRING } }, required: ["result", "metric"] } } }, required: ["objective", "keyResults"] });
export const generateGddOutline = (info: string): Promise<GddSection[]> => generateJson("You are a video game producer. Create a high-level Game Design Document (GDD) outline based on the user's game concept.", info, { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "points"] } });
export const createCocktailRecipe = (info: string): Promise<CocktailRecipe> => generateJson("You are a master mixologist. Create a unique cocktail or mocktail recipe based on the ingredients and flavors provided by the user.", info, { type: Type.OBJECT, properties: { name: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }, instructions: { type: Type.ARRAY, items: { type: Type.STRING } }, garnish: { type: Type.STRING } }, required: ["name", "ingredients", "instructions", "garnish"] });
export const generateBoardGameIdea = (info: string): Promise<BoardGameIdea> => generateJson("You are a creative board game designer. Brainstorm a unique board game concept based on the user's theme.", info, { type: Type.OBJECT, properties: { title: { type: Type.STRING }, playerCount: { type: Type.STRING }, theme: { type: Type.STRING }, mechanics: { type: Type.ARRAY, items: { type: Type.STRING } }, shortDescription: { type: Type.STRING } }, required: ["title", "playerCount", "theme", "mechanics", "shortDescription"] });
export const generatePersonalizedTrivia = (info: string): Promise<TriviaQuestion[]> => generateJson("You are a trivia host. Create 5 trivia questions and answers based on the user's specified topic or person.", info, { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } }, required: ["question", "answer"] } });
export const createHomeDeclutteringPlan = (info: string): Promise<DeclutterTask[]> => generateJson("You are a professional organizer. Create a step-by-step decluttering plan for the room or area described by the user.", info, { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { area: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["area", "steps"] } });
export const generateUserStories = (info: string): Promise<UserStory[]> => generateJson("You are an agile product manager. Write 3 user stories in the standard format ('As a [user], I want to [goal], so that [reason].') based on the feature description. Include acceptance criteria for each.", info, { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { userType: { type: Type.STRING }, goal: { type: Type.STRING }, reason: { type: Type.STRING }, acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["userType", "goal", "reason", "acceptanceCriteria"] } });
export const generateQuiz = (info: string): Promise<QuizQuestion[]> => generateJson("You are a quiz master. Create a 5-question multiple-choice quiz on the given topic. Provide the question, 4 options, and indicate the correct answer.", info, { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING } }, required: ["question", "options", "correctAnswer"] } });
export const findDietaryRecipe = (info: string): Promise<DietaryRecipe> => generateJson("You are a chef specializing in dietary restrictions. Take the user's request for a recipe and a dietary need (e.g., gluten-free, vegan) and provide a suitable recipe.", info, { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, dietaryMatch: { type: Type.ARRAY, items: { type: Type.STRING } }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }, instructions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "description", "dietaryMatch", "ingredients", "instructions"] });

// Virtual Try-On Services for FitCheck
const VIRTUAL_TRY_ON_API_KEY = 'AIzaSyBEp-5-x5HNd_u3Hxv45-130obw7UEgeo4';
const virtualTryOnAI = new GoogleGenAI({ apiKey: VIRTUAL_TRY_ON_API_KEY });

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
}

const dataUrlToPart = (dataUrl: string) => {
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
}

const handleVirtualTryOnResponse = (response: any): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    for (const candidate of response.candidates ?? []) {
        const imagePart = candidate.content?.parts?.find((part: any) => part.inlineData);
        if (imagePart?.inlineData) {
            const { mimeType, data } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        throw new Error(errorMessage);
    }
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image. ` + (textFeedback ? `The model responded with text: "${textFeedback}"` : "This can happen due to safety filters or if the request is too complex. Please try a different image.");
    throw new Error(errorMessage);
};

export const generateModelImage = async (userImage: File): Promise<string> => {
    const userImagePart = await fileToPart(userImage);
    const prompt = "You are an expert fashion photographer AI. Transform the person in this image into a full-body fashion model photo suitable for an e-commerce website. The background must be a clean, neutral studio backdrop (light gray, #f0f0f0). The person should have a neutral, professional model expression. Preserve the person's identity, unique features, and body type, but place them in a standard, relaxed standing model pose. The final image must be photorealistic. Return ONLY the final image.";
    const response = await virtualTryOnAI.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [userImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleVirtualTryOnResponse(response);
};

export const generateVirtualTryOnImage = async (modelImageUrl: string, garmentImage: File): Promise<string> => {
    const modelImagePart = dataUrlToPart(modelImageUrl);
    const garmentImagePart = await fileToPart(garmentImage);
    const prompt = `You are an expert virtual try-on AI. You will be given a 'model image' and a 'garment image'. Your task is to create a new photorealistic image where the person from the 'model image' is wearing the clothing from the 'garment image'.

**Crucial Rules:**
1.  **Complete Garment Replacement:** You MUST completely REMOVE and REPLACE the clothing item worn by the person in the 'model image' with the new garment. No part of the original clothing (e.g., collars, sleeves, patterns) should be visible in the final image.
2.  **Preserve the Model:** The person's face, hair, body shape, and pose from the 'model image' MUST remain unchanged.
3.  **Preserve the Background:** The entire background from the 'model image' MUST be preserved perfectly.
4.  **Apply the Garment:** Realistically fit the new garment onto the person. It should adapt to their pose with natural folds, shadows, and lighting consistent with the original scene.
5.  **Output:** Return ONLY the final, edited image. Do not include any text.`;
    const response = await virtualTryOnAI.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [modelImagePart, garmentImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleVirtualTryOnResponse(response);
};

export const generatePoseVariation = async (tryOnImageUrl: string, poseInstruction: string): Promise<string> => {
    const tryOnImagePart = dataUrlToPart(tryOnImageUrl);
    const prompt = `You are an expert fashion photographer AI. Take this image and regenerate it from a different perspective. The person, clothing, and background style must remain identical. The new perspective should be: "${poseInstruction}". Return ONLY the final image.`;
    const response = await virtualTryOnAI.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [tryOnImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleVirtualTryOnResponse(response);
};