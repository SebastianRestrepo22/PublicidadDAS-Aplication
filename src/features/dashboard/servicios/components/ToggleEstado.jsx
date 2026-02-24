import React from "react";

export const ToggleEstado = ({ checked = false, onChange, disabled = false }) => (
    <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            disabled 
                ? 'bg-gray-200 cursor-not-allowed' 
                : checked 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
        }`}
        disabled={disabled}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
    </button>
);