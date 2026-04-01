import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader2, Bot, User } from 'lucide-react';
import config from '../config';

const SchemeChat = () => {
    const { schemeName } = useParams();
    const navigate = useNavigate();
    const decodedSchemeName = decodeURIComponent(schemeName || 'the scheme');
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const hasInitialized = useRef(false);

    // Get farmer profile from local storage to provide context to the AI
    const getFarmerProfile = () => {
        try {
            return JSON.parse(localStorage.getItem('user')) || {};
        } catch (e) {
            return {};
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            fetchInitialQuestion();
        }
    }, [decodedSchemeName]);

    const fetchInitialQuestion = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${config.API_BASE_URL}${config.endpoints.schemeChat}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schemeName: decodedSchemeName,
                    farmerProfile: getFarmerProfile(),
                    chatHistory: [],
                    userMessage: "Hello, what specific documents and details do I need for this scheme that aren't in my profile?"
                })
            });
            if (response.ok) {
                const data = await response.json();
                setMessages([{ role: 'assistant', content: data.message }]);
            }
        } catch (err) {
            setMessages([{ role: 'assistant', content: "Sorry, I couldn't connect to check your missing details." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${config.API_BASE_URL}${config.endpoints.schemeChat}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schemeName: decodedSchemeName,
                    farmerProfile: getFarmerProfile(),
                    chatHistory: messages,
                    userMessage: userMsg
                })
            });

            if (!response.ok) {
                throw new Error('Chat API returned an error');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, connection error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to format basic markdown-like bolding from AI
    const formatMessage = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-120px)] flex flex-col animate-fadeIn">
            <div className="flex items-center gap-4 mb-4 bg-white p-4 rounded-t-xl shadow-sm border-b border-green-100">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition relative group">
                    <ArrowLeft size={24} className="text-gray-600" />
                    <span className="absolute hidden group-hover:block top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded">Back</span>
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Application Assistant</h2>
                    <p className="text-sm text-green-700 font-medium">{decodedSchemeName}</p>
                </div>
            </div>

            <div className="flex-1 bg-gray-50 rounded-b-xl shadow-inner overflow-hidden flex flex-col border border-gray-200">
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-green-600' : 'bg-blue-600'}`}>
                                    {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{formatMessage(msg.content)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex max-w-[80%] gap-3 flex-row">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                                    <Loader2 size={18} className="animate-spin text-blue-600" />
                                    <span className="text-gray-500 text-sm">Reviewing guidelines...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSend} className="flex gap-2 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question or provide details..."
                            className="flex-1 pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-1.5 bottom-1.5 p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center aspect-square"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-2">AI assistant provides guidance based on official PDFs. Verify important requirements.</p>
                </div>
            </div>
        </div>
    );
};

export default SchemeChat;
