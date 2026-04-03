import { useState, useEffect } from "react";

const HelpModal = ({ isOpen, onClose, videos }) => {
  const [active, setActive] = useState(videos[0]?.url);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay con blur elegante */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all z-40"
        onClick={onClose}
      />

      {/* Drawer lateral - azul oscuro profesional */}
      <div className="fixed right-6 top-24 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden transition-all duration-300 animate-slideIn">
        
        {/* Header con gradiente azul oscuro */}
        <div className="relative px-4 py-3 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-b border-slate-600/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-white text-xs font-medium">?</span>
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-white">
                Centro de ayuda
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video - azul como acento */}
        <div className="p-3 pb-2">
          <div className="relative rounded-xl overflow-hidden shadow-md bg-slate-900 ring-1 ring-slate-200">
            <div className="relative pb-[56.25%] h-0">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={active}
                title="Help Video"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </div>

        {/* Lista - con acentos azules */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Guías
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>
          
          <div className="space-y-1.5">
            {videos.map((v, idx) => (
              <button
                key={v.key}
                onClick={() => setActive(v.url)}
                className={`group w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  active === v.url
                    ? "bg-gradient-to-r from-blue-50 to-slate-50 border-l-[3px] border-blue-500 shadow-sm"
                    : "hover:bg-slate-50 border-l-[3px] border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs transition-colors ${
                    active === v.url ? "text-blue-500 font-medium" : "text-slate-400 group-hover:text-blue-400"
                  }`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-[13px] font-medium tracking-tight ${
                    active === v.url ? "text-slate-800" : "text-slate-600 group-hover:text-slate-800"
                  }`}>
                    {v.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer sutil */}
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] text-center text-slate-400 tracking-wide">
            Videos explicativos • 30-60 segundos
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};

export default HelpModal;