
import React, { useState, useMemo, useEffect } from 'react';
import { BookOpenIcon, CopyIcon, SendIcon, XIcon, PlusIcon, TrashIcon } from '../components/icons';
import { Page } from '../App';
import { LibraryPrompt } from '../types';

const PROMPT_LIBRARY_KEY = 'accelerate-prompt-library';

const defaultPrompts: LibraryPrompt[] = [
    { id: 1, prompt: "A majestic cybernetic lion with glowing blue circuits, standing on a neon-lit cliff overlooking a futuristic city at night, rain pouring down.", category: 'Sci-Fi', style: 'Cyberpunk', imageUrl: 'https://picsum.photos/seed/prompt1/500/500' },
    { id: 2, prompt: "An ancient, moss-covered library hidden inside a giant, hollowed-out tree in an enchanted forest. Sunbeams filter through the canopy, illuminating dust motes.", category: 'Fantasy', style: 'Oil Painting', imageUrl: 'https://picsum.photos/seed/prompt2/500/500' },
    { id: 3, prompt: "A lone astronaut discovering a vibrant, alien jungle on a distant exoplanet. The plants are bioluminescent and the sky has two moons.", category: 'Sci-Fi', style: 'Photorealistic', imageUrl: 'https://picsum.photos/seed/prompt3/500/500' },
    { id: 4, prompt: "A whimsical portrait of a fox wearing a Victorian-era suit and a top hat, sipping tea in a cozy armchair. Detailed, character design.", category: 'Characters', style: 'Digital Sketch', imageUrl: 'https://picsum.photos/seed/prompt4/500/500' },
    { id: 5, prompt: "Expansive, breathtaking mountain range at sunrise, with a sea of clouds filling the valley below. Serene and majestic.", category: 'Landscapes', style: 'Cinematic Lighting', imageUrl: 'https://picsum.photos/seed/prompt5/500/500' },
    { id: 6, prompt: "An abstract explosion of color and geometric shapes, representing the concept of 'sound'. Dynamic, vibrant, and energetic.", category: 'Abstract', style: 'Generative Art', imageUrl: 'https://picsum.photos/seed/prompt6/500/500' },
    { id: 7, prompt: "A close-up shot of a hummingbird with iridescent feathers, frozen mid-air as it drinks nectar from a fuchsia flower. Macro photography, sharp details.", category: 'Animals', style: 'Macro View', imageUrl: 'https://picsum.photos/seed/prompt7/500/500' },
    { id: 8, prompt: "A powerful sorceress casting a complex spell, runes and arcane energy swirling around her hands. Dynamic pose, fantasy illustration.", category: 'Fantasy', style: 'Concept Art', imageUrl: 'https://picsum.photos/seed/prompt8/500/500' },
    { id: 9, prompt: "A beautifully detailed illustration of a futuristic, eco-friendly city where nature and technology coexist harmoniously. Solarpunk aesthetic.", category: 'Architecture', style: 'Solarpunk', imageUrl: 'https://picsum.photos/seed/prompt9/500/500' },
    { id: 10, prompt: "A steampunk-inspired mechanical owl with brass gears and glowing amber eyes, perched on a stack of old books.", category: 'Animals', style: 'Steampunk', imageUrl: 'https://picsum.photos/seed/prompt10/500/500' },
    { id: 11, prompt: "An ethereal ghost knight, clad in translucent armor, guarding a forgotten tomb in a misty graveyard. Gothic horror, atmospheric.", category: 'Characters', style: 'Gothic Art', imageUrl: 'https://picsum.photos/seed/prompt11/500/500' },
    { id: 12, prompt: "A serene Japanese Zen garden with raked sand, mossy stones, and a single cherry blossom tree in full bloom.", category: 'Landscapes', style: 'Ink Wash (Sumi-e)', imageUrl: 'https://picsum.photos/seed/prompt12/500/500' },
    { id: 13, prompt: "An impossible Escher-like building with staircases going in every direction. Black and white, line art.", category: 'Architecture', style: 'Line Art', imageUrl: 'https://picsum.photos/seed/prompt13/500/500' },
    { id: 14, prompt: "A swirling vortex of liquid metal and fractal patterns, chaotic yet beautiful. 3D render, abstract.", category: 'Abstract', style: '3D Render', imageUrl: 'https://picsum.photos/seed/prompt14/500/500' },
    { id: 15, prompt: "A high-speed chase between flying vehicles through the canyons of a desert planet. Wide-angle shot, sense of motion and scale.", category: 'Sci-Fi', style: 'Wide-angle shot', imageUrl: 'https://picsum.photos/seed/prompt15/500/500' },
];

interface PromptLibraryProps {
    setActivePage: (page: Page) => void;
    setSharedPrompt: (prompt: string) => void;
}

