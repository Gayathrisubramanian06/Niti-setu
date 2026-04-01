import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { HelpingHand, ChevronRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 space-y-8 animate-fadeIn">
            <div className="bg-green-100 p-6 rounded-full shadow-lg">
                <HelpingHand size={64} className="text-green-700" />
            </div>

            <div className="space-y-4 max-w-lg">
                <h2 className="text-4xl font-bold text-gray-800">
                    Government Schemes made Simple
                </h2>
                <p className="text-xl text-gray-600">
                    Check your eligibility for schemes like PM Kisan, Fasal Bima Yojana, and more in seconds.
                </p>
            </div>

            <div className="w-full max-w-xs">
                <Button
                    onClick={() => navigate('/login')}
                    className="w-full text-lg py-4 shadow-xl transform transition hover:scale-105"
                >
                    Check Eligibility <ChevronRight size={24} />
                </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-lg">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-green-700 text-2xl">100+</h3>
                    <p className="text-gray-500 text-sm">Active Schemes</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-blue-700 text-2xl">50k+</h3>
                    <p className="text-gray-500 text-sm">Farmers Helped</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
