import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { useNavigate } from "react-router-dom";

export const Inicio = () => {
    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % 6);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + 6) % 6);
    };

    useEffect(() => {
        const auto = setInterval(() => handleNext(), 6000);
        return () => clearInterval(auto);
    }, []);

    return (
        <>
            <Navbar />
            <main className="transition-all pt-10">

                {/* CARRUSEL */}
                <div className="relative w-full">
                    <div className="slide">

                        {[
                            "/multimedia/carru2.jpg",
                            "/multimedia/carru5-.jpg",
                            "/multimedia/carru4.jpg",
                            "/multimedia/carru6.jpeg",
                            "/multimedia/carru8.png",
                            "/multimedia/carru7.jpg"
                        ].map((src, i) => (
                            <div
                                key={i}
                                className={`item ${i === currentIndex ? "active" : ""}`}
                                style={{ backgroundImage: `url(${src})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/10"></div>

                                {i === currentIndex && (
                                    <div className="absolute bottom-10 left-5 md:left-10 text-white max-w-xl transition-opacity duration-700">
                                        <h2 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
                                            Haz que tu marca hable por ti
                                        </h2>
                                        <p className="mt-3 text-lg md:text-xl opacity-95">
                                            Impresiones con calidad real para que tu negocio se vea profesional, moderno y confiable.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button onClick={handlePrev} className="carousel-btn left-3">
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button onClick={handleNext} className="carousel-btn right-3">
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>

                        <div className="carousel-dots">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`carousel-dot ${i === currentIndex ? "active" : ""}`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>


                {/* QUIÉNES SOMOS / VALORES */}
                <div>
                    <h1 className="p-5 text-2xl md:text-3xl font-bold text-center mb-4">
                        Impresión profesional hecha con dedicación
                    </h1>

                    <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto text-lg">
                        Nos apasiona ayudarte a mostrar lo mejor de tu marca. Creamos impresiones con calidad,
                        buen diseño y un servicio cercano que te acompaña en todo momento.
                    </p>

                    <section className="flex justify-center items-start py-10">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:px-12 px-6">

                            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                                <span className="material-icons text-4xl text-black-500 mb-4">verified</span>
                                <h1 className="text-2xl md:text-3xl text-[#25395C] font-bold mb-2">Calidad Premium</h1>
                                <p className="text-gray-600 text-base md:text-lg">
                                    Cada impresión se realiza con máxima precisión para que tus ideas se vean claras,
                                    vibrantes y duraderas.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                                <span className="material-icons text-4xl text-black-500 mb-4">local_offer</span>
                                <h1 className="text-2xl md:text-3xl text-[#25395C] font-bold mb-2">Precios Justos</h1>
                                <p className="text-gray-600 text-base md:text-lg">
                                    Soluciones para todos los presupuestos sin sacrificar calidad.
                                    Queremos que tu marca crezca, no tus gastos.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                                <span className="material-icons text-4xl text-black-500 mb-4">design_services</span>
                                <h1 className="text-2xl md:text-3xl text-[#25395C] font-bold mb-2">Diseño Creativo</h1>
                                <p className="text-gray-600 text-base md:text-lg">
                                    Te ayudamos a transformar tus ideas en diseños frescos, modernos y atractivos
                                    que conectan con tu público.
                                </p>
                            </div>

                        </div>
                    </section>
                </div>

                {/* SECCIÓN PRODUCTOS */}

                <section className="py-14 bg-gray-50">
                    <h2 className="text-3xl font-bold text-center mb-8">Lo más pedido</h2>
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">

                        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                            <img src="/multimedia/tarjetas.jpg" className="w-full h-48 object-cover rounded-lg mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Tarjetas de Presentación</h3>
                            <p className="text-gray-600 mb-4">Impresión premium desde $25.000</p>
                            <button className="bg-[#25395C] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition">
                                Crear diseño
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                            <img src="/multimedia/volantes.jpg" className="w-full h-48 object-cover rounded-lg mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Volantes Publicitarios</h3>
                            <p className="text-gray-600 mb-4">Desde $40.000 por 100 unidades</p>
                            <button className="bg-[#25395C] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition">
                                Pedir ahora
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                            <img src="/multimedia/stickers.jpg" className="w-full h-48 object-cover rounded-lg mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Stickers Personalizados</h3>
                            <p className="text-gray-600 mb-4">Calidad vinilo resistente</p>
                            <button className="bg-[#25395C] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition">
                                Personalizar
                            </button>
                        </div>

                    </div>
                </section>



                {/* SECCIÓN INFORMATIVA */}
                <div>

                    <section className="flex justify-center items-center text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center w-full">

                            <div className="bg-gray-900 flex flex-col justify-center items-center text-center px-6 py-10 h-[350px] sm:h-[400px] w-full">
                                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                                <p className="p-5 italic text-base md:text-lg text-center mb-6 text-white">
                                    Usamos tecnología de impresión que garantiza resultados limpios y profesionales.
                                    Nos enfocamos en rapidez, buena comunicación y un cuidado especial por cada detalle.
                                </p>

                                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            </div>

                            <div className="bg-red-500 w-full h-[350px] sm:h-[400px]">
                                <img src="/multimedia/espacio_2.png" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </section>

                    <section className="flex justify-center items-center text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center w-full">

                            <div className="bg-red-500 w-full h-[350px] sm:h-[400px]">
                                <img src="/multimedia/espacio_1.jpg" className="w-full h-full object-cover" />
                            </div>

                            <div className="bg-[#25395C] flex flex-col justify-center items-center text-center px-6 py-10 h-[350px] sm:h-[400px] w-full">
                                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                                <p className="p-5 italic text-base md:text-lg text-center mb-6 text-white">
                                    Queremos ser ese aliado confiable que siempre responde.
                                    Creatividad, calidad y compromiso para que tu marca luzca increíble.
                                </p>

                                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            </div>
                        </div>
                    </section>
                </div>


                {/* OPINIONES */}
                <div>
                    <h1 className="p-5 text-2xl md:text-3xl font-bold text-center mb-6">
                        Lo que dicen quienes confían en nosotros
                    </h1>

                    <p className="text-gray-500 text-center mb-5">
                        Nada nos hace más felices que ver a nuestros clientes satisfechos con el resultado final.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:px-12 px-6">

                        <div className="h-auto max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    className="w-16 h-16 rounded-full object-cover"
                                    src="https://www.dzoom.org.es/wp-content/uploads/2020/02/portada-foto-perfil-redes-sociales-consejos.jpg"
                                    alt="Vanessa Sánchez"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Vanessa Sánchez</h2>
                                    <p className="text-sm text-gray-500">Cliente Satisfecha</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic mb-4">
                                “La calidad del trabajo es espectacular. Superaron mis expectativas en cada detalle.”
                            </p>
                            <p className="text-2xl text-yellow-400">★★★★★</p>
                        </div>

                        <div className="h-auto max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    className="w-16 h-16 rounded-full object-cover"
                                    src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341"
                                    alt="Sebastián Restrepo"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Sebastián Restrepo</h2>
                                    <p className="text-sm text-gray-500">Cliente Satisfecho</p>
                                </div>
                            </div>

                            <p className="text-gray-700 italic mb-4">
                                “Servicio ágil, profesional y con excelente atención. Muy recomendados.”
                            </p>

                            <p className="text-2xl text-yellow-400">★★★★★</p>
                        </div>

                        <div className="h-auto max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    className="w-16 h-16 rounded-full object-cover"
                                    src="https://media.istockphoto.com/id/1386479313/es/foto/feliz-mujer-de-negocios-afroamericana-millennial-posando-aislada-en-blanco.jpg"
                                    alt="Andrés Restrepo"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Andrés Restrepo</h2>
                                    <p className="text-sm text-gray-500">Cliente Satisfecho</p>
                                </div>
                            </div>

                            <p className="text-gray-700 italic mb-4">
                                “Trabajo con ellos desde hace tiempo. Siempre entregan calidad y excelentes resultados.”
                            </p>

                            <p className="text-2xl text-yellow-400">★★★★★</p>
                        </div>

                    </div>

                    {/* SECCIÓN IR A PRODUCTOS */}

                    <section className="bg-[#25395C] mt-[40px] py-14 text-white text-center">
                        <h2 className="text-3xl font-bold mb-4">¿Listo para darle vida a tus ideas?</h2>
                        <p className="text-lg mb-6 opacity-90">
                            Te acompañamos desde el diseño hasta la entrega final.
                        </p>
                        <button
                            onClick={() => navigate("/productos")}
                            className="bg-red-500 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-red-600 transition"
                        >
                            Ver nuestros productos
                        </button>
                    </section>

                </div>

            </main>
            <Footer />
        </>
    );
};
