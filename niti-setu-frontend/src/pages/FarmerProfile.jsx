import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import VoiceInput from '../components/VoiceInput';
import { User, MapPin, Ruler } from 'lucide-react';
import config from '../config';
import mockSchemes from '../data/mockSchemes.json'; // Import mock data

const FarmerProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        landholding: '',
        state: '',
        district: '',
        crop: '',
        category: 'General'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setFormData(prev => ({
                    ...prev,
                    name: user.name || '',
                    state: user.state || '',
                    district: user.district || '',
                    crop: (user.crops && user.crops.length > 0) ? user.crops[0] : prev.crop
                }));
            } catch (e) {
                console.error("Error parsing user from local storage", e);
            }
        }
    }, []);

    const handleVoiceData = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${config.API_BASE_URL}${config.endpoints.eligibility}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch eligibility results. Please try again.');
            }

            const data = await response.json();
            
            // Map the backend's single AI response into the array format the dashboard expects
            const formattedSchemes = [{
                id: Date.now(),
                name: "AI Eligibility Analysis",
                eligible: data.status === "Eligible",
                details: data.reason || "No reason provided",
                proof: {
                    text: data.citation || "No citation available",
                    page: "AI Document Search"
                }
            }];

            navigate('/dashboard', { state: { schemes: formattedSchemes } });
        } catch (err) {
            console.error("API Error:", err);
            // Fallback to mock data for demonstration if backend is missing
            // Simulate a short delay then proceed
            setTimeout(() => {
                alert("Note: Backend is unreachable. Showing MOCK data for demonstration.");
                navigate('/dashboard', { state: { schemes: mockSchemes } });
            }, 1000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6 animate-slideUp">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
                <p className="text-gray-600">Enter details to find eligible schemes</p>
            </div>

            <div className="flex justify-center mb-8">
                <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-gray-500">Tap to Autofill with Voice</p>
                    <VoiceInput onVoiceData={handleVoiceData} />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                type="number"
                                name="age"
                                placeholder="Age"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="number"
                                name="landholding"
                                placeholder="Land (Hectares)"
                                value={formData.landholding}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                name="crop"
                                placeholder="Main Crop (e.g., Wheat)"
                                value={formData.crop}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-700"
                            >
                                <option value="General">General</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-700"
                            required
                        >
                            <option value="">Select State</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                            <option value="Assam">Assam</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Chhattisgarh">Chhattisgarh</option>
                            <option value="Goa">Goa</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Manipur">Manipur</option>
                            <option value="Meghalaya">Meghalaya</option>
                            <option value="Mizoram">Mizoram</option>
                            <option value="Nagaland">Nagaland</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Sikkim">Sikkim</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Tripura">Tripura</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Uttarakhand">Uttarakhand</option>
                            <option value="West Bengal">West Bengal</option>

                        </select>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full text-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Checking Eligibility...' : 'See Eligible Schemes'}
                </Button>
            </form>
        </div>
    );
};

export default FarmerProfile;
