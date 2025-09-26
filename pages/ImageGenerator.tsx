import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { generateImages } from '../services/geminiService';
import { LoaderIcon, ImageIcon, SparklesIcon, AlertTriangleIcon, TrashIcon, XIcon } from '../components/icons';
import Modal from '../components/Modal';
import { VoiceInputButton } from '../components/VoiceInputButton';

const MAX_HISTORY = 10;
const HISTORY_KEY = 'promptHistory';

const ART_STYLES = [
    "Baroque", "Rococo", "Neoclassicism", "Romanticism", "Realism", "Impressionism", "Post-Impressionism", "Expressionism", "Fauvism", "Cubism", "Surrealism", "Dadaism", "Futurism", "Art Nouveau", "Art Deco", "Bauhaus", "Minimalism", "Abstract Expressionism", "Pop Art", "Op Art", "Watercolor", "Oil Painting", "Acrylic", "Gouache", "Ink Wash (Sumi-e)", "Crosshatching", "Etching", "Woodcut", "Linocut", "Fresco", "Line Art", "Chiaroscuro", "Stippling", "Pencil Realism", "Digital Sketch", "Contour Drawing", "Scribble Art", "Doodle Art", "Zentangle", "Architectural Drafting", "Concept Art", "Geometric Abstraction", "Lyrical Abstraction", "Tachisme", "Suprematism", "Constructivism", "Automatism", "Kinetic Art", "Generative Art", "Algorithmic Art", "Low-Poly", "Pixel Art", "Vector Art", "3D Render (Blender/Cinema4D)", "Photobashing", "Matte Painting", "Isometric Art", "Glitch Art", "Vaporwave", "Synthwave", "Fluid Art", "Neurography", "Fractal Art", "Data-Driven Art", "AR Art (Augmented Reality)", "NFT Aesthetic", "AI Collage", "Mixed Media Mashup", "Style Transfer Art", "Motion Graphics Art", "Fairycore", "Dreamcore", "Weirdcore", "Cottagecore", "Goblincore", "Magical Realism", "Mythopoeia Art", "Celestial Aesthetic", "Tarot Art Style", "Phantasmagoria", "Aboriginal Dot Painting", "Mesoamerican Revival", "Byzantine Iconography", "Persian Miniature", "Japanese Ukiyo-e", "Chinese Brush Painting", "Indian Madhubani", "African Tribal Art", "Russian Lubok", "Native American Ledger Art", "Biopunk", "Cyberpunk", "Steampunk", "Dark Fantasy", "Gothic Art", "Horrorcore", "Art Brut", "Zettiology", "Xeno-Art", "Post-Apocalyptic", "Comic Book Style", "Manga", "Anime (Classic)", "Chibi", "Kawaii", "Disney-Inspired", "Pixar Style", "Ghibli Style", "Superflat", "Western Animation Style", "Vaporwave Retro", "Y2K Aesthetic", "80s Neon Noir", "90s Cartoon Grunge", "Memphis Design", "Retro Futurism", "Mid-Century Modern", "Vintage Propaganda Poster", "Psychedelic 60s", "Analog Horror Aesthetic", "Mosaic", "Collage", "Textile Art", "Quilting", "Stained Glass", "Ceramic Glaze Art", "Metal Embossing", "Woodburning (Pyrography)", "Encaustic Wax Painting", "Papier-Mch", "HUD/Overlay Style", "Game UI Art", "Roguelike Pixel Grid", "16-bit/32-bit RPG Look", "VR Art", "Dungeon Map Illustration", "Loot Icon Art", "Card Game Style", "Metroidvania Vibe", "Idle Clicker UI Design", "Tarot Card Style", "Mandala Art", "Alchemical Diagrams", "Occult Illustration", "Sacred Geometry", "Rune & Sigil Art", "Kabbalistic Tree Art", "Mythological Engraving", "Gothic Manuscript Style", "Pagan Folk Art", "Inuit Printmaking", "Scandinavian Folk", "Mori Kwhaiwhai", "Korean Minhwa", "Thai Mural Art", "Tibetan Thangka", "Andean Woven Motif", "Eastern Orthodox Iconography", "Sami Duodji Art", "Filipino Tribal Tattoo Style", "Noir Style (Film Noir, high contrast)", "Cinematic Color Grading", "Sepia Tone Vintage", "Hyperrealist Photography", "Long Exposure Light Art", "Tilt-Shift Aesthetic", "Lens Distortion Effect", "Overexposed Glare Art", "Fisheye Perspective", "Cinemagraph (looped frame)", "Haute Couture Illustration", "Streetwear Art Style", "Vaporgrunge", "Alt-Girl Aesthetic", "Harajuku Style", "Makeup SFX Illustration", "Runway Pose Drawing", "Cyber Lolita", "High Fashion Sketch", "Cosplay Design Art", "Circuscore", "Clowncore", "Masquerade Illustration", "Commedia dellArte Style", "Vaudeville Aesthetic", "Cabaret Poster Style", "Puppetry Concept Art", "Theater Set Concept Sketch", "Mime Art", "Drag Queen Poster Aesthetic", "Lofi Art", "Corecore", "Blingee Style", "ASCII Art", "Rage Comic Aesthetic", "Flash Animation Style", "Slideshow Meme Look", "Collagecore", "Anti-Aesthetic", "Shanzhai Art", "Hellenistic Sculpture Style", "Roman Fresco", "Assyrian Bas-Relief", "Etruscan Pottery Style", "Celtic Knotwork Art", "Gothic Stained Glass", "Islamic Geometric Art", "Ottoman Miniature", "Mughal Painting", "Moorish Tile Pattern", "Khmer Temple Carving", "Babylonian Cylinder Seal Style", "Inca Textile Art", "Aztec Codex Illustration", "Ancient Greek Black-Figure", "Phoenician Glyphic Style", "Sassanid Empire Art", "Byzantine Mosaic", "Scythian Animal Style", "Paleolithic Cave Drawing", "Anatomical Illustration", "Botanical Plate Drawing", "Astrological Chart Aesthetic", "Mathematical Diagram Art", "Infographic Art", "Technical Blueprint Style", "X-ray Overlay Art", "MRI Color Mapping Style", "Fluid Dynamics Visualization", "Periodic Table Aesthetic", "Molecular Model Render", "Topographical Map Art", "Weather Radar Visual", "Satellite Imagery Aesthetic", "Solar System Chart Art", "Physics Chalkboard Sketch", "DNA Sequence Art", "Optical Illusion Grid", "Space-Time Diagram", "Quantum Field Sketch", "Rug Hooking Pattern", "Loom Weaving Illustration", "Cross-Stitch Pixel Style", "Macrame Wall Art", "Papier Coll", "Bone Carving Pattern", "Bead Loom Design", "Basket Weaving Art", "Felt Craft Style", "Tin Punching Pattern", "Clay Imprint Mosaic", "Found Object Sculpture", "Sand Mandala", "Mudcloth Print", "Shell Mosaic Design", "String Art", "Scrap Quilt Layout", "Dye-Sublimation Style", "Whittling Aesthetic", "Embroidery Hoops Art", "Synesthetic Art", "Lucid Dream Art", "Sleep Paralysis Illustration", "Hypnagogic Hallucination Style", "Psytrance Poster Art", "Paranoiac-Critical Method", "Escher-Style Impossible Geometry", "Mind Map Visual Style", "Dj Vu Aesthetic", "Tulpamancy Visualization", "Mirror Dimension Art", "Dissociation Vibe Art", "Visual Snow Simulation", "Double Exposure Surrealism", "False Memory Visual Art", "Fractal-Based Kaleidoscope", "Inner Child Doodle Style", "Repression Symbolism", "Liminal Space Illustration", "Dream Journal Collage", "GAN Mutation Art", "Latent Diffusion Style", "Text-to-Image Glitch Render", "Neural Network Portrait", "AI-Generated Pixel Drift", "Algorithmic Collage", "Cybernetic Anatomy", "Neural Aesthetic Mapping", "Cyborg Body Horror", "Code Visualizer Aesthetic", "AI-Hallucination Imagery", "Prompt Layered Style", "Semantic Confusion Art", "Stable Diffusion Abstract", "DeepDream Mutations", "Text Glitch Overlay", "ASCII Matrix Drip", "Code-as-Art Terminal Style", "Pseudo-Real Facial Merge", "Generative Pixel Clusters", "Ancient Grimoire Style", "Bestiary Page Illustration", "Fantasy Map Cartography", "Elven Scrollwork Art", "Dwarven Rune Stone Style", "Arcane Glyphic Diagram", "Dragon Hoard Painting", "Magic Item Card Art", "Sorcerer Spell Diagram", "Dungeon Crawl Art", "Necromantic Grunge"
];

