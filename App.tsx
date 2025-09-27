

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Login from './pages/Login'; // Import the new Login page
import ImageGenerator from './pages/ImageGenerator';
import PromptLibrary from './pages/PromptLibrary';
import PromptPolisher from './pages/PromptPolisher';
import Autonotes from './pages/Autonotes';
import VideoIdeator from './pages/VideoIdeator';
import MeetingSummarizer from './pages/MeetingSummarizer';
import CodeExplainer from './pages/CodeExplainer';
import EmailWriter from './pages/EmailWriter';
import SocialMediaPostGenerator from './pages/SocialMediaPostGenerator';
import RecipeCreator from './pages/RecipeCreator';
import FitnessPlanner from './pages/FitnessPlanner';
import TravelPlanner from './pages/TravelPlanner';
import StoryWriter from './pages/StoryWriter';
import ResumeBuilder from './pages/ResumeBuilder';
import LanguageTranslator from './pages/LanguageTranslator';
import TaskBuilder from './pages/TaskBuilder';
import PersonalWiki from './pages/PersonalWiki';
import BlogPostWriter from './pages/BlogPostWriter';
import AdCopyGenerator from './pages/AdCopyGenerator';
import ProductDescriptionWriter from './pages/ProductDescriptionWriter';
import IdeaGenerator from './pages/IdeaGenerator';
import CoverLetterWriter from './pages/CoverLetterWriter';
import LessonPlanner from './pages/LessonPlanner';
import WorkoutLog from './pages/WorkoutLog';
import MealPlanner from './pages/MealPlanner';
import CharacterCreator from './pages/CharacterCreator';
import DomainNameGenerator from './pages/DomainNameGenerator';
import AITutor from './pages/AITutor';
import InvestmentAnalyzer from './pages/InvestmentAnalyzer';
import LegalDocSummarizer from './pages/LegalDocSummarizer';
import DebateTopicGenerator from './pages/DebateTopicGenerator';
import GiftIdeaGenerator from './pages/GiftIdeaGenerator';
import SpeechWriter from './pages/SpeechWriter';
import DreamInterpreter from './pages/DreamInterpreter';
import NegotiationScripter from './pages/NegotiationScripter';
import MusicLyricGenerator from './pages/MusicLyricGenerator';
import BusinessPlanOutliner from './pages/BusinessPlanOutliner';
import CodeConverter from './pages/CodeConverter';
import RegexGenerator from './pages/RegexGenerator';
import ApiDocWriter from './pages/ApiDocWriter';
import SqlQueryGenerator from './pages/SqlQueryGenerator';
import BrandNameGenerator from './pages/BrandNameGenerator';
import VideoScriptWriter from './pages/VideoScriptWriter';
import PressReleaseWriter from './pages/PressReleaseWriter';
import JobDescriptionWriter from './pages/JobDescriptionWriter';
import MarketResearchAssistant from './pages/MarketResearchAssistant';
import SwotAnalysisGenerator from './pages/SwotAnalysisGenerator';
import PersonalizedStoryCreator from './pages/PersonalizedStoryCreator';
import EthicalDilemmaSolver from './pages/EthicalDilemmaSolver';
import TextAdventureGame from './pages/TextAdventureGame';
import BudgetPlanner from './pages/BudgetPlanner';
import StudyGuideCreator from './pages/StudyGuideCreator';
import ResearchPaperSummarizer from './pages/ResearchPaperSummarizer';
import AnalogyGenerator from './pages/AnalogyGenerator';
import FitnessCoach from './pages/FitnessCoach';
import DietaryLogAnalyzer from './pages/DietaryLogAnalyzer';
import ItineraryOptimizer from './pages/ItineraryOptimizer';
import SymptomChecker from './pages/SymptomChecker';
import MentalHealthCompanion from './pages/MentalHealthCompanion';
import MeditationScriptGenerator from './pages/MeditationScriptGenerator';
import RecipeNutritionAnalyzer from './pages/RecipeNutritionAnalyzer';
import FactChecker from './pages/FactChecker';
import SocraticTutor from './pages/SocraticTutor';
import HistoricalFigureChat from './pages/HistoricalFigureChat';
import ArgumentMapper from './pages/ArgumentMapper';
import BookSummarizer from './pages/BookSummarizer';
import PitchDeckCreator from './pages/PitchDeckCreator';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import GrantProposalWriter from './pages/GrantProposalWriter';
import AbTestIdeaGenerator from './pages/AbTestIdeaGenerator';
import CustomerPersonaGenerator from './pages/CustomerPersonaGenerator';
import RiskAssessmentAnalyzer from './pages/RiskAssessmentAnalyzer';
import ErrorMessageDebugger from './pages/ErrorMessageDebugger';
import UnitTestGenerator from './pages/UnitTestGenerator';
import ApiEndpointSuggester from './pages/ApiEndpointSuggester';
import CronJobExplainer from './pages/CronJobExplainer';
import ColorPaletteGenerator from './pages/ColorPaletteGenerator';
import InteriorDesignIdeas from './pages/InteriorDesignIdeas';
import TattooIdeaGenerator from './pages/TattooIdeaGenerator';
import PoetryGenerator from './pages/PoetryGenerator';
import MovieBookRecommender from './pages/MovieBookRecommender';
import ParodySatireWriter from './pages/ParodySatireWriter';
import EventPlanner from './pages/EventPlanner';
import PlantCareAssistant from './pages/PlantCareAssistant';
import CarMaintenanceAdvisor from './pages/CarMaintenanceAdvisor';
import PublicSpeakingCoach from './pages/PublicSpeakingCoach';
import DiyProjectPlanner from './pages/DiyProjectPlanner';
import CodeRefactorSuggester from './pages/CodeRefactorSuggester';
import GtmStrategyGenerator from './pages/GtmStrategyGenerator';
import ContractAnalyzer from './pages/ContractAnalyzer';
import ThesaurusRephraser from './pages/ThesaurusRephraser';
import Eli5Explainer from './pages/Eli5Explainer';
import MeetingIcebreakerGenerator from './pages/MeetingIcebreakerGenerator';
import PersonalizedAffirmations from './pages/PersonalizedAffirmations';
import ConflictResolutionAdvisor from './pages/ConflictResolutionAdvisor';
import WorkoutFormChecker from './pages/WorkoutFormChecker';
import RecipeScalerModifier from './pages/RecipeScalerModifier';
import GitCommandGenerator from './pages/GitCommandGenerator';
import ElevatorPitchCrafter from './pages/ElevatorPitchCrafter';
import BrandVoiceGuide from './pages/BrandVoiceGuide';
import WorldBuilderAssistant from './pages/WorldBuilderAssistant';
import MindMapGenerator from './pages/MindMapGenerator';
import { HistoricalWhatIf } from './pages/HistoricalWhatIf';
import HobbySuggester from './pages/HobbySuggester';
import TextMessageResponder from './pages/TextMessageResponder';
import PersonalStyleAdvisor from './pages/PersonalStyleAdvisor';
import AstrologyInterpreter from './pages/AstrologyInterpreter';
import ApiPayloadGenerator from './pages/ApiPayloadGenerator';
import SystemDesignExplainer from './pages/SystemDesignExplainer';
import CloudCostEstimator from './pages/CloudCostEstimator';
import SecurityVulnerabilityExplainer from './pages/SecurityVulnerabilityExplainer';
import QbrGenerator from './pages/QbrGenerator';
import OkrGenerator from './pages/OkrGenerator';
import SalesEmailSequenceWriter from './pages/SalesEmailSequenceWriter';
import InvestorUpdateDraftsman from './pages/InvestorUpdateDraftsman';
import FinancialStatementAnalyzer from './pages/FinancialStatementAnalyzer';
import MarketSizingEstimator from './pages/MarketSizingEstimator';
import ScreenplayFormatter from './pages/ScreenplayFormatter';
import GddOutliner from './pages/GddOutliner';
import MagicSystemCreator from './pages/MagicSystemCreator';
import StandUpJokeWriter from './pages/StandUpJokeWriter';
import ArchitecturalStyleSuggester from './pages/ArchitecturalStyleSuggester';
import ScientificHypothesisGenerator from './pages/ScientificHypothesisGenerator';
import LiteraryDeviceIdentifier from './pages/LiteraryDeviceIdentifier';
import ThoughtExperimentGenerator from './pages/ThoughtExperimentGenerator';
import CounterArgumentGenerator from './pages/CounterArgumentGenerator';
import CognitiveBiasIdentifier from './pages/CognitiveBiasIdentifier';
import PersonalizedSkincareRoutine from './pages/PersonalizedSkincareRoutine';
import MealPrepSuggester from './pages/MealPrepSuggester';
import TherapyJournalingPrompts from './pages/TherapyJournalingPrompts';
import WeddingVowWriter from './pages/WeddingVowWriter';
import CocktailRecipeCreator from './pages/CocktailRecipeCreator';
import BoardGameIdeaGenerator from './pages/BoardGameIdeaGenerator';
import ExcuseGenerator from './pages/ExcuseGenerator';
import PersonalizedTriviaGenerator from './pages/PersonalizedTriviaGenerator';
import EtiquetteAdvisor from './pages/EtiquetteAdvisor';
import HomeDeclutteringPlan from './pages/HomeDeclutteringPlan';
import SentimentAnalyzer from './pages/SentimentAnalyzer';
import UserStoryGenerator from './pages/UserStoryGenerator';
import QuizGenerator from './pages/QuizGenerator';
import HaikuGenerator from './pages/HaikuGenerator';
import DietaryRecipeFinder from './pages/DietaryRecipeFinder';
import AcronymExplainer from './pages/AcronymExplainer';
import SloganGenerator from './pages/SloganGenerator';
import Settings from './pages/Settings';
import Calculator from './pages/Calculator';
import HandwrittenNotes from './pages/HandwrittenNotes';
import UserDashboard from './pages/UserDashboard';
import WhiteboardTabs from './components/WhiteboardTabs';
import AIImageEditor from './pages/AIImageEditor';
import ContactManager from './pages/ContactManager';
import EnhancedTaskManager from './pages/EnhancedTaskManager';
import ClockTimerHub from './pages/ClockTimerHub';
import CryptoPricesTracker from './pages/CryptoPricesTracker';
import BookmarksManager from './pages/BookmarksManager';
import BottleCounter from './pages/BottleCounter';
import ChatRoom from './pages/ChatRoom';
import GuidesInfo from './pages/GuidesInfo';
import Games from './pages/Games';
import { Logo } from './components/Logo';
import UserProfileWidget from './components/UserProfileWidget';

import {
    SparklesIcon, BookOpenIcon, WandIcon, DocumentTextIcon, VideoCameraIcon,
    BriefcaseIcon, CodeBracketIcon, EnvelopeIcon, ShareIcon, CakeIcon, HeartIcon,
    GlobeAltIcon, PencilIcon, UserCircleIcon, LanguageIcon, ClipboardListIcon,
    BrainIcon, NewspaperIcon, MegaphoneIcon, TagIcon, LightBulbIcon, DocumentCheckIcon,
    AcademicCapIcon, BoltIcon, TableCellsIcon, FaceSmileIcon, AtSymbolIcon,
    ChatBubbleBottomCenterTextIcon, ChartBarIcon, ScaleIcon, SpeakerWaveIcon, GiftIcon,
    PresentationChartLineIcon, MoonIcon, UsersIcon, MusicalNoteIcon, BuildingOfficeIcon,
    CodeConverterIcon, RegexGeneratorIcon, SqlQueryIcon, ApiDocWriterIcon, BrandNameIcon,
    VideoScriptIcon, PressReleaseIcon, JobDescriptionIcon, MarketResearchIcon, SwotAnalysisIcon,
    PersonalizedStoryIcon, EthicalDilemmaIcon, TextAdventureIcon, BudgetPlannerIcon,
    StudyGuideIcon, ResearchPaperSummarizerIcon, AnalogyGeneratorIcon, FitnessCoachIcon,
    DietaryLogAnalyzerIcon, ItineraryOptimizerIcon, ChevronDoubleLeftIcon,
    SymptomCheckerIcon, MentalHealthCompanionIcon, MeditationScriptIcon, RecipeNutritionAnalyzerIcon,
    FactCheckerIcon, SocraticTutorIcon, HistoricalFigureChatIcon, ArgumentMapperIcon, BookSummarizerIcon,
    PitchDeckCreatorIcon, CompetitorAnalysisIcon, GrantProposalWriterIcon, AbTestIdeaGeneratorIcon,
    CustomerPersonaGeneratorIcon, RiskAssessmentAnalyzerIcon, ErrorMessageDebuggerIcon, UnitTestGeneratorIcon,
    ApiEndpointSuggesterIcon, CronJobExplainerIcon, ColorPaletteGeneratorIcon, InteriorDesignIdeasIcon,
    TattooIdeaGeneratorIcon, PoetryGeneratorIcon, MovieBookRecommenderIcon, ParodySatireWriterIcon,
    EventPlannerIcon, PlantCareAssistantIcon, CarMaintenanceAdvisorIcon, PublicSpeakingCoachIcon,
    DiyProjectPlannerIcon, CodeRefactorSuggesterIcon, GtmStrategyGeneratorIcon, ContractAnalyzerIcon,
    ThesaurusRephraserIcon, Eli5ExplainerIcon, MeetingIcebreakerGeneratorIcon, PersonalizedAffirmationsIcon,
    ConflictResolutionAdvisorIcon, WorkoutFormCheckerIcon, RecipeScalerModifierIcon, GitCommandIcon,
    ElevatorPitchIcon, BrandVoiceIcon, WorldBuilderIcon, MindMapIcon, HistoricalWhatIfIcon,
    HobbySuggesterIcon, TextMessageResponderIcon, PersonalStyleAdvisorIcon, AstrologyIcon,
    ApiPayloadGeneratorIcon, SystemDesignExplainerIcon, CloudCostEstimatorIcon, SecurityVulnerabilityExplainerIcon,
    QbrGeneratorIcon, OkrGeneratorIcon, SalesEmailSequenceWriterIcon, InvestorUpdateDraftsmanIcon, FinancialStatementAnalyzerIcon,
    MarketSizingEstimatorIcon, ScreenplayFormatterIcon, GddOutlinerIcon, MagicSystemCreatorIcon, StandUpJokeWriterIcon,
    ArchitecturalStyleSuggesterIcon, ScientificHypothesisGeneratorIcon, LiteraryDeviceIdentifierIcon,
    ThoughtExperimentGeneratorIcon, CounterArgumentGeneratorIcon, CognitiveBiasIdentifierIcon, PersonalizedSkincareRoutineIcon,
    MealPrepSuggesterIcon, TherapyJournalingPromptsIcon, WeddingVowWriterIcon, CocktailRecipeCreatorIcon,
    BoardGameIdeaGeneratorIcon, ExcuseGeneratorIcon, PersonalizedTriviaGeneratorIcon, EtiquetteAdvisorIcon,
    HomeDeclutteringPlanIcon, SentimentAnalyzerIcon, UserStoryGeneratorIcon, QuizGeneratorIcon, HaikuGeneratorIcon,
    DietaryRecipeIcon, AcronymExplainerIcon, SloganGeneratorIcon, CogIcon, XIcon, CalculatorIcon,
    StarIcon, StarSolidIcon, EditIcon, UserGroupIcon, ClockIcon, CurrencyDollarIcon, BookmarkIcon, BottleIcon
} from './components/icons';
import { VoiceProvider } from './contexts/VoiceContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProfileProvider, useUserProfile } from './contexts/UserProfileContext';
import { UsageTrackingProvider } from './contexts/UsageTrackingContext';

