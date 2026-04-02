import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mockSchemes from '../data/mockSchemes.json';
import Button from '../components/Button';
import { CheckCircle, XCircle, FileText, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const EligibilityDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedScheme, setExpandedScheme] = useState(null);

    // Use schemes from navigation state (API response) or fallback to mock data
    const schemes = location.state?.schemes || mockSchemes;

    const toggleExpand = (id) => {
        setExpandedScheme(expandedScheme === id ? null : id);
    };

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Your Eligibility Results</h2>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800 text-sm mb-6">
                <p><strong>Note:</strong> These results are based on the information provided. Please visit the official portal for final verification.</p>
            </div>

            {schemes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No matching schemes found based on your profile.</p>
                    <Button
                        onClick={() => navigate('/profile')}
                        variant="outline"
                        className="mt-4"
                    >
                        Update Profile
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {schemes.map((scheme) => (
                        <div
                            key={scheme.id}
                            className={`border rounded-xl overflow-hidden transition-all duration-300 ${scheme.eligible ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
                                }`}
                        >
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleExpand(scheme.id)}
                            >
                                <div className="flex items-center gap-4">
                                    {scheme.eligible ? (
                                        <CheckCircle className="text-green-600 flex-shrink-0" size={28} />
                                    ) : (
                                        <XCircle className="text-red-600 flex-shrink-0" size={28} />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-800">{scheme.name}</h3>
                                        <span className={`text-sm font-semibold ${scheme.eligible ? 'text-green-700' : 'text-red-700'}`}>
                                            {scheme.eligible ? 'You are Eligible' : 'Not Eligible'}
                                        </span>
                                    </div>
                                </div>
                                {expandedScheme === scheme.id ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                            </div>

                            {expandedScheme === scheme.id && (
                                <div className="px-4 pb-4 pt-0 text-gray-600 text-sm space-y-3 border-t border-gray-100 bg-white/50">
                                    <p className="mt-3">{scheme.details}</p>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-start gap-2 text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                                            <FileText size={12} />
                                            Proof from Guidelines
                                        </div>
                                        <blockquote className="italic text-gray-700 border-l-4 border-gray-300 pl-3 py-1">
                                            "{scheme.proof.text}"
                                        </blockquote>
                                        <p className="text-right text-xs text-gray-500 mt-1">Found on Page {scheme.proof.page}</p>
                                    </div>
                                    <div className="mt-4 pt-2 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-2">
                                            {scheme.eligible 
                                                ? "Next Steps: Determine required documents and start your application." 
                                                : "Missing Requirements? Chat with our AI to learn how to prepare your documents."}
                                        </p>
                                        <Button 
                                            className={`w-full py-2 text-sm text-white shadow-md transition-all ${scheme.eligible ? 'bg-green-700 hover:bg-green-800' : 'bg-blue-600 hover:bg-blue-700'}`} 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                navigate(`/apply/${encodeURIComponent(scheme.name)}`, { state: { scheme } }); 
                                            }}>
                                            {scheme.eligible ? "Apply Now & View Checklist" : "Apply Now (Fill Missing Requirements)"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EligibilityDashboard;
