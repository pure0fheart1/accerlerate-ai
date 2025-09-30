import { GoogleGenAI } from '@google/genai';

// This will work on Vercel as an API route
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, image } = req.body;

    if (!prompt || !image) {
      return res.status(400).json({ error: 'Missing prompt or image' });
    }

    const apiKey = process.env.VITE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const genAI = new GoogleGenAI({ apiKey });

    const model = genAI.models.generateContent;

    // Make the API call to Gemini
    const response = await model({
      model: 'gemini-2.5-flash-image-preview',
      config: {
        responseModalities: ['TEXT', 'IMAGE']
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: image,
                mimeType: 'image/jpeg'
              }
            }
          ]
        }
      ]
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No candidates in response');
    }

    const inlineDataPart = response.candidates[0].content.parts.find(
      (p: any) => p.inlineData
    );

    if (!inlineDataPart) {
      throw new Error('No inline data found in response');
    }

    const imageData = inlineDataPart.inlineData.data;

    return res.status(200).json({ image: imageData });

  } catch (error) {
    console.error('Error in gemini-vision API:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}