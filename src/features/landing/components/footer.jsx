import React from "react";

export const Footer = () => {
    return (
        <>
            <footer className="bg-gray-900 text-gray-400 mt-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:px-12 px-6 py-1">

                    {/* Columna 1 */}
                    <div>
                        <div className="p-3">
                            <h3 className="text-lg font-semibold text-white mb-4">Empresa</h3>
                            <ul className="space-y-2">
                                <li><a href="#">Acerca de Design and Style</a></li>
                                <li><a href="#">Contáctanos</a></li>
                            </ul>
                        </div>
                        <div className="p-3">
                            <h3 className="text-lg font-semibold text-white mb-4">Atención al cliente</h3>
                            <ul className="space-y-2">
                                <li><a href="#">Política de envíos</a></li>
                                <li><a href="#">Soporte</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Columna 2 */}

                    <div>
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-4">Síguenos</h3>
                            <div className="flex space-x-4">
                                <a href="https://www.whatsapp.com/?lang=es_LA" target="_blank" className="hover:opacity-80 transition">
                                    <img className="w-8 h-8" src="/multimedia/whatsapp.png" alt="WhatsApp" />
                                </a>
                                <a href="https://www.facebook.com/?locale=es_LA" target="_blank" className="hover:opacity-80 transition">
                                    <img className="w-8 h-8" src="/multimedia/facebook.png" alt="Facebook" />
                                </a>
                                <a href="https://www.instagram.com/" target="_blank" className="hover:opacity-80 transition">
                                    <img className="w-8 h-8" src="/multimedia/social.png" alt="Instagram" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/*Column 3*/}
                    <div className="p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">Dirección</h3>

                        <div className="flex items-start mb-2">
                            <span className="material-symbols-outlined text-red-500 mr-2">
                                location_on
                            </span>
                            <p>
                                Carrera 10 #55 366 int(150). <br />
                            </p>
                        </div>
                        <div className="w-full h-50 md:h-50 rounded-xl overflow-hidden shadow-lg">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3093.8159235080193!2d-75.61079942635264!3d6.171504527156471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4682321a79aea7%3A0x1bf85f1b567ce732!2sCra.%2049%20%2351-28%2C%20Los%20Naranjos%2C%20Itag%C3%BCi%2C%20Antioquia!5e1!3m2!1ses-419!2sco!4v1756600255780!5m2!1ses-419!2sco"
                                className="w-full h-50 border-0"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>

                </div>

                {/* Copyright */}
                <div className="border-t border-gray-700 text-center py-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Design and Style. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </>

    );
};
