import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const BACKEND = 'http://localhost:5000';

/**
 * VoiceInput — tiny mic button that captures ONE field value and calls onValue(value).
 *
 * Props:
 *   fieldKey   — field name: "name"|"age"|"landholding"|"crops"|"category"|
 *                "state"|"district"|"block"|"village"|"aadhaar"|"mobile"|
 *                "bankAccount"|"ifsc"|"incomeRange"|"gender"|"irrigation"
 *   fieldLabel — human label shown in tooltip, e.g. "Age"
 *   language   — BCP-47 code, e.g. "hi-IN" (default "hi-IN")
 *   onValue    — callback(value: string) when extraction succeeds
 *   className  — optional extra Tailwind classes
 */
const VoiceInput = ({
    fieldKey,
    fieldLabel = 'this field',
    language = 'hi-IN',
    onValue,
    className = '',
}) => {
    const [status, setStatus] = useState('idle'); // idle | listening | processing | error
    const [tooltip, setTooltip] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => () => recognitionRef.current?.abort(), []);

    // Send transcript to backend → extract single field value
    const extractField = async (transcript) => {
        setStatus('processing');
        try {
            const res = await fetch(`${BACKEND}/api/extract-field`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: transcript, language, fieldKey, fieldLabel }),
            });
            if (!res.ok) throw new Error(`Server ${res.status}`);
            const { value } = await res.json();
            if (value !== null && value !== undefined && String(value).trim() !== '') {
                onValue?.(String(value));
                setStatus('idle');
                setTooltip('');
            } else {
                showError('Could not understand. Try again.');
            }
        } catch {
            showError('Server error. Try again.');
        }
    };

    const showError = (msg) => {
        setStatus('error');
        setTooltip(msg);
        setTimeout(() => { setStatus('idle'); setTooltip(''); }, 2500);
    };

    const startListening = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return showError('Use Chrome for voice input.');

        const rec = new SR();
        recognitionRef.current = rec;
        rec.lang = language;
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false; // ensure it stops automatically after one utterance

        rec.onstart = () => { 
            console.log(`[VoiceInput] Started listening for ${fieldLabel}`);
            setStatus('listening'); 
            setTooltip(`Listening for ${fieldLabel}…`); 
        };
        
        rec.onaudiostart = () => console.log('[VoiceInput] Audio capturing started');
        rec.onspeechstart = () => console.log('[VoiceInput] Speech start detected');
        rec.onspeechend = () => console.log('[VoiceInput] Speech end detected');

        rec.onresult = (e) => { 
            const transcript = e.results[0][0].transcript;
            console.log(`[VoiceInput] Result: "${transcript}"`);
            rec._final = transcript; 
        };
        
        rec.onnomatch = () => {
            console.log('[VoiceInput] No match found');
        };

        rec.onerror = (e) => {
            console.error(`[VoiceInput] Error: ${e.error}`);
            showError(`Error: ${e.error}`);
        };
        
        rec.onend = () => {
            console.log('[VoiceInput] Stopped listening');
            if (rec._final) {
                console.log(`[VoiceInput] Sending to backend: ${rec._final}`);
                extractField(rec._final);
            } else {
                // If it ended without results
                // Only show error if we are still marked as listening (i.e. didn't already error out)
                setStatus(prev => {
                    if (prev === 'listening') {
                        showError('No speech detected. Try again.');
                        return 'error';
                    }
                    return prev;
                });
            }
        };

        try {
            rec.start();
        } catch (e) {
            console.error('Failed to start speech recognition:', e);
            showError('Failed to start mic.');
        }
    };

    const stopListening = () => {
        console.log('[VoiceInput] Manually stopped');
        recognitionRef.current?.stop();
        // Fallback: If stop() doesn't fire onend
        setTimeout(() => {
            setStatus(prev => prev === 'listening' ? 'idle' : prev);
        }, 500);
    };

    const handleClick = () => {
        if (status === 'listening') stopListening();
        else if (status !== 'processing') startListening();
    };

    const colorMap = {
        idle: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700',
        listening: 'bg-red-500 text-white shadow-[0_0_0_5px_rgba(239,68,68,0.25)]',
        processing: 'bg-amber-400 text-white cursor-not-allowed',
        error: 'bg-red-100 text-red-600',
    };

    return (
        <div className="relative inline-flex items-center">
            <button
                type="button"
                onClick={handleClick}
                disabled={status === 'processing'}
                className={`inline-flex items-center justify-center rounded-full w-8 h-8 flex-shrink-0
                            transition-all duration-200 focus:outline-none
                            ${colorMap[status]} ${className}`}
                title={tooltip || `Tap to speak ${fieldLabel}`}
                aria-label={`Voice input for ${fieldLabel}`}
            >
                {status === 'processing'
                    ? <Loader2 size={14} className="animate-spin" />
                    : status === 'listening'
                        ? <MicOff size={14} />
                        : <Mic size={14} />
                }
            </button>

            {tooltip && (
                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                                 rounded bg-gray-800 text-white text-[10px] px-2 py-0.5 z-50 pointer-events-none">
                    {tooltip}
                </span>
            )}
        </div>
    );
};

export default VoiceInput;