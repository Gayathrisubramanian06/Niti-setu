import React from "react";
import { Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();   // ✅ important
  const user = localStorage.getItem("user");

  return (
    <header className="bg-green-700 text-white p-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Leaf size={28} />
        <h1 className="text-xl font-bold">Niti-Setu</h1>
      </div>

      <div className="space-x-4">
        {user ? (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-600 transition"
            >
              Profile
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
              className="px-4 py-2 rounded-lg border border-white font-semibold hover:bg-green-600 transition"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg bg-white text-green-700 font-semibold hover:bg-gray-100 transition"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 rounded-lg border border-white font-semibold hover:bg-green-600 transition"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

