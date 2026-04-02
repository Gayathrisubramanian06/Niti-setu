import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, User, MapPin, Search, Lock, Mic, Phone, CreditCard, Droplet, Users, ShieldCheck } from "lucide-react";

const SignUp = () => {
    const navigate = useNavigate();
    
    // Core 6-Part Form State
    const [formData, setFormData] = useState({
        // 1. Personal
        name: "", mobile: "", aadhaar: "", age: "", gender: "Male",
        // 2. Agriculture
        landholding: "", landOwnership: "Owner", crops: [], irrigation: "Rain-fed",
        // 3. Socio-Economic
        category: "General", incomeRange: "Below 1 Lakh", bankAccount: "", ifsc: "",
        // 4. Location
        state: "", district: "", block: "", village: "",
        // 5. Voice/Settings
        language: "Hindi",
        // 6. Security
        pin: "", confirmPin: "", dataConsent: false
    });

    const [error, setError] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [voiceEnrolled, setVoiceEnrolled] = useState(false);

    // Mock DBs
    const statesAndDistricts = {
        Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
        Karnataka: ["Bengaluru", "Mysuru", "Mangalore"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
        Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
    };
    const cropOptions = ["Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Pulses", "Vegetables"];

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleStateChange = (e) => setFormData({ ...formData, state: e.target.value, district: "" });

    const handleCropChange = (crop) => {
        const crops = formData.crops.includes(crop)
            ? formData.crops.filter(c => c !== crop)
            : [...formData.crops, crop];
        setFormData({ ...formData, crops });
    };

    const handleVoiceEnrollment = (e) => {
        e.preventDefault();
        setIsRecording(true);
        setTimeout(() => {
            setIsRecording(false);
            setVoiceEnrolled(true);
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (formData.pin.length !== 4) return setError("PIN must be exactly 4 digits.");
        if (formData.pin !== formData.confirmPin) return setError("PINs do not match!");
        if (!formData.dataConsent) return setError("You must agree to Data Consent.");
        if (formData.crops.length === 0) return setError("Select at least one crop.");

        setError("");

        try {
            const { confirmPin, ...dataToSend } = formData;
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Biometric Profile Successfully Created!");
                navigate("/login");
            } else {
                setError(result.message || "Signup failed");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("Server error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-start">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-green-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Leaf size={120} /></div>
                    <Leaf size={48} className="text-white mx-auto mb-4" />
                    <h2 className="text-3xl font-black text-white tracking-tight">Farmer Enrollment Portal</h2>
                    <p className="text-green-100 mt-2 font-medium">Step 1 of 1: Comprehensive Digital Identity Creation</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-12">
                    
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-red-700 font-bold">{error}</p>
                        </div>
                    )}

                    {/* Section 1: Personal Identification */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-2">
                            <User className="text-green-600" size={24} />
                            <h3 className="text-xl font-bold text-gray-800">1. Personal Identification</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" name="name" placeholder="Full Official Name" onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                            <div className="relative">
                                <Phone size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                <input type="tel" name="mobile" placeholder="Mobile Number (10 digits)" onChange={handleChange} required pattern="[0-9]{10}" className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <input type="text" name="aadhaar" placeholder="Aadhaar Number (12 digits)" onChange={handleChange} required pattern="[0-9]{12}" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" name="age" placeholder="Age" onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                                <select name="gender" onChange={handleChange} value={formData.gender} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Agricultural Profile */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-2">
                            <Leaf className="text-green-600" size={24} />
                            <h3 className="text-xl font-bold text-gray-800">2. Agricultural Profile</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <input type="number" name="landholding" placeholder="Landholding (Hectares)" step="0.1" onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <select name="landOwnership" onChange={handleChange} value={formData.landOwnership} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="Owner">Owner</option>
                                <option value="Tenant">Tenant</option>
                                <option value="Sharecropper">Sharecropper</option>
                            </select>
                            <div className="relative">
                                <Droplet size={20} className="absolute left-4 top-3.5 text-gray-400" />
                                <select name="irrigation" onChange={handleChange} value={formData.irrigation} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none">
                                    <option value="Rain-fed">Rain-fed</option>
                                    <option value="Borewell">Borewell</option>
                                    <option value="Canal-fed">Canal-fed</option>
                                </select>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="font-bold text-gray-700 mb-3 text-sm">What do you currently grow on your land?</p>
                            <div className="flex flex-wrap gap-3">
                                {cropOptions.map(crop => (
                                    <label key={crop} className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-medium transition ${formData.crops.includes(crop) ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'}`}>
                                        <input type="checkbox" className="hidden" checked={formData.crops.includes(crop)} onChange={() => handleCropChange(crop)} />
                                        {crop}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Socio-Economic */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-2">
                            <Users className="text-green-600" size={24} />
                            <h3 className="text-xl font-bold text-gray-800">3. Socio-Economic Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <select name="category" onChange={handleChange} value={formData.category} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none">
                                    <option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option>
                                </select>
                                <select name="incomeRange" onChange={handleChange} value={formData.incomeRange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none">
                                    <option value="Below 1 Lakh">Below ₹1 Lakh</option>
                                    <option value="1-3 Lakhs">₹1-3 Lakhs</option>
                                    <option value="3-5 Lakhs">₹3-5 Lakhs</option>
                                    <option value="Above 5 Lakhs">Above ₹5 Lakhs</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <CreditCard size={20} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input type="text" name="bankAccount" placeholder="A/C Number" onChange={handleChange} required className="w-full pl-10 pr-2 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                                <input type="text" name="ifsc" placeholder="IFSC Code" onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none uppercase" />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Location */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-2">
                            <MapPin className="text-green-600" size={24} />
                            <h3 className="text-xl font-bold text-gray-800">4. Location & Territory</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <select name="state" value={formData.state} onChange={handleStateChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="">Select State</option>
                                {Object.keys(statesAndDistricts).map(state => <option key={state} value={state}>{state}</option>)}
                            </select>
                            <select name="district" value={formData.district} onChange={handleChange} required disabled={!formData.state} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="">Select District</option>
                                {formData.state && statesAndDistricts[formData.state].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <input type="text" name="block" placeholder="Taluka/Block" onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                            <input type="text" name="village" placeholder="Village/Panchayat" onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                    </div>

                    {/* Section 5: Voice Interaction Settings */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-2">
                            <Mic className="text-green-600" size={24} />
                            <h3 className="text-xl font-bold text-gray-800">5. Voice Interaction Setup</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <select name="language" onChange={handleChange} value={formData.language} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="Hindi">Hindi</option>
                                <option value="English">English</option>
                                <option value="Marathi">Marathi</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Bengali">Bengali</option>
                            </select>
                            
                            <button 
                                onClick={handleVoiceEnrollment}
                                type="button" 
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition duration-300 ${voiceEnrolled ? 'bg-green-100 border-2 border-green-500 text-green-700' : isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'}`}
                            >
                                <Mic size={20} />
                                {voiceEnrolled ? 'Biometric Voice Enrolled ✅' : isRecording ? 'Recording Voice-Print...' : 'Click to Enroll Voice Sample'}
                            </button>
                        </div>
                    </div>

                    {/* Section 6: Security & Consent */}
                    <div className="space-y-6 bg-green-50 p-6 rounded-2xl border border-green-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-green-200 pb-2 mb-4">
                            <ShieldCheck className="text-green-600" size={24} />
                            <h3 className="text-xl font-bold text-green-900">6. Security & Consent</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-green-800">Create 4-Digit Login PIN</label>
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <Lock size={18} className="absolute left-3 top-3 text-green-600" />
                                        <input type="password" name="pin" placeholder="PIN" maxLength="4" onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-green-300 focus:ring-2 focus:ring-green-600 text-center font-black tracking-[0.5em] text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <input type="password" name="confirmPin" placeholder="Confirm" maxLength="4" onChange={handleChange} required className="w-full px-4 py-2.5 bg-white rounded-lg border border-green-300 focus:ring-2 focus:ring-green-600 text-center font-black tracking-[0.5em] text-lg" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-xl border border-green-200 mt-6 md:mt-0">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" name="dataConsent" checked={formData.dataConsent} onChange={(e) => setFormData({...formData, dataConsent: e.target.checked})} className="mt-1 w-5 h-5 accent-green-600 cursor-pointer" />
                                    <span className="text-xs text-gray-600 leading-tight block">
                                        <strong>Data Usage Consent:</strong> I digitally authorize Niti-Setu to utilize my Aadhaar, Land, and Bank details specifically for matching and applying to Government Subsidies and Direct Benefit Transfers.
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6">
                        <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-black text-xl py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition duration-300">
                            Register Digital Farmer Profile
                        </button>
                        <p className="text-center text-gray-500 font-medium mt-6">
                            Already enrolled? <Link to="/login" className="text-green-700 font-bold hover:underline">Log In via Mobile & PIN</Link>
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default SignUp;
