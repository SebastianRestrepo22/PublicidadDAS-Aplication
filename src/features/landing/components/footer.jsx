import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 sm:px-12 pt-10 pb-4 items-start">

        {/* Columna 1 - Info */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">PublicidadDAS</h3>
          <p className="text-base text-gray-400 leading-relaxed">
            Sistema de gestión para administrar productos, servicios y pedidos
            en papelerías o negocios de impresión.
          </p>
        </div>

        {/* Columna 2 - Redes */}
        <div>
          <p className="text-sm font-medium text-gray-300 uppercase tracking-widest mb-3">
            Síguenos
          </p>
          <p className="text-base text-gray-400 leading-relaxed mb-4">
            Conéctate con nosotros a través de nuestras redes sociales y mantente
            al tanto de nuestras novedades.
          </p>
          <div className="flex space-x-3">
            <a href="https://www.whatsapp.com/?lang=es_LA" target="_blank" rel="noreferrer"
              className="flex items-center justify-center w-11 h-11 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition">
              <img src="/multimedia/whatsapp.png" alt="WhatsApp" className="w-6 h-6" />
            </a>
            <a href="https://www.facebook.com/?locale=es_LA" target="_blank" rel="noreferrer"
              className="flex items-center justify-center w-11 h-11 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition">
              <img src="/multimedia/facebook.png" alt="Facebook" className="w-6 h-6" />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer"
              className="flex items-center justify-center w-11 h-11 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition">
              <img src="/multimedia/social.png" alt="Instagram" className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Columna 3 - Ubicación */}
        <div>
          <p className="text-sm font-medium text-gray-300 uppercase tracking-widest mb-3">
            Ubicación
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <span className="material-symbols-outlined text-red-500 text-lg">location_on</span>
            <span>Solo referencia visual</span>
          </div>
          <div className="w-full h-36 rounded-xl overflow-hidden border border-gray-700">
            <iframe
              src="https://www.google.com/maps?q=medellin&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>

      </div>

      <div className="border-t border-gray-800 text-center py-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} PublicidadDAS. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};