import React, { useState } from 'react';
import { Mic } from 'lucide-react';

const VoiceInput = ({ onVoiceData }) => {
    const [isListening, setIsListening] = useState(false);

    const toggleListening = () => {
        setIsListening(!isListening);
        // Mock interaction: In a real app, this would capture audio and transcribe.
        // Here we just toggle visual state.
        if (!isListening) {
            setTimeout(() => {
                setIsListening(false);
                if (onVoiceData) {
                    // Mock data return
                    onVoiceData({
                        age: "45",
                        landSize: "2.5",
                        state: "Maharashtra"
                    });
                    alert("Mock Voice Input Received: \nAge: 45\nLand: 2.5 Hectares\nState: Maharashtra");
                }
            }, 2000); // Simulate 2 seconds of listening
        }
    };

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`p-4 rounded-full transition-all duration-300 ${isListening
                    ? 'bg-red-500 animate-pulse shadow-lg scale-110'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                } text-white`}
            title={isListening ? "Listening..." : "Tap to Speak"}
        >
            <Mic size={32} />
        </button>
    );
};

export default VoiceInput;