// Shortcut Configuration
export type ShortcutAction = 'navigateToLibrary' | 'newWikiPage' | 'startDictation' | 'wikiUndo' | 'wikiRedo';

export interface Shortcut {
    name: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    key: string;
    code: string; // To handle things like Space, and distinguish between number row and numpad
}

export type Shortcuts = Record<ShortcutAction, Shortcut>;

export const defaultShortcuts: Shortcuts = {
    navigateToLibrary: { name: 'Go to Prompt Library', ctrlKey: true, altKey: false, shiftKey: false, key: 'g', code: 'KeyG' },
    newWikiPage: { name: 'New Wiki Page', ctrlKey: true, altKey: false, shiftKey: false, key: 'n', code: 'KeyN' },
    startDictation: { name: 'Start Dictation', ctrlKey: true, altKey: false, shiftKey: false, key: ' ', code: 'Space' },
    wikiUndo: { name: 'Undo (in Wiki)', ctrlKey: true, altKey: false, shiftKey: false, key: 'z', code: 'KeyZ' },
    wikiRedo: { name: 'Redo (in Wiki)', ctrlKey: true, altKey: false, shiftKey: false, key: 'y', code: 'KeyY' },
};

export const SHORTCUTS_KEY = 'accelerate-shortcuts';
// End Shortcut Configuration

export type Page =
    'generator' | 'library' | 'polisher' | 'autonotes' | 'video' | 'summarizer' |
    'code' | 'email' | 'social' | 'recipe' | 'fitness' | 'travel' | 'story' |
    'resume' | 'translator' | 'taskbuilder' | 'wiki' | 'blogpost' | 'adcopy' |
    'productdesc' | 'ideagen' | 'coverletter' | 'lessonplan' | 'workout' |
    'mealplan' | 'character' | 'domain' | 'aitutor' | 'investment' | 'legal' |
    'debate' | 'gift' | 'speech' | 'dream' | 'negotiation' | 'music' | 'businessplan' |
    'codeconverter' | 'regex' | 'apidocs' | 'sql' | 'brandname' | 'videoscript' |
    'pressrelease' | 'jobdesc' | 'marketresearch' | 'swot' | 'personalstory' |
    'ethical' | 'textadventure' | 'budget' | 'studyguide' | 'research' | 'analogy' |
    'fitnesscoach' | 'dietarylog' | 'itineraryoptimizer' |
    // 30 new pages
    'symptomchecker' | 'mentalhealth' | 'meditation' | 'nutritionanalyzer' | 'factchecker' |
    'socratictutor' | 'historicalchat' | 'argumentmapper' | 'booksummarizer' | 'pitchdeck' |
    'competitoranalysis' | 'grantproposal' | 'abtest' | 'customerpersona' | 'riskanalyzer' |
    'errordebugger' | 'unittest' | 'apiendpoint' | 'cronjob' | 'colorpalette' |
    'interiordesign' | 'tattoo' | 'poetry' | 'recommender' | 'parodywriter' |
    'eventplanner' | 'plantcare' | 'caradvisor' | 'publicspeaking' | 'diyplanner' |
    // 10 new pages
    'coderefactor' | 'gtmstrategy' | 'contractanalyzer' | 'rephraser' | 'eli5' |
    'icebreaker' | 'affirmations' | 'conflict' | 'formchecker' | 'recipescaler' |
    // Final 10 pages
    'gitcommand' | 'elevatorpitch' | 'brandvoice' | 'worldbuilder' | 'mindmap' |
    'historicalwhatif' | 'hobbysuggester' | 'textresponder' | 'styleadvisor' | 'astrology' |
    // 30 more
    'apipayload' | 'systemdesign' | 'cloudcost' | 'security' | 'qbr' | 'okr' | 'salesemail' |
    'investorupdate' | 'financialstatement' | 'marketsizing' | 'screenplay' | 'gdd' | 'magicsystem' |
    'standup' | 'architectural' | 'hypothesis' | 'literarydevice' | 'thoughtexperiment' |
    'counterargument' | 'cognitivebias' | 'skincare' | 'mealprep' | 'therapyjournal' |
    'weddingvow' | 'cocktail' | 'boardgame' | 'excuse' | 'trivia' | 'etiquette' | 'declutter' |
    // 7 more
    'sentiment' | 'userstory' | 'quiz' | 'haiku' | 'dietaryrecipe' | 'acronym' | 'slogan' |
    // New page
    'calculator' |
    'handwritten' |
    // User dashboard
    'userdashboard' |
    // Whiteboard
    'whiteboard' |
    // AI Image Editor
    'aiimageeditor' |
    // Integrated productivity tools
    'contactmanager' |
    'enhancedtaskmanager' |
    'clocktimerhub' |
    'cryptoprices' |
    'bookmarksmanager' |
    'bottlecounter' |
    // Chat room
    'chatroom' |
    // Guides & Info
    'guidesinfo' |
    // Games
    'games' |
    // Settings page
    'settings';

const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 288; // w-72
const COLLAPSED_SIDEBAR_WIDTH = 72;
const SIDEBAR_WIDTH_KEY = 'accelerate-sidebar-width';
const SIDEBAR_COLLAPSED_KEY = 'accelerate-sidebar-collapsed';