const PromptCard: React.FC<{ promptData: LibraryPrompt; onUse: (prompt: string) => void; onDelete: (id: number) => void; }> = ({ promptData, onUse, onDelete }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(promptData.prompt);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="group relative aspect-square bg-gray-200 dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(promptData.id);
                }}
                className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                aria-label="Delete prompt"
            >
                <TrashIcon className="h-4 w-4" />
            </button>
            <img src={promptData.imageUrl} alt={promptData.prompt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end">
                <p className="text-white text-sm font-medium line-clamp-3 leading-tight text-shadow">{promptData.prompt}</p>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm p-4 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <p className="text-white text-sm font-medium mb-4">{promptData.prompt}</p>
                    <div className="flex gap-3">
                         <button onClick={handleCopy} className="flex-1 py-2 px-3 bg-gray-200/80 text-gray-900 font-semibold rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 text-sm">
                            <CopyIcon className="h-4 w-4" />
                            {copySuccess ? 'Copied!' : 'Copy'}
                        </button>
                        <button onClick={() => onUse(promptData.prompt)} className="flex-1 py-2 px-3 bg-indigo-600/90 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 text-sm">
                            <SendIcon className="h-4 w-4" />
                            Use Prompt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PromptLibrary: React.FC<PromptLibraryProps> = ({ setActivePage, setSharedPrompt }) => {
    const [prompts, setPrompts] = useState<LibraryPrompt[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Form state for new prompt
    const [newPromptText, setNewPromptText] = useState('');
    const [newPromptCategory, setNewPromptCategory] = useState<LibraryPrompt['category']>('Custom');
    const [newPromptStyle, setNewPromptStyle] = useState('');
    const [newPromptImageUrl, setNewPromptImageUrl] = useState('');

    useEffect(() => {
        try {
            const storedPrompts = localStorage.getItem(PROMPT_LIBRARY_KEY);
            if (storedPrompts) {
                setPrompts(JSON.parse(storedPrompts));
            } else {
                setPrompts(defaultPrompts);
                localStorage.setItem(PROMPT_LIBRARY_KEY, JSON.stringify(defaultPrompts));
            }
        } catch (e) {
            console.error("Failed to load prompts from localStorage", e);
            setPrompts(defaultPrompts);
        }
    }, []);

    const handleUsePrompt = (prompt: string) => {
        setSharedPrompt(prompt);
        setActivePage('generator');
    };
    
    const handleDeletePrompt = (id: number) => {
        if (window.confirm('Are you sure you want to delete this prompt?')) {
            const updatedPrompts = prompts.filter(p => p.id !== id);
            setPrompts(updatedPrompts);
            localStorage.setItem(PROMPT_LIBRARY_KEY, JSON.stringify(updatedPrompts));
        }
    };
    
    const handleSaveNewPrompt = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPromptText.trim()) {
            alert("Prompt text cannot be empty.");
            return;
        }

        const newPrompt: LibraryPrompt = {
            id: Date.now(),
            prompt: newPromptText,
            category: newPromptCategory,
            style: newPromptStyle || 'Custom',
            imageUrl: newPromptImageUrl || `https://picsum.photos/seed/${Date.now()}/500/500`,
        };

        const updatedPrompts = [newPrompt, ...prompts];
        setPrompts(updatedPrompts);
        localStorage.setItem(PROMPT_LIBRARY_KEY, JSON.stringify(updatedPrompts));

        setIsAddModalOpen(false);
        setNewPromptText('');
        setNewPromptCategory('Custom');
        setNewPromptStyle('');
        setNewPromptImageUrl('');
    };

    const categories = useMemo(() => {
        const allCategories = new Set(prompts.map(p => p.category));
        return ['All', ...Array.from(allCategories).sort()];
    }, [prompts]);

    const filteredPrompts = useMemo(() => {
        return prompts.filter(p => {
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            const matchesSearch = p.prompt.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [prompts, searchTerm, activeCategory]);
    
    const modalCategories = categories.filter(c => c !== 'All') as LibraryPrompt['category'][];

    return (
        <>
            <div className="h-full flex flex-col">
                <header className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <BookOpenIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Prompt Library</h1>
                    </div>
                     <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add Prompt
                    </button>
                </header>

                <div className="flex-grow flex flex-col md:flex-row gap-8 min-h-0">
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-8 space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-slate-200">Search</h2>
                                 <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search prompts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <XIcon className="h-4 w-4 text-gray-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-slate-200">Categories</h2>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                activeCategory === cat 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                    
                    <main className="flex-grow overflow-y-auto pr-2 -mr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredPrompts.map(p => (
                                <PromptCard key={p.id} promptData={p} onUse={handleUsePrompt} onDelete={handleDeletePrompt} />
                            ))}
                             {filteredPrompts.length === 0 && (
                                <div className="col-span-full h-64 flex items-center justify-center text-center text-gray-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/50 rounded-2xl">
                                    <div>
                                        <h3 className="text-xl font-semibold">No Prompts Found</h3>
                                        <p>Try adjusting your search or filter.</p>
                                    </div>
                                </div>
                             )}
                        </div>
                    </main>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-900/80 dark:bg-slate-900/90 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300" onClick={() => setIsAddModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Add New Prompt</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleSaveNewPrompt} className="space-y-4">
                            <div>
                                <label htmlFor="promptText" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Prompt Text</label>
                                <textarea id="promptText" value={newPromptText} onChange={e => setNewPromptText(e.target.value)} required className="mt-1 w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg h-24 text-gray-900 dark:text-slate-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="promptCategory" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Category</label>
                                    <select id="promptCategory" value={newPromptCategory} onChange={e => setNewPromptCategory(e.target.value as LibraryPrompt['category'])} className="mt-1 w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100">
                                        {modalCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="promptStyle" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Style</label>
                                    <input type="text" id="promptStyle" value={newPromptStyle} onChange={e => setNewPromptStyle(e.target.value)} className="mt-1 w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="promptImageUrl" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Image URL (Optional)</label>
                                <input type="text" id="promptImageUrl" value={newPromptImageUrl} onChange={e => setNewPromptImageUrl(e.target.value)} placeholder="Leave blank for random image" className="mt-1 w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100" />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="py-2 px-4 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
                                <button type="submit" className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500">Save Prompt</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PromptLibrary;
