import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import config from '../config';

const SchemeApplication = () => {
    const { schemeName } = useParams();
    const navigate = useNavigate();
    const decodedSchemeName = decodeURIComponent(schemeName || 'Scheme');
    
    const [formSchema, setFormSchema] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const getFarmerProfile = () => {
        try { return JSON.parse(localStorage.getItem('user')) || {}; } 
        catch (e) { return {}; }
    };

    useEffect(() => {
        const generateForm = async () => {
            try {
                const fetchPromise = fetch(`${config.API_BASE_URL}${config.endpoints.schemeForm}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        schemeName: decodedSchemeName,
                        farmerProfile: getFarmerProfile()
                    })
                }).then(r => {
                    if (!r.ok) throw new Error('Failed to generate application form.');
                    return r.json();
                });

                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 4000));

                let data;
                try {
                    data = await Promise.race([fetchPromise, timeoutPromise]);
                } catch (err) {
                    console.warn("API quota exceeded or stalled, triggering Hackathon Fallback form:", err);
                    let fakeFields = [];
                    let fakeLink = "https://india.gov.in";
                    
                    if (decodedSchemeName.toLowerCase().includes('kusum')) {
                        fakeFields = [
                            { id: "pump_capacity", label: "Required Pump Capacity (in HP)", type: "number" },
                            { id: "pump_quote", label: "Do you have a Quotation from a certified vendor?", type: "checkbox" },
                            { id: "land_docs", label: "Are your Land Ownership documents verified?", type: "checkbox" }
                        ];
                        fakeLink = "https://pmkusum.mnre.gov.in";
                    } else if (decodedSchemeName.toLowerCase().includes('infra')) {
                        fakeFields = [
                            { id: "dpr_upload", label: "Do you have a Detailed Project Report (DPR) ready?", type: "checkbox" },
                            { id: "loan_amt", label: "Estimated Loan Amount Required (₹)", type: "number" },
                            { id: "bank_sanction", label: "Do you have an in-principle Bank Sanction?", type: "checkbox" }
                        ];
                        fakeLink = "https://agriinfra.dac.gov.in";
                    } else {
                        fakeFields = [
                            { id: "aadhaar_num", label: "Enter your 12-digit Aadhaar Number", type: "text" },
                            { id: "bank_acc", label: "Enter Aadhaar-Linked Bank Account Number", type: "text" },
                            { id: "khatoni_confirm", label: "Do you possess local Land Ownership Records (Khatoni/7-12)?", type: "checkbox" }
                        ];
                        fakeLink = "https://pmkisan.gov.in";
                    }

                    data = {
                        fields: fakeFields,
                        applicationLink: fakeLink
                    };
                }

                setFormSchema(data);
                
                // Initialize form state
                const initialData = {};
                data.fields?.forEach(field => {
                    initialData[field.id] = field.type === 'checkbox' ? false : '';
                });
                setFormData(initialData);
            } catch (err) {
                console.error(err);
                setError("Could not load the application requirements. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        generateForm();
    }, [decodedSchemeName]);

    const handleInputChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would be saved to a database and auto-filled into a PDF via pdflib
        setIsSubmitted(true);
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto p-12 text-center space-y-4 animate-pulse">
                <Loader2 size={48} className="mx-auto animate-spin text-green-600" />
                <h2 className="text-xl font-bold text-gray-700">Analyzing Your Profile...</h2>
                <p className="text-gray-500">Generating specific application requirements for {decodedSchemeName}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center bg-red-50 rounded-xl border border-red-200 mt-8">
                <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
                <p className="text-red-600">{error}</p>
                <Button onClick={() => navigate(-1)} className="mt-6 bg-red-600 hover:bg-red-700 text-white">Go Back</Button>
            </div>
        );
    }

    if (isSubmitted && formSchema) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-xl border border-green-200 shadow-sm mt-8 animate-slideUp">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Drafted!</h2>
                <p className="text-gray-600 mb-8">We have collected all missing details required for your application.</p>
                
                <div className="space-y-4">
                    <a 
                        href={formSchema.applicationLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full py-3 px-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg transition shadow-md"
                    >
                        Proceed to Official Portal
                    </a>
                    <button onClick={() => navigate('/dashboard')} className="block w-full py-3 px-4 text-green-700 font-semibold hover:bg-gray-50 rounded-lg transition">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition relative group">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Application Form</h2>
                    <p className="text-green-700 font-medium">{decodedSchemeName}</p>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800 text-sm mb-6 flex items-start gap-3">
                <FileText className="flex-shrink-0" size={20} />
                <p>We've analyzed your profile. To complete this application, you only need to provide the following missing details.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                
                {(!formSchema?.fields || formSchema.fields.length === 0) ? (
                    <div className="text-center py-8">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">You're all set!</h3>
                        <p className="text-gray-500 mt-2">Your profile already contains all the mandatory information for this scheme.</p>
                    </div>
                ) : (
                    formSchema.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                {field.label}
                            </label>
                            
                            {field.type === 'checkbox' ? (
                                <div className="flex items-center gap-3 mt-2">
                                    <input 
                                        type="checkbox" 
                                        id={field.id}
                                        checked={formData[field.id] || false}
                                        onChange={(e) => handleInputChange(field.id, e.target.checked)}
                                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        required
                                    />
                                    <label htmlFor={field.id} className="text-sm text-gray-600 cursor-pointer">Yes, I confirm</label>
                                </div>
                            ) : (
                                <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    value={formData[field.id] || ''}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                    required
                                />
                            )}
                        </div>
                    ))
                )}

                <div className="pt-6 border-t border-gray-100">
                    <Button type="submit" className="w-full py-3 text-lg font-bold shadow-md">
                        Complete Application
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SchemeApplication;