const navItems = [
    {
        group: 'Core Tools',
        items: [
            { id: 'generator', label: 'Image Generator', icon: SparklesIcon },
            { id: 'polisher', label: 'Prompt Polisher', icon: WandIcon },
            { id: 'video', label: 'Video Ideas', icon: VideoCameraIcon },
            { id: 'taskbuilder', label: 'AI Task Manager', icon: ClipboardListIcon },
            { id: 'wiki', label: 'Personal Wiki', icon: BrainIcon },
            { id: 'autonotes', label: 'Autonotes', icon: DocumentTextIcon },
            { id: 'chatroom', label: 'Chat Room', icon: ChatBubbleBottomCenterTextIcon },
        ]
    },
    {
        group: 'Developer Tools',
        items: [
            { id: 'codeconverter', label: 'Code Converter', icon: CodeConverterIcon },
            { id: 'regex', label: 'Regex Generator', icon: RegexGeneratorIcon },
            { id: 'sql', label: 'SQL Query Generator', icon: SqlQueryIcon },
            { id: 'apidocs', label: 'API Doc Writer', icon: ApiDocWriterIcon },
            { id: 'code', label: 'Code Explainer', icon: CodeBracketIcon },
            { id: 'errordebugger', label: 'Error Debugger', icon: ErrorMessageDebuggerIcon },
            { id: 'unittest', label: 'Unit Test Generator', icon: UnitTestGeneratorIcon },
            { id: 'apiendpoint', label: 'API Endpoint Suggester', icon: ApiEndpointSuggesterIcon },
            { id: 'cronjob', label: 'Cron Job Explainer', icon: CronJobExplainerIcon },
            { id: 'coderefactor', label: 'Code Refactor Suggester', icon: CodeRefactorSuggesterIcon },
            { id: 'gitcommand', label: 'Git Command Generator', icon: GitCommandIcon },
            { id: 'apipayload', label: 'API Payload Generator', icon: ApiPayloadGeneratorIcon },
            { id: 'systemdesign', label: 'System Design Explainer', icon: SystemDesignExplainerIcon },
            { id: 'cloudcost', label: 'Cloud Cost Estimator', icon: CloudCostEstimatorIcon },
            { id: 'security', label: 'Security Vulnerability Explainer', icon: SecurityVulnerabilityExplainerIcon },
            { id: 'userstory', label: 'User Story Generator', icon: UserStoryGeneratorIcon },
        ]
    },
    {
        group: 'Creative & Writing',
        items: [
            { id: 'whiteboard', label: 'Interactive Whiteboard', icon: PencilIcon },
            { id: 'aiimageeditor', label: 'AI Image Editor', icon: EditIcon },
            { id: 'handwritten', label: 'Handwritten Notes', icon: PencilIcon },
            { id: 'blogpost', label: 'Blog Post Writer', icon: NewspaperIcon },
            { id: 'story', label: 'Story Writer', icon: PencilIcon },
            { id: 'speech', label: 'Speech Writer', icon: PresentationChartLineIcon },
            { id: 'music', label: 'Music Lyric Generator', icon: MusicalNoteIcon },
            { id: 'videoscript', label: 'Video Script Writer', icon: VideoScriptIcon },
            { id: 'personalstory', label: 'Personalized Story', icon: PersonalizedStoryIcon },
            { id: 'ideagen', label: 'Idea Generator', icon: LightBulbIcon },
            { id: 'character', label: 'Character Creator', icon: FaceSmileIcon },
            { id: 'dream', label: 'Dream Interpreter', icon: MoonIcon },
            { id: 'colorpalette', label: 'Color Palette Generator', icon: ColorPaletteGeneratorIcon },
            { id: 'interiordesign', label: 'Interior Design Ideas', icon: InteriorDesignIdeasIcon },
            { id: 'tattoo', label: 'Tattoo Idea Generator', icon: TattooIdeaGeneratorIcon },
            { id: 'poetry', label: 'Poetry Generator', icon: PoetryGeneratorIcon },
            { id: 'recommender', label: 'Movie/Book Recommender', icon: MovieBookRecommenderIcon },
            { id: 'parodywriter', label: 'Parody & Satire Writer', icon: ParodySatireWriterIcon },
            { id: 'rephraser', label: 'Thesaurus & Rephraser', icon: ThesaurusRephraserIcon },
            { id: 'worldbuilder', label: 'World Builder Assistant', icon: WorldBuilderIcon },
            { id: 'screenplay', label: 'Screenplay Formatter', icon: ScreenplayFormatterIcon },
            { id: 'gdd', label: 'GDD Outliner', icon: GddOutlinerIcon },
            { id: 'magicsystem', label: 'Magic System Creator', icon: MagicSystemCreatorIcon },
            { id: 'standup', label: 'Stand-up Joke Writer', icon: StandUpJokeWriterIcon },
            { id: 'architectural', label: 'Architectural Style Suggester', icon: ArchitecturalStyleSuggesterIcon },
            { id: 'weddingvow', label: 'Wedding Vow Writer', icon: WeddingVowWriterIcon },
            { id: 'haiku', label: 'Haiku Generator', icon: HaikuGeneratorIcon },
        ]
    },
    {
        group: 'Business & Marketing',
        items: [
            { id: 'businessplan', label: 'Business Plan Outliner', icon: BuildingOfficeIcon },
            { id: 'adcopy', label: 'Ad Copy Generator', icon: MegaphoneIcon },
            { id: 'productdesc', label: 'Product Descriptions', icon: TagIcon },
            { id: 'email', label: 'Email Writer', icon: EnvelopeIcon },
            { id: 'social', label: 'Social Post Generator', icon: ShareIcon },
            { id: 'domain', label: 'Domain Name Generator', icon: AtSymbolIcon },
            { id: 'brandname', label: 'Brand Name Generator', icon: BrandNameIcon },
            { id: 'pressrelease', label: 'Press Release Writer', icon: PressReleaseIcon },
            { id: 'investment', label: 'Investment Analyzer', icon: ChartBarIcon },
            { id: 'marketresearch', label: 'Market Research', icon: MarketResearchIcon },
            { id: 'pitchdeck', label: 'Pitch Deck Creator', icon: PitchDeckCreatorIcon },
            { id: 'competitoranalysis', label: 'Competitor Analysis', icon: CompetitorAnalysisIcon },
            { id: 'grantproposal', label: 'Grant Proposal Writer', icon: GrantProposalWriterIcon },
            { id: 'abtest', label: 'A/B Test Idea Generator', icon: AbTestIdeaGeneratorIcon },
            { id: 'customerpersona', label: 'Customer Persona', icon: CustomerPersonaGeneratorIcon },
            { id: 'riskanalyzer', label: 'Risk Assessment Analyzer', icon: RiskAssessmentAnalyzerIcon },
            { id: 'gtmstrategy', label: 'GTM Strategy Generator', icon: GtmStrategyGeneratorIcon },
            { id: 'elevatorpitch', label: 'Elevator Pitch Crafter', icon: ElevatorPitchIcon },
            { id: 'brandvoice', label: 'Brand Voice & Tone Guide', icon: BrandVoiceIcon },
            { id: 'qbr', label: 'QBR Generator', icon: QbrGeneratorIcon },
            { id: 'okr', label: 'OKR Generator', icon: OkrGeneratorIcon },
            { id: 'salesemail', label: 'Sales Email Sequence', icon: SalesEmailSequenceWriterIcon },
            { id: 'investorupdate', label: 'Investor Update Draftsman', icon: InvestorUpdateDraftsmanIcon },
            { id: 'financialstatement', label: 'Financial Statement Analyzer', icon: FinancialStatementAnalyzerIcon },
            { id: 'marketsizing', label: 'Market Sizing Estimator', icon: MarketSizingEstimatorIcon },
            { id: 'sentiment', label: 'Sentiment Analyzer', icon: SentimentAnalyzerIcon },
            { id: 'slogan', label: 'Slogan Generator', icon: SloganGeneratorIcon },
        ]
    },
    {
        group: 'Professional & HR',
        items: [
            { id: 'summarizer', label: 'Meeting Summarizer', icon: BriefcaseIcon },
            { id: 'legal', label: 'Legal Doc Summarizer', icon: ScaleIcon },
            { id: 'resume', label: 'Resume Builder', icon: UserCircleIcon },
            { id: 'coverletter', label: 'Cover Letter Writer', icon: DocumentCheckIcon },
            { id: 'jobdesc', label: 'Job Description Writer', icon: JobDescriptionIcon },
            { id: 'swot', label: 'SWOT Analysis', icon: SwotAnalysisIcon },
            { id: 'negotiation', label: 'Negotiation Scripter', icon: UsersIcon },
            { id: 'publicspeaking', label: 'Public Speaking Coach', icon: PublicSpeakingCoachIcon },
            { id: 'contractanalyzer', label: 'Contract Analyzer', icon: ContractAnalyzerIcon },
            { id: 'icebreaker', label: 'Meeting Icebreaker', icon: MeetingIcebreakerGeneratorIcon },
        ]
    },
    {
        group: 'Education & Logic',
        items: [
            { id: 'aitutor', label: 'AI Tutor', icon: ChatBubbleBottomCenterTextIcon },
            { id: 'lessonplan', label: 'Lesson Planner', icon: AcademicCapIcon },
            { id: 'studyguide', label: 'Study Guide Creator', icon: StudyGuideIcon },
            { id: 'research', label: 'Research Summarizer', icon: ResearchPaperSummarizerIcon },
            { id: 'analogy', label: 'Analogy Generator', icon: AnalogyGeneratorIcon },
            { id: 'debate', label: 'Debate Topic Generator', icon: SpeakerWaveIcon },
            { id: 'ethical', label: 'Ethical Dilemma Solver', icon: EthicalDilemmaIcon },
            { id: 'translator', label: 'Language Translator', icon: LanguageIcon },
            { id: 'factchecker', label: 'Fact Checker', icon: FactCheckerIcon },
            { id: 'socratictutor', label: 'Socratic Tutor', icon: SocraticTutorIcon },
            { id: 'historicalchat', label: 'Historical Figure Chat', icon: HistoricalFigureChatIcon },
            { id: 'argumentmapper', label: 'Argument Mapper', icon: ArgumentMapperIcon },
            { id: 'booksummarizer', label: 'Book Summarizer', icon: BookSummarizerIcon },
            { id: 'eli5', label: 'ELI5 Explainer', icon: Eli5ExplainerIcon },
            { id: 'mindmap', label: 'Mind Map Generator', icon: MindMapIcon },
            { id: 'historicalwhatif', label: `Historical 'What If'`, icon: HistoricalWhatIfIcon },
            { id: 'hypothesis', label: 'Hypothesis Generator', icon: ScientificHypothesisGeneratorIcon },
            { id: 'literarydevice', label: 'Literary Device Identifier', icon: LiteraryDeviceIdentifierIcon },
            { id: 'thoughtexperiment', label: 'Thought Experiment', icon: ThoughtExperimentGeneratorIcon },
            { id: 'counterargument', label: 'Counter-Argument Generator', icon: CounterArgumentGeneratorIcon },
            { id: 'cognitivebias', label: 'Cognitive Bias Identifier', icon: CognitiveBiasIdentifierIcon },
            { id: 'quiz', label: 'Quiz & Trivia Generator', icon: QuizGeneratorIcon },
            { id: 'acronym', label: 'Acronym Explainer', icon: AcronymExplainerIcon },
        ]
    },
    {
        group: 'Personal & Health',
        items: [
            { id: 'symptomchecker', label: 'Symptom Checker', icon: SymptomCheckerIcon },
            { id: 'mentalhealth', label: 'Mental Health Companion', icon: MentalHealthCompanionIcon },
            { id: 'meditation', label: 'Meditation Script', icon: MeditationScriptIcon },
            { id: 'nutritionanalyzer', label: 'Recipe Nutrition Analyzer', icon: RecipeNutritionAnalyzerIcon },
            { id: 'mealplan', label: 'Meal Planner', icon: TableCellsIcon },
            { id: 'recipe', label: 'Recipe Creator', icon: CakeIcon },
            { id: 'fitnesscoach', label: 'Fitness Coach', icon: FitnessCoachIcon },
            { id: 'fitness', label: 'Fitness Planner', icon: HeartIcon },
            { id: 'workout', label: 'Workout Log', icon: BoltIcon },
            { id: 'dietarylog', label: 'Dietary Log Analyzer', icon: DietaryLogAnalyzerIcon },
            { id: 'affirmations', label: 'Personalized Affirmations', icon: PersonalizedAffirmationsIcon },
            { id: 'formchecker', label: 'Workout Form Checker', icon: WorkoutFormCheckerIcon },
            { id: 'skincare', label: 'Personalized Skincare Routine', icon: PersonalizedSkincareRoutineIcon },
            { id: 'mealprep', label: 'Meal Prep Suggester', icon: MealPrepSuggesterIcon },
            { id: 'therapyjournal', label: 'Therapy Journaling Prompts', icon: TherapyJournalingPromptsIcon },
            { id: 'dietaryrecipe', label: 'Dietary Recipe Finder', icon: DietaryRecipeIcon },
        ]
    },
    {
        group: 'Productivity Suite',
        items: [
            { id: 'contactmanager', label: 'Contact Manager', icon: UserGroupIcon },
            { id: 'enhancedtaskmanager', label: 'Enhanced Task Manager', icon: ClipboardListIcon },
            { id: 'clocktimerhub', label: 'Clock & Timer Hub', icon: ClockIcon },
            { id: 'bookmarksmanager', label: 'Bookmarks Manager', icon: BookmarkIcon },
            { id: 'cryptoprices', label: 'Crypto Prices', icon: CurrencyDollarIcon },
            { id: 'bottlecounter', label: 'Bottle Return Tracker', icon: BottleIcon },
        ]
    },
    {
        group: 'Fun & Utilities',
        items: [
            { id: 'calculator', label: 'Calculator & Converter', icon: CalculatorIcon },
            { id: 'travel', label: 'Travel Itinerary', icon: GlobeAltIcon },
            { id: 'itineraryoptimizer', label: 'Itinerary Optimizer', icon: ItineraryOptimizerIcon },
            { id: 'gift', label: 'Gift Idea Generator', icon: GiftIcon },
            { id: 'textadventure', label: 'Text Adventure Game', icon: TextAdventureIcon },
            { id: 'budget', label: 'Budget Planner', icon: BudgetPlannerIcon },
            { id: 'eventplanner', label: 'Event Planner', icon: EventPlannerIcon },
            { id: 'plantcare', label: 'Plant Care Assistant', icon: PlantCareAssistantIcon },
            { id: 'caradvisor', label: 'Car Maintenance Advisor', icon: CarMaintenanceAdvisorIcon },
            { id: 'diyplanner', label: 'DIY Project Planner', icon: DiyProjectPlannerIcon },
            { id: 'conflict', label: 'Conflict Resolution Advisor', icon: ConflictResolutionAdvisorIcon },
            { id: 'recipescaler', label: 'Recipe Scaler & Modifier', icon: RecipeScalerModifierIcon },
            { id: 'hobbysuggester', label: 'Hobby Suggester', icon: HobbySuggesterIcon },
            { id: 'textresponder', label: 'Text Message Responder', icon: TextMessageResponderIcon },
            { id: 'styleadvisor', label: 'Personal Style Advisor', icon: PersonalStyleAdvisorIcon },
            { id: 'astrology', label: 'Astrology Interpreter', icon: AstrologyIcon },
            { id: 'cocktail', label: 'Cocktail Recipe Creator', icon: CocktailRecipeCreatorIcon },
            { id: 'boardgame', label: 'Board Game Idea Generator', icon: BoardGameIdeaGeneratorIcon },
            { id: 'excuse', label: 'Excuse Generator', icon: ExcuseGeneratorIcon },
            { id: 'trivia', label: 'Personalized Trivia', icon: PersonalizedTriviaGeneratorIcon },
            { id: 'etiquette', label: 'Etiquette Advisor', icon: EtiquetteAdvisorIcon },
            { id: 'declutter', label: 'Home Decluttering Plan', icon: HomeDeclutteringPlanIcon },
        ]
    },
    {
        group: 'Legacy',
        items: [
            { id: 'library', label: 'Prompt Library', icon: BookOpenIcon },
        ]
    },
    {
        group: 'Application',
        items: [
            { id: 'userdashboard', label: 'User Dashboard', icon: ChartBarIcon },
            { id: 'settings', label: 'Settings', icon: CogIcon },
        ]
    }
];

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const { profile, addFavoritePage, removeFavoritePage } = useUserProfile();
    const [activePage, setActivePage] = useState<Page>('generator');
    const [sharedPrompt, setSharedPrompt] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Debug logging
    useEffect(() => {
        console.log('Auth State Debug:', {
            user: user ? { id: user.id, email: user.email } : null,
            loading,
            profile: profile ? { id: profile.user_id, email: profile.email } : null
        });
    }, [user, loading, profile]);

    // Find current tool for header display
    const currentTool = useMemo(() => {
        for (const group of navItems) {
            const tool = group.items.find(item => item.id === activePage);
            if (tool) return tool;
        }
        return null;
    }, [activePage]);
    const [triggerNewWikiPage, setTriggerNewWikiPage] = useState(false);
    const [sharedNoteContent, setSharedNoteContent] = useState<string | null>(null);
    
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
            return stored ? JSON.parse(stored) : false;
        } catch { return false; }
    });
    
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        try {
            const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
            const width = stored ? parseInt(stored, 10) : DEFAULT_SIDEBAR_WIDTH;
            return Math.max(MIN_SIDEBAR_WIDTH, Math.min(width, MAX_SIDEBAR_WIDTH));
        } catch { return DEFAULT_SIDEBAR_WIDTH; }
    });

    // Get favorites from user profile instead of localStorage
    const favorites = profile?.favorite_pages || [];

    const [shortcuts, setShortcuts] = useState<Shortcuts>(() => {
        try {
            const stored = localStorage.getItem(SHORTCUTS_KEY);
            if (stored) {
                return { ...defaultShortcuts, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error("Could not read shortcuts from localStorage", e);
        }
        return defaultShortcuts;
    });

    const updateShortcuts = (newShortcuts: Shortcuts) => {
        setShortcuts(newShortcuts);
        localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(newShortcuts));
    };

    // Hidden pages state for Members+ (stored in localStorage)
    const HIDDEN_PAGES_KEY = 'accelerate-hidden-pages';
    const [hiddenPages, setHiddenPages] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem(HIDDEN_PAGES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Could not read hidden pages from localStorage", e);
            return [];
        }
    });

    const updateHiddenPages = (newHiddenPages: string[]) => {
        setHiddenPages(newHiddenPages);
        localStorage.setItem(HIDDEN_PAGES_KEY, JSON.stringify(newHiddenPages));
    };

    const hidePageFromSidebar = (pageId: string) => {
        const updatedHiddenPages = [...hiddenPages, pageId];
        updateHiddenPages(updatedHiddenPages);
    };

    const showPageInSidebar = (pageId: string) => {
        const updatedHiddenPages = hiddenPages.filter(id => id !== pageId);
        updateHiddenPages(updatedHiddenPages);
    };

    // Check if user is Members+ (Member, VIP, or God-Tier)
    const isMemberPlus = profile?.tier && ['Member', 'VIP', 'God-Tier'].includes(profile.tier);

    const isResizing = useRef(false);

    const handleSaveNote = (destination: 'wiki' | 'autonotes', content: string) => {
        setSharedNoteContent(content);
        setActivePage(destination);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!user) return; // Don't trigger shortcuts when not authenticated

            const activeEl = document.activeElement;
            const isInputFocused = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;

            const action = (Object.keys(shortcuts) as ShortcutAction[]).find(key => {
                const shortcut = shortcuts[key];
                return e.ctrlKey === shortcut.ctrlKey &&
                       e.altKey === shortcut.altKey &&
                       e.shiftKey === shortcut.shiftKey &&
                       e.code === shortcut.code;
            });

            if (!action) return;
            
            if ((action === 'wikiUndo' || action === 'wikiRedo') && isInputFocused) {
                 // Let the PersonalWiki component's handler take precedence
                return;
            }

            e.preventDefault();

            switch (action) {
                case 'navigateToLibrary':
                    setActivePage('library');
                    break;
                case 'newWikiPage':
                    setActivePage('wiki');
                    setTriggerNewWikiPage(true);
                    break;
                case 'startDictation':
                    window.dispatchEvent(new CustomEvent('start-global-dictation'));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, user]);


    const toggleFavorite = async (pageId: Page) => {
        if (!user) {
            console.log('Cannot toggle favorite: user not authenticated');
            return;
        }

        try {
            const isFavorite = favorites.includes(pageId);
            console.log(`Toggling favorite for ${pageId}, currently favorite: ${isFavorite}`);

            if (isFavorite) {
                const success = await removeFavoritePage(pageId);
                console.log(`Remove favorite result: ${success}`);
            } else {
                const success = await addFavoritePage(pageId);
                console.log(`Add favorite result: ${success}`);
            }
        } catch (error) {
            console.error('Error in toggleFavorite:', error);
        }
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;
        const newWidth = e.clientX;
        if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
            setSidebarWidth(newWidth);
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
    }, [handleMouseMove, sidebarWidth]);

    const toggleSidebar = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(newCollapsedState));
    };

    const dynamicNavItems = useMemo(() => {
        const allItemsMap: Record<string, { id: string; label: string; icon: React.FC<{ className?: string; }>; }> = 
            navItems.flatMap(g => g.items).reduce((acc, item) => {
                acc[item.id] = item;
                return acc;
            }, {} as Record<string, { id: string; label: string; icon: React.FC<{ className?: string; }>; }>);

        const favoriteItems = favorites
            .map(favId => allItemsMap[favId])
            .filter(Boolean);

        const favoriteGroup = {
            group: 'Favorites',
            items: favoriteItems,
        };

        const nonFavoriteGroups = navItems
            .map(group => ({
                ...group,
                items: group.items.filter(item =>
                    !favorites.includes(item.id as Page) &&
                    !hiddenPages.includes(item.id)
                ),
            }))
            .filter(group => group.items.length > 0);

        return favoriteItems.length > 0 ? [favoriteGroup, ...nonFavoriteGroups] : nonFavoriteGroups;
    }, [favorites, hiddenPages]);


    const filteredNavItems = useMemo(() => {
        if (!searchTerm) {
            return dynamicNavItems;
        }

        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = dynamicNavItems
            .map(group => ({
                ...group,
                items: group.items.filter(item =>
                    item.label.toLowerCase().includes(lowercasedFilter)
                ),
            }))
            .filter(group => group.items.length > 0);

        return filtered;
    }, [searchTerm, dynamicNavItems]);

    const renderPage = () => {
        switch (activePage) {
            case 'generator': return <ImageGenerator sharedPrompt={sharedPrompt} setSharedPrompt={setSharedPrompt} />;
            case 'library': return <PromptLibrary setActivePage={setActivePage} setSharedPrompt={setSharedPrompt} />;
            case 'polisher': return <PromptPolisher setActivePage={setActivePage} setSharedPrompt={setSharedPrompt} />;
            case 'autonotes': return <Autonotes sharedNoteContent={sharedNoteContent} setSharedNoteContent={setSharedNoteContent} />;
            case 'video': return <VideoIdeator />;
            case 'summarizer': return <MeetingSummarizer />;
            case 'code': return <CodeExplainer />;
            case 'email': return <EmailWriter />;
            case 'social': return <SocialMediaPostGenerator />;
            case 'recipe': return <RecipeCreator />;
            case 'fitness': return <FitnessPlanner />;
            case 'travel': return <TravelPlanner />;
            case 'story': return <StoryWriter />;
            case 'resume': return <ResumeBuilder />;
            case 'translator': return <LanguageTranslator />;
            case 'taskbuilder': return <TaskBuilder />;
            // FIX: Corrected variable names passed as props from `triggerNewPage` to `triggerNewWikiPage` and `setTriggerNewPage` to `setTriggerNewWikiPage` to match the state variable definitions.
            case 'wiki': return <PersonalWiki triggerNewPage={triggerNewWikiPage} setTriggerNewPage={setTriggerNewWikiPage} shortcuts={shortcuts} sharedNoteContent={sharedNoteContent} setSharedNoteContent={setSharedNoteContent} />;
            case 'blogpost': return <BlogPostWriter />;
            case 'adcopy': return <AdCopyGenerator />;
            case 'productdesc': return <ProductDescriptionWriter />;
            case 'ideagen': return <IdeaGenerator />;
            case 'coverletter': return <CoverLetterWriter />;
            case 'lessonplan': return <LessonPlanner />;
            case 'workout': return <WorkoutLog />;
            case 'mealplan': return <MealPlanner />;
            case 'character': return <CharacterCreator />;
            case 'domain': return <DomainNameGenerator />;
            case 'aitutor': return <AITutor />;
            case 'investment': return <InvestmentAnalyzer />;
            case 'legal': return <LegalDocSummarizer />;
            case 'debate': return <DebateTopicGenerator />;
            case 'gift': return <GiftIdeaGenerator />;
            case 'speech': return <SpeechWriter />;
            case 'dream': return <DreamInterpreter />;
            case 'negotiation': return <NegotiationScripter />;
            case 'music': return <MusicLyricGenerator />;
            case 'businessplan': return <BusinessPlanOutliner />;
            case 'codeconverter': return <CodeConverter />;
            case 'regex': return <RegexGenerator />;
            case 'apidocs': return <ApiDocWriter />;
            case 'sql': return <SqlQueryGenerator />;
            case 'brandname': return <BrandNameGenerator />;
            case 'videoscript': return <VideoScriptWriter />;
            case 'pressrelease': return <PressReleaseWriter />;
            case 'jobdesc': return <JobDescriptionWriter />;
            case 'marketresearch': return <MarketResearchAssistant />;
            case 'swot': return <SwotAnalysisGenerator />;
            case 'personalstory': return <PersonalizedStoryCreator />;
            case 'ethical': return <EthicalDilemmaSolver />;
            case 'textadventure': return <TextAdventureGame />;
            case 'budget': return <BudgetPlanner />;
            case 'studyguide': return <StudyGuideCreator />;
            case 'research': return <ResearchPaperSummarizer />;
            case 'analogy': return <AnalogyGenerator />;
            case 'fitnesscoach': return <FitnessCoach />;
            case 'dietarylog': return <DietaryLogAnalyzer />;
            case 'itineraryoptimizer': return <ItineraryOptimizer />;
            case 'symptomchecker': return <SymptomChecker />;
            case 'mentalhealth': return <MentalHealthCompanion />;
            case 'meditation': return <MeditationScriptGenerator />;
            case 'nutritionanalyzer': return <RecipeNutritionAnalyzer />;
            case 'factchecker': return <FactChecker />;
            case 'socratictutor': return <SocraticTutor />;
            case 'historicalchat': return <HistoricalFigureChat />;
            case 'argumentmapper': return <ArgumentMapper />;
            case 'booksummarizer': return <BookSummarizer />;
            case 'pitchdeck': return <PitchDeckCreator />;
            case 'competitoranalysis': return <CompetitorAnalysis />;
            case 'grantproposal': return <GrantProposalWriter />;
            case 'abtest': return <AbTestIdeaGenerator />;
            case 'customerpersona': return <CustomerPersonaGenerator />;
            case 'riskanalyzer': return <RiskAssessmentAnalyzer />;
            case 'errordebugger': return <ErrorMessageDebugger />;
            case 'unittest': return <UnitTestGenerator />;
            case 'apiendpoint': return <ApiEndpointSuggester />;
            case 'cronjob': return <CronJobExplainer />;
            case 'colorpalette': return <ColorPaletteGenerator />;
            case 'interiordesign': return <InteriorDesignIdeas />;
            case 'tattoo': return <TattooIdeaGenerator />;
            case 'poetry': return <PoetryGenerator />;
            case 'recommender': return <MovieBookRecommender />;
            case 'parodywriter': return <ParodySatireWriter />;
            case 'eventplanner': return <EventPlanner />;
            case 'plantcare': return <PlantCareAssistant />;
            case 'caradvisor': return <CarMaintenanceAdvisor />;
            case 'publicspeaking': return <PublicSpeakingCoach />;
            case 'diyplanner': return <DiyProjectPlanner />;
            case 'coderefactor': return <CodeRefactorSuggester />;
            case 'gtmstrategy': return <GtmStrategyGenerator />;
            case 'contractanalyzer': return <ContractAnalyzer />;
            case 'rephraser': return <ThesaurusRephraser />;
            case 'eli5': return <Eli5Explainer />;
            case 'icebreaker': return <MeetingIcebreakerGenerator />;
            case 'affirmations': return <PersonalizedAffirmations />;
            case 'conflict': return <ConflictResolutionAdvisor />;
            case 'formchecker': return <WorkoutFormChecker />;
            case 'recipescaler': return <RecipeScalerModifier />;
            case 'gitcommand': return <GitCommandGenerator />;
            case 'elevatorpitch': return <ElevatorPitchCrafter />;
            case 'brandvoice': return <BrandVoiceGuide />;
            case 'worldbuilder': return <WorldBuilderAssistant />;
            case 'mindmap': return <MindMapGenerator />;
            case 'historicalwhatif': return <HistoricalWhatIf />;
            case 'hobbysuggester': return <HobbySuggester />;
            case 'textresponder': return <TextMessageResponder />;
            case 'styleadvisor': return <PersonalStyleAdvisor />;
            case 'astrology': return <AstrologyInterpreter />;
            case 'apipayload': return <ApiPayloadGenerator />;
            case 'systemdesign': return <SystemDesignExplainer />;
            case 'cloudcost': return <CloudCostEstimator />;
            case 'security': return <SecurityVulnerabilityExplainer />;
            case 'qbr': return <QbrGenerator />;
            case 'okr': return <OkrGenerator />;
            case 'salesemail': return <SalesEmailSequenceWriter />;
            case 'investorupdate': return <InvestorUpdateDraftsman />;
            case 'financialstatement': return <FinancialStatementAnalyzer />;
            case 'marketsizing': return <MarketSizingEstimator />;
            case 'screenplay': return <ScreenplayFormatter />;
            case 'gdd': return <GddOutliner />;
            case 'magicsystem': return <MagicSystemCreator />;
            case 'standup': return <StandUpJokeWriter />;
            case 'architectural': return <ArchitecturalStyleSuggester />;
            case 'hypothesis': return <ScientificHypothesisGenerator />;
            case 'literarydevice': return <LiteraryDeviceIdentifier />;
            case 'thoughtexperiment': return <ThoughtExperimentGenerator />;
            case 'counterargument': return <CounterArgumentGenerator />;
            case 'cognitivebias': return <CognitiveBiasIdentifier />;
            case 'skincare': return <PersonalizedSkincareRoutine />;
            case 'mealprep': return <MealPrepSuggester />;
            case 'therapyjournal': return <TherapyJournalingPrompts />;
            case 'weddingvow': return <WeddingVowWriter />;
            case 'cocktail': return <CocktailRecipeCreator />;
            case 'boardgame': return <BoardGameIdeaGenerator />;
            case 'excuse': return <ExcuseGenerator />;
            case 'trivia': return <PersonalizedTriviaGenerator />;
            case 'etiquette': return <EtiquetteAdvisor />;
            case 'declutter': return <HomeDeclutteringPlan />;
            case 'sentiment': return <SentimentAnalyzer />;
            case 'userstory': return <UserStoryGenerator />;
            case 'quiz': return <QuizGenerator />;
            case 'haiku': return <HaikuGenerator />;
            case 'dietaryrecipe': return <DietaryRecipeFinder />;
            case 'acronym': return <AcronymExplainer />;
            case 'slogan': return <SloganGenerator />;
            case 'calculator': return <Calculator />;
            case 'handwritten': return <HandwrittenNotes onSaveNote={handleSaveNote} />;
            case 'whiteboard': return <WhiteboardTabs />;
            case 'aiimageeditor': return <AIImageEditor />;
            case 'contactmanager': return <ContactManager />;
            case 'enhancedtaskmanager': return <EnhancedTaskManager />;
            case 'clocktimerhub': return <ClockTimerHub />;
            case 'cryptoprices': return <CryptoPricesTracker />;
            case 'bookmarksmanager': return <BookmarksManager />;
            case 'bottlecounter': return <BottleCounter />;
            case 'chatroom': return <ChatRoom />;
            case 'guidesinfo': return <GuidesInfo />;
            case 'games': return <Games />;
            case 'userdashboard': return <UserDashboard />;
            case 'settings': return <Settings shortcuts={shortcuts} updateShortcuts={updateShortcuts} />;
            default: return <ImageGenerator sharedPrompt={sharedPrompt} setSharedPrompt={setSharedPrompt} />;
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <div className="h-screen w-screen bg-white dark:bg-slate-800 flex text-gray-900 dark:text-slate-100 transition-colors duration-300">
            {/* Sidebar */}
            <div
                className={`flex flex-col bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border-r border-gray-200 dark:border-slate-700 transition-all duration-300 ${isCollapsed ? 'px-3' : 'px-4'}`}
                style={{ width: isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : sidebarWidth }}
            >
                {/* Header */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} pt-6 pb-4`}>
                    {!isCollapsed && 
                        <div className="flex items-center gap-2">
                            <Logo className="h-8 w-8" />
                            <span className="text-xl font-bold text-gray-800 dark:text-slate-100">Accelerate.ai</span>
                        </div>
                    }
                    <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                        <ChevronDoubleLeftIcon className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                {/* Search */}
                {!isCollapsed && (
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-8 py-2 bg-gray-100 dark:bg-slate-900 border border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                        />
                         {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <XIcon className="h-4 w-4 text-gray-500" />
                            </button>
                        )}
                    </div>
                )}
                {/* Nav */}
                <nav className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-4">
                    {filteredNavItems.map(group => (
                        <div key={group.group}>
                            {!isCollapsed && <h2 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">{group.group}</h2>}
                            <ul className="space-y-1">
                                {group.items.map(item => (
                                    <li key={item.id} className="relative group/item">
                                        <button
                                            onClick={() => setActivePage(item.id as Page)}
                                            className={`w-full flex items-center gap-3 text-left py-2 rounded-lg transition-colors text-sm font-medium ${isCollapsed ? 'px-2 justify-center' : 'px-2'} ${activePage === item.id ? 'bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-100'}`}
                                            title={item.label}
                                        >
                                            <item.icon className="h-5 w-5 flex-shrink-0" />
                                            {!isCollapsed && <span className="pr-6 truncate">{item.label}</span>}
                                        </button>
                                        {!isCollapsed && item.id !== 'settings' && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                {/* Hide Button for Members+ */}
                                                {isMemberPlus && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            hidePageFromSidebar(item.id);
                                                        }}
                                                        className="p-1 rounded-full transition-opacity text-gray-400 dark:text-slate-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 opacity-0 group-hover/item:opacity-100"
                                                        title={`Hide ${item.label} from sidebar`}
                                                        aria-label={`Hide ${item.label} from sidebar`}
                                                    >
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Favorite Star Button */}
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            await toggleFavorite(item.id as Page);
                                                        } catch (error) {
                                                            console.error('Error toggling favorite:', error);
                                                        }
                                                    }}
                                                    disabled={!user || loading}
                                                    className={`p-1 rounded-full transition-opacity ${
                                                        (!user || loading)
                                                            ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed'
                                                            : 'text-gray-400 dark:text-slate-500 hover:bg-gray-300 dark:hover:bg-slate-600'
                                                    } ${favorites.includes(item.id as Page) ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}
                                                    title={
                                                        loading
                                                            ? 'Loading...'
                                                            : !user
                                                                ? 'Sign in to use favorites'
                                                                : favorites.includes(item.id as Page)
                                                                    ? 'Remove from Favorites'
                                                                    : 'Add to Favorites'
                                                    }
                                                    aria-label={
                                                        loading
                                                            ? 'Loading...'
                                                            : !user
                                                                ? 'Sign in to use favorites'
                                                                : favorites.includes(item.id as Page)
                                                                    ? `Remove ${item.label} from Favorites`
                                                                    : `Add ${item.label} to Favorites`
                                                    }
                                                >
                                                    {favorites.includes(item.id as Page)
                                                        ? <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                                                        : <StarIcon className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>
            
            {/* Resizer */}
            {!isCollapsed && (
                 <div
                    onMouseDown={handleMouseDown}
                    className="w-1.5 cursor-col-resize flex-shrink-0 bg-gray-200/50 dark:bg-slate-700/50 hover:bg-indigo-500 transition-colors"
                    aria-label="Resize sidebar"
                />
            )}
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-slate-900">
                {/* Top Header */}
                <header className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 z-50">
                    <div className="flex items-center space-x-4">
                        {/* Top Navigation Menu */}
                        <nav className="flex space-x-1">
                            {[
                                { id: 'pg-1', label: 'Games', page: 'games' },
                                { id: 'pg-2', label: 'Chat Room', page: 'chatroom' },
                                { id: 'pg-3', label: 'pg-3', page: 'generator' },
                                { id: 'pg-4', label: 'Guides&Info', page: 'guidesinfo' },
                                { id: 'pg-5', label: 'pg-5', page: 'generator' }
                            ].map((pageItem, index) => (
                                <button
                                    key={pageItem.id}
                                    onClick={() => setActivePage(pageItem.page as Page)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        activePage === pageItem.page
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                            : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {pageItem.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <UserProfileWidget onNavigate={(page) => setActivePage(page as Page)} />
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <VoiceProvider>
                        {renderPage()}
                    </VoiceProvider>
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <UserProfileProvider>
                <UsageTrackingProvider>
                    <AppContent />
                </UsageTrackingProvider>
            </UserProfileProvider>
        </AuthProvider>
    );
};

export default App;