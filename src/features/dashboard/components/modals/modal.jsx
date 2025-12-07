export default function Modal({ open, onClose, children }) {
    return (
        <>
            <div onClick={onClose} className={`
                 fixed inset-0 z-50 flex justify-center items-center transition-colors
                 ${open ? "visible bg-black/20" : "invisible"}
                `}>

                {/*Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        bg-white rounded-xl shadow p-6 transition-all relative z-50
                        ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}
                        `}>

                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>

                    {children}
                </div>

            </div>
        </>
    )
}