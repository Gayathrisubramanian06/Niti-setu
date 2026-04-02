import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Lock, Phone } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState("");
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, pin }),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem("user", JSON.stringify(result.farmer));
                navigate("/dashboard");
            } else {
                setError(result.message || "Login failed");
            }
        } catch (err) {
            console.error("Login request error:", err);
            setError("Server error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-green-200 px-4">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-green-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Leaf size={120} /></div>
                    <Leaf size={48} className="text-white mx-auto mb-4" />
                    <h2 className="text-3xl font-black text-white tracking-tight">Login via PIN</h2>
                    <p className="text-green-100 mt-2 font-medium">Access your Niti-Setu Profile</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Mobile Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">Registered Mobile Number</label>
                        <div className="relative">
                            <Phone size={20} className="absolute left-4 top-3.5 text-green-600" />
                            <input
                                type="tel"
                                placeholder="10-digit number"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                pattern="[0-9]{10}"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 font-bold tracking-widest text-lg outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* 4-Digit PIN */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="text-sm font-bold text-green-800 block text-center">Enter 4-Digit Security PIN</label>
                        <div className="relative w-2/3 mx-auto">
                            <Lock size={20} className="absolute left-4 top-3.5 text-green-700" />
                            <input
                                type="password"
                                placeholder="----"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength="4"
                                className="w-full pl-12 pr-4 py-3 bg-green-50 rounded-xl border border-green-300 focus:ring-2 focus:ring-green-600 text-center font-black tracking-[1em] text-2xl outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-600 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

                    {/* Login Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-black text-xl py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition duration-300"
                        >
                            Secure Log In
                        </button>
                    </div>

                    {/* Signup Link */}
                    <p className="text-center text-gray-600 font-medium pt-4">
                        Not registered?{" "}
                        <Link to="/signup" className="text-green-700 font-black hover:underline">
                            Create Biometric Profile
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