interface ImageGeneratorProps {
  sharedPrompt: string;
  setSharedPrompt: (prompt: string) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ sharedPrompt, setSharedPrompt }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [numImages, setNumImages] = useState<number>(2);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [styleSearchTerm, setStyleSearchTerm] = useState('');
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const styleInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setPromptHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse prompt history from localStorage", e);
      setPromptHistory([]);
    }
  }, []);

  useEffect(() => {
    if (sharedPrompt) {
      setPrompt(sharedPrompt);
      setSharedPrompt(''); // Reset the shared prompt after using it
    }
  }, [sharedPrompt, setSharedPrompt]);

  const addStyle = (style: string) => {
    if (!selectedStyles.includes(style)) {
        setSelectedStyles(prev => [...prev, style]);
    }
    setStyleSearchTerm('');
    setIsStyleDropdownOpen(false);
  };

  const removeStyle = (styleToRemove: string) => {
      setSelectedStyles(prev => prev.filter(style => style !== styleToRemove));
  };

  const filteredStyles = useMemo(() => {
      if (!styleSearchTerm) {
          return ART_STYLES.filter(style => !selectedStyles.includes(style)).slice(0, 100);
      }
      return ART_STYLES.filter(style => 
          !selectedStyles.includes(style) &&
          style.toLowerCase().includes(styleSearchTerm.toLowerCase())
      );
  }, [selectedStyles, styleSearchTerm]);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (styleInputRef.current && !styleInputRef.current.contains(event.target as Node)) {
              setIsStyleDropdownOpen(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [styleInputRef]);

  const updateHistory = useCallback((newPrompt: string) => {
    if (!newPrompt.trim()) return;

    setPromptHistory(currentHistory => {
        const updatedHistory = [
            newPrompt,
            ...currentHistory.filter(p => p !== newPrompt)
        ].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
    });
  }, []);

  const handleHistorySelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const handleClearHistory = () => {
    setPromptHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleGenerate = useCallback(async () => {
    const finalPrompt = [prompt.trim(), ...selectedStyles].filter(Boolean).join(', ');

    if (!finalPrompt) {
      setError("Please provide a prompt or select an art style.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);
    try {
      const result = await generateImages(finalPrompt, numImages);
      setGeneratedImages(result);
      updateHistory(prompt);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, numImages, updateHistory, selectedStyles]);

  const isGenerateDisabled = useMemo(() => isLoading || (!prompt.trim() && selectedStyles.length === 0), [isLoading, prompt, selectedStyles]);
  
  return (
    <>
      <div className="min-h-full flex flex-col max-w-7xl mx-auto w-full">
          {/* Improved Header with better visual hierarchy */}
          <header className="text-center mb-12 px-4">
              <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-3xl shadow-lg">
                      <SparklesIcon className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">
                      AI Image Generator
                  </h1>
              </div>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-slate-400 font-light max-w-3xl mx-auto">Transform your ideas into stunning visuals with AI</p>
          </header>

          <main className="flex-grow grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-12 min-h-0 px-4 pb-8">
            {/* Left Panel - Form Controls */}
            <div className="xl:col-span-1 space-y-8">

              {/* Step 1: Prompt Input Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                    <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">1</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Describe your image</h2>
                </div>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'A majestic lion wearing a golden crown in a mystical forest'"
                    className="w-full p-6 bg-gray-50 dark:bg-slate-900/80 border-2 border-gray-200 dark:border-slate-600 rounded-2xl text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 h-40 resize-none pr-16 text-base leading-relaxed"
                    aria-label="Image description prompt"
                  />
                  <div className="absolute bottom-6 right-6">
                      <VoiceInputButton onTranscript={(transcript) => setPrompt(p => (p ? p.trim() + ' ' : '') + transcript)} />
                  </div>
                </div>
              </div>

              {/* Step 2: Art Styles Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                    <span className="text-base font-bold text-purple-600 dark:text-purple-400">2</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Art styles</h2>
                  <span className="text-sm text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">Optional</span>
                </div>
                <div className="relative" ref={styleInputRef}>
                  <div className="flex flex-wrap gap-3 mb-4 p-5 bg-gray-50 dark:bg-slate-900/80 border-2 border-gray-200 dark:border-slate-600 rounded-2xl min-h-[60px]">
                    {selectedStyles.map(style => (
                      <span key={style} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                        {style}
                        <button onClick={() => removeStyle(style)} className="text-indigo-100 hover:text-white transition-colors">
                          <XIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={styleSearchTerm}
                      onChange={(e) => {
                        setStyleSearchTerm(e.target.value);
                        setIsStyleDropdownOpen(true);
                      }}
                      onFocus={() => setIsStyleDropdownOpen(true)}
                      placeholder={selectedStyles.length === 0 ? "Search for art styles..." : ""}
                      className="flex-grow bg-transparent focus:outline-none p-2 text-base text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
                    />
                  </div>

                  {isStyleDropdownOpen && filteredStyles.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-2xl shadow-xl max-h-64 overflow-y-auto">
                      <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                        {filteredStyles.map(style => (
                          <li key={style}>
                            <button
                              onClick={() => addStyle(style)}
                              className="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                            >
                              {style}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Number of Images Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center">
                    <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">3</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Number of images</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                {[1, 2, 4].map(n => (
                    <button
                    key={n}
                    onClick={() => setNumImages(n)}
                    className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 text-base ${
                        numImages === n
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700'
                    }`}
                    aria-pressed={numImages === n}
                    >
                    {n} {n > 1 ? 'Images' : 'Image'}
                    </button>
                ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full py-6 px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 disabled:from-gray-500 disabled:via-gray-500 disabled:to-gray-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 disabled:hover:translate-y-0 flex items-center justify-center gap-4 text-xl"
                aria-label="Generate images"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="h-7 w-7" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-7 w-7" />
                    Generate Images
                  </>
                )}
              </button>
            </div>

            {/* Right Panel - Results and History */}
            <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

              {/* Results Area */}
              <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-slate-100 mb-8 flex items-center gap-4">
                  <ImageIcon className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                  Generated Images
                </h2>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 min-h-[36rem] border border-gray-200 dark:border-slate-700">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                      <div className="relative">
                        <LoaderIcon className="h-16 w-16 text-indigo-500 dark:text-indigo-400" />
                        <div className="absolute inset-0 h-16 w-16 border-4 border-indigo-200 dark:border-indigo-700 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-medium text-indigo-600 dark:text-indigo-300 mb-2">Creating your images...</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">This may take a few moments</p>
                      </div>
                    </div>
                  )}

                  {error && !isLoading && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-md">
                        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-2xl">
                          <AlertTriangleIcon className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4"/>
                          <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">Generation Error</h3>
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isLoading && !error && generatedImages && generatedImages.length > 0 && (
                    <div className={`grid gap-4 h-full ${generatedImages.length === 1 ? 'grid-cols-1' : generatedImages.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {generatedImages.map((imgSrc, index) => (
                        <div key={index} className="bg-white dark:bg-slate-700 rounded-2xl p-2 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={`Generated image ${index + 1}`}
                            className="object-cover w-full h-full rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-105 cursor-pointer"
                            onClick={() => setSelectedImage(imgSrc)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {!isLoading && !error && !generatedImages && (
                    <div className="flex flex-col items-center justify-center h-full gap-6 text-gray-500 dark:text-slate-500">
                      <div className="relative">
                        <ImageIcon className="h-24 w-24 opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <SparklesIcon className="h-12 w-12 text-indigo-300 dark:text-indigo-600" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium mb-2">Ready to create amazing images</p>
                        <p className="text-sm">Enter a description and click generate to get started</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* History Panel */}
              <div className="lg:col-span-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-3">
                      <svg className="h-6 w-6 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recent Prompts
                    </h3>
                    {promptHistory.length > 0 && (
                      <button
                        onClick={handleClearHistory}
                        className="text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-2 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label="Clear prompt history"
                      >
                        <TrashIcon className="h-5 w-5" />
                        Clear
                      </button>
                    )}
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-5 min-h-[32rem] max-h-[32rem] overflow-y-auto border border-gray-200 dark:border-slate-700">
                    {promptHistory.length > 0 ? (
                        <ul className="space-y-3">
                        {promptHistory.map((p, i) => (
                            <li key={i}>
                            <button
                                onClick={() => handleHistorySelect(p)}
                                className="w-full text-left p-4 rounded-xl bg-white/90 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 text-sm leading-relaxed shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700"
                                title={p}
                            >
                                <span className="line-clamp-3">{p}</span>
                            </button>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                            <svg className="h-12 w-12 text-gray-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500 dark:text-slate-500 text-sm font-medium mb-1">
                                No recent prompts
                            </p>
                            <p className="text-gray-400 dark:text-slate-600 text-xs">
                                Your prompt history will appear here
                            </p>
                        </div>
                    )}
                </div>
              </div>
            </div>
          </main>
      </div>
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage}
      />
    </>
  );
};

export default ImageGenerator;