
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { marked } from 'marked';

interface ChatModalProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isGenerating: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ messages, onSendMessage, isGenerating, isOpen, onClose }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if(isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isGenerating) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
            onClose();
        }
    }

    const createMarkup = (text: string) => {
        return { __html: marked.parse(text) as string };
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleClickOutside}
        >
            <div ref={modalContentRef} className="w-full max-w-2xl h-[80vh] flex flex-col bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">AI Assistant</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-md rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                                    <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={createMarkup(msg.text)} />
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                             <div className="flex flex-col items-start">
                                 <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-slate-800 text-slate-200">
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Thinking...</span>
                                    </div>
                                 </div>
                             </div>
                        )}
                    </div>
                     <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-slate-700">
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-2">
                             <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your data..."
                                className="flex-grow block w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                                disabled={isGenerating}
                            />
                            <button type="submit" disabled={isGenerating} className="p-2 text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:bg-violet-500/50 disabled:cursor-not-allowed">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;