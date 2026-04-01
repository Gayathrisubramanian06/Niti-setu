import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
    const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-green-600 text-white hover:bg-green-700",
        secondary: "bg-white text-green-700 border-2 border-green-600 hover:bg-green-50",
        outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
