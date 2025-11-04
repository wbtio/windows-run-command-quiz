import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Command, GameState, AnswerFeedback } from './types';
import { COMMANDS } from './constants';

// --- HELPER FUNCTIONS ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- SVG ICONS ---
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-1.125 6.01 6.01 0 0 0 1.5-1.125m-3 2.25M12 18v-5.25m0 0a6.01 6.01 0 0 1-1.5-1.125 6.01 6.01 0 0 1-1.5-1.125m3 2.25M12 18v-5.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75A4.5 4.5 0 0 1 12 4.5a4.5 4.5 0 0 1 2.25 2.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 0 0 6.75-6.75H5.25a6.75 6.75 0 0 0 6.75 6.75Z" />
    </svg>
);

const SystemIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-.871A3 3 0 0 1 14.1 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h9.75a2.25 2.25 0 0 1 2.25 2.25Z" />
    </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226m-2.22 2.452a17.933 17.933 0 0 0-2.22-2.452m2.22 2.452a23.888 23.888 0 0 0-3.337 1.524m3.337-1.524c.344.135.668.297.978.483m-9.78-0.483A9.955 9.955 0 0 0 3 11.25m14.95-6.308a9.955 9.955 0 0 0-3.337-1.524m3.337 1.524c-.344.135-.668.297-.978.483m9.78-0.483a9.959 9.959 0 0 1 3.337 1.524m-3.337-1.524a23.888 23.888 0 0 1 2.22 2.452m-2.22-2.452a17.933 17.933 0 0 1 2.22 2.452m0 0a23.91 23.91 0 0 1 1.524 3.337m-1.524-3.337a9.959 9.959 0 0 1-.483.978m.483-.978a17.932 17.932 0 0 1-2.452 2.22m2.452-2.22m-2.452 2.22a23.91 23.91 0 0 0-1.524 3.337m1.524-3.337a9.955 9.955 0 0 0-.483.978m-.483-.978a17.932 17.932 0 0 0-2.452 2.22m-2.452-2.22a23.888 23.888 0 0 0-3.337-1.524m3.337 1.524c-.344-.135-.668-.297-.978-.483m9.78.483a9.955 9.955 0 0 1-3.337 1.524m3.337-1.524c.344-.135.668-.297.978-.483m-9.78.483a9.959 9.959 0 0 1-3.337-1.524m3.337-1.524a23.888 23.888 0 0 1-2.22-2.452m2.22 2.452a17.933 17.933 0 0 1-2.22-2.452m0 0a23.91 23.91 0 0 1-1.524-3.337m1.524 3.337a9.959 9.959 0 0 1 .483-.978m-.483.978a17.932 17.932 0 0 1 2.452-2.22m-2.452 2.22m2.452-2.22a23.91 23.91 0 0 0 1.524-3.337m-1.524 3.337a9.955 9.955 0 0 0 .483-.978m.483-.978a17.932 17.932 0 0 0 2.452-2.22m-7.404 4.442a3 3 0 1 0-5.898 0 3 3 0 0 0 5.898 0Z" />
    </svg>
);

const AppsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
);

const ActionsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.89 1.89m-12.334 0L6.166 6.166m12.334 0-1.89-1.89m-1.89 1.89-1.89-1.89m6.034 16.346-1.89-1.89m-1.89 1.89-1.89-1.89m1.89 1.89 1.89-1.89m-12.334-1.89 1.89-1.89" />
    </svg>
);

const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);


// --- UI COMPONENTS ---
interface StartScreenProps {
  onStart: () => void;
  onShowCommands: () => void;
}
const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowCommands }) => (
  <div className="text-center">
    <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-4">Windows Run Command Quiz</h1>
    <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-2" dir="rtl">اختبار أوامر التشغيل في ويندوز</h2>
    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
      Test your knowledge of Windows Run commands. For each description, type the correct command and press Enter.
    </p>
    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto" dir="rtl">
      اختبر معرفتك بأوامر التشغيل في ويندوز. لكل وصف، اكتب الأمر الصحيح واضغط على Enter.
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onStart}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-full text-xl transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-teal-500/30 w-full sm:w-auto"
        >
          Start Quiz / ابدأ الاختبار
        </button>
        <button
          onClick={onShowCommands}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 w-full sm:w-auto"
        >
          View Commands / عرض الأوامر
        </button>
    </div>
  </div>
);

interface ResultsScreenProps {
    score: number;
    total: number;
    onRestart: () => void;
}
const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, total, onRestart }) => (
    <div className="text-center bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
        <h2 className="text-3xl font-bold text-teal-400 mb-4">Quiz Complete!</h2>
        <p className="text-xl text-gray-300 mb-6">Your Score:</p>
        <p className="text-6xl font-bold text-white mb-8">
            {score} <span className="text-3xl text-gray-400">/ {total}</span>
        </p>
        <button
            onClick={onRestart}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-cyan-500/30"
        >
            Try Again / حاول مرة أخرى
        </button>
    </div>
);


interface QuizScreenProps {
    currentCommand: Command;
    currentQuestionIndex: number;
    totalQuestions: number;
    onAnswer: (userAnswer: string) => void;
    onShowAnswer: () => void;
    feedback: AnswerFeedback;
}
const QuizScreen: React.FC<QuizScreenProps> = ({ currentCommand, currentQuestionIndex, totalQuestions, onAnswer, onShowAnswer, feedback }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, [currentQuestionIndex]);
    
    useEffect(() => {
        if(feedback !== AnswerFeedback.None) {
            const timer = setTimeout(() => {
                setInputValue('');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [feedback])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && feedback === AnswerFeedback.None) {
            onAnswer(inputValue.trim());
        }
    };

    const feedbackColor = 
        feedback === AnswerFeedback.Correct ? 'border-green-500 ring-green-500/50' :
        feedback === AnswerFeedback.Incorrect ? 'border-red-500 ring-red-500/50' :
        'border-gray-600 focus-within:border-teal-500 focus-within:ring-teal-500/50';

    return (
        <div className="w-full max-w-3xl">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center text-gray-300 mb-2">
                    <span>Question</span>
                    <span>{currentQuestionIndex + 1} / {totalQuestions}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div>
                </div>
            </div>

            {/* Quiz Card */}
            <div className={`bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 transition-all duration-300`}>
                <div className="mb-6 text-center">
                    <p className="text-gray-400 text-sm mb-2">DESCRIPTION</p>
                    <p className="text-2xl font-semibold text-white mb-3">{currentCommand.description_en}</p>
                    <p className="text-2xl font-semibold text-white" dir="rtl">{currentCommand.description_ar}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="command-input" className="block text-sm font-medium text-gray-400 mb-2 text-center">TYPE THE COMMAND BELOW</label>
                    <div className="relative">
                        <input
                            ref={inputRef}
                            id="command-input"
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={feedback !== AnswerFeedback.None}
                            className={`w-full bg-gray-900 text-white text-center text-xl p-4 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${feedbackColor}`}
                            placeholder="e.g. cmd"
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {feedback === AnswerFeedback.Correct && <CheckIcon className="h-8 w-8 text-green-500" />}
                            {feedback === AnswerFeedback.Incorrect && <XMarkIcon className="h-8 w-8 text-red-500" />}
                        </div>
                    </div>
                </form>
                
                <div className="mt-4 text-center h-12 flex flex-col justify-center items-center">
                    {feedback === AnswerFeedback.Incorrect && (
                        <p className="text-red-400 animate-pulse">
                            Correct answer: <span className="font-mono font-bold">{currentCommand.command}</span>
                        </p>
                    )}
                    {feedback === AnswerFeedback.None && (
                         <button
                            onClick={onShowAnswer}
                            className="flex items-center justify-center mx-auto gap-2 text-gray-400 hover:text-yellow-400 transition-colors"
                            aria-label="Show Answer"
                        >
                            <LightbulbIcon className="h-5 w-5" />
                            <span>Show Answer / إظهار الإجابة</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const CATEGORIES = [
    { 
        name_en: "System Management & Tools",
        name_ar: "إدارة النظام والأدوات",
        icon: <SystemIcon className="h-8 w-8 text-cyan-400" />,
        commands: ['hdwwiz.cpl', 'control admintools', 'certmgr.msc', 'dcomcnfg', 'compmgmt.msc', 'diskmgmt.msc', 'eventvwr.msc', 'services.msc', 'msinfo32', 'sysdm.cpl', 'wmimgmt.msc', 'msconfig', 'taskman', 'defrag']
    },
    { 
        name_en: "Control Panel & Settings",
        name_ar: "لوحة التحكم والإعدادات",
        icon: <SettingsIcon className="h-8 w-8 text-cyan-400" />,
        commands: ['control', 'timedate.cpl', 'control desktop', 'desk.cpl', 'control fonts', 'fonts', 'inetcpl.cpl', 'control keyboard', 'control mouse', 'powercfg.cpl', 'mmsys.cpl']
    },
    { 
        name_en: "Applications & Utilities",
        name_ar: "التطبيقات والأدوات المساعدة",
        icon: <AppsIcon className="h-8 w-8 text-cyan-400" />,
        commands: ['fsquirt', 'calc', 'charmap', 'cleanmgr', 'iexplore', 'mrt', 'mspaint', 'pbrush', 'notepad', 'write', 'osk', 'magnify', 'explorer']
    },
    { 
        name_en: "System Actions",
        name_ar: "إجراءات النظام",
        icon: <ActionsIcon className="h-8 w-8 text-cyan-400" />,
        commands: ['cmd', 'logoff', 'shutdown', 'winver', 'recent']
    },
];

interface CommandListScreenProps {
    onBack: () => void;
}
const CommandListScreen: React.FC<CommandListScreenProps> = ({ onBack }) => (
    <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-teal-400">Command List / قائمة الأوامر</h1>
             <button
                onClick={onBack}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full text-lg transition-transform transform hover:scale-105 duration-300"
                aria-label="Back to main menu"
            >
                <BackIcon className="h-5 w-5" />
                <span>Back</span>
            </button>
        </div>
        <div className="space-y-8">
            {CATEGORIES.map(category => (
                <div key={category.name_en} className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-800/50 flex items-center gap-4">
                        {category.icon}
                        <div>
                            <h2 className="text-xl font-bold text-white">{category.name_en}</h2>
                            <h3 className="text-lg font-bold text-gray-300" dir="rtl">{category.name_ar}</h3>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-700">
                        {COMMANDS
                            .filter(cmd => category.commands.includes(cmd.command.toLowerCase()))
                            .map(cmd => (
                                <div key={cmd.command} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                    <p className="font-mono text-lg text-teal-300 md:col-span-1">{cmd.command}</p>
                                    <div className="md:col-span-2">
                                        <p className="text-gray-200">{cmd.description_en}</p>
                                        <p className="text-gray-300" dir="rtl">{cmd.description_ar}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    </div>
);


// --- MAIN APP COMPONENT ---
export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<AnswerFeedback>(AnswerFeedback.None);

  const startQuiz = useCallback(() => {
    const uniqueCommands = Array.from(new Map(COMMANDS.map(cmd => [cmd.command.toLowerCase(), cmd])).values());
    setCommands(shuffleArray(uniqueCommands));
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback(AnswerFeedback.None);
    setGameState(GameState.Playing);
  }, []);
  
  const showCommandList = useCallback(() => {
      setGameState(GameState.CommandList);
  }, []);

  const goToStart = useCallback(() => {
      setGameState(GameState.Start);
  }, []);

  const handleAnswer = useCallback((userAnswer: string) => {
    const isCorrect = userAnswer.toLowerCase() === commands[currentQuestionIndex].command.toLowerCase();
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(AnswerFeedback.Correct);
    } else {
      setFeedback(AnswerFeedback.Incorrect);
    }

    setTimeout(() => {
      if (currentQuestionIndex < commands.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setFeedback(AnswerFeedback.None);
      } else {
        setGameState(GameState.Finished);
      }
    }, 1500);
  }, [currentQuestionIndex, commands]);

  const handleShowAnswer = useCallback(() => {
    if (feedback !== AnswerFeedback.None) return;

    setFeedback(AnswerFeedback.Incorrect);

    setTimeout(() => {
      if (currentQuestionIndex < commands.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setFeedback(AnswerFeedback.None);
      } else {
        setGameState(GameState.Finished);
      }
    }, 1500);
  }, [currentQuestionIndex, commands, feedback]);


  const renderGameState = () => {
    switch (gameState) {
      case GameState.Playing:
        return (
          <QuizScreen 
            currentCommand={commands[currentQuestionIndex]} 
            currentQuestionIndex={currentQuestionIndex} 
            totalQuestions={commands.length}
            onAnswer={handleAnswer}
            onShowAnswer={handleShowAnswer}
            feedback={feedback}
          />
        );
      case GameState.Finished:
        return <ResultsScreen score={score} total={commands.length} onRestart={startQuiz} />;
      case GameState.CommandList:
        return <CommandListScreen onBack={goToStart} />;
      case GameState.Start:
      default:
        return <StartScreen onStart={startQuiz} onShowCommands={showCommandList} />;
    }
  };

  return (
    <main className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl mx-auto py-8">
        {renderGameState()}
      </div>
    </main>
  );
}