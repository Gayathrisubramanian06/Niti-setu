import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        confirmPassword: "",
        state: "",
        district: "",
        crops: [],
    });
    const [error, setError] = useState("");
    const [otherCrop, setOtherCrop] = useState("");
    const [isOtherChecked, setIsOtherChecked] = useState(false);

    const statesAndDistricts = {
        Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
        Karnataka: ["Bengaluru", "Mysuru", "Mangalore"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
        Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
        Rajasthan: ["Jaipur", "Udaipur", "Jodhpur"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
        "West Bengal": ["Kolkata", "Darjeeling", "Siliguri"],
        Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode"],
        Telangana: ["Hyderabad", "Warangal"],
        Punjab: ["Ludhiana", "Amritsar"],
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

    const handleOtherToggle = (checked) => {
        setIsOtherChecked(checked);
        if (!checked) {
            setFormData({ ...formData, crops: formData.crops.filter(c => c !== otherCrop) });
            setOtherCrop("");
        }
    };

    const handleOtherCropChange = (value) => {
        setOtherCrop(value);
        const filteredCrops = formData.crops.filter(c => cropOptions.includes(c));
        setFormData({ ...formData, crops: [...filteredCrops, value] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        if (!formData.state || !formData.district) {
            setError("Please select state and district.");
            return;
        }
        if (formData.crops.length === 0) {
            setError("Please select at least one crop.");
            return;
        }

        setError("");

        try {
            const { confirmPassword, ...dataToSend } = formData;

            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                navigate("/profile");
            } else {
                setError(result.message || "Signup failed");
            }
        } catch (err) {
            console.error("Signup request error:", err);
            setError("Server error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300 px-4 py-10">
            <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8">
                <div className="flex flex-col items-center mb-6">
                    <Leaf size={40} className="text-green-700" />
                    <h2 className="text-2xl font-bold text-green-800 mt-2">Create Your Account</h2>
                    <p className="text-gray-600 text-sm">Join Niti-Setu today 🌿</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" />
                    <input type="text" name="username" placeholder="Username" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" />

                    {/* State & District */}
                    <select name="state" value={formData.state} onChange={handleStateChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500">
                        <option value="">Select State</option>
                        {Object.keys(statesAndDistricts).map(state => <option key={state} value={state}>{state}</option>)}
                    </select>

                    <select name="district" value={formData.district} onChange={handleChange} required disabled={!formData.state} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500">
                        <option value="">Select District</option>
                        {formData.state && statesAndDistricts[formData.state].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    {/* Crops */}
                    <div>
                        <p className="font-medium text-gray-700 mb-2">Crops Planted</p>
                        <div className="grid grid-cols-2 gap-2">
                            {cropOptions.map(crop => (
                                <label key={crop} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={formData.crops.includes(crop)} onChange={() => handleCropChange(crop)} className="accent-green-600" />
                                    {crop}
                                </label>
                            ))}
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={isOtherChecked} onChange={e => handleOtherToggle(e.target.checked)} className="accent-green-600" />
                                Other
                            </label>
                        </div>

                        {isOtherChecked && (
                            <input type="text" placeholder="Enter other crop" value={otherCrop} onChange={e => handleOtherCropChange(e.target.value)} className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" />
                        )}
                    </div>

                    {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

                    <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition duration-300">Sign Up</button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-green-700 font-semibold hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
