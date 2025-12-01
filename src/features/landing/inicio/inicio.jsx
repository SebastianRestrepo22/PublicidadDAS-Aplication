import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";

export const Inicio = () => {
    const handleNext = () => {
        let items = document.querySelectorAll(".item");
        document.querySelector(".slide").appendChild(items[0]);
    };

    const handlePrev = () => {
        let items = document.querySelectorAll(".item");
        document.querySelector(".slide").prepend(items[items.length - 1]);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 8000);

        return () => clearInterval(interval); // cleanup al desmontar
    }, []);

    return (
        <>
            <Navbar />
            <main className="transition-all pt-10">

                {/* Carrusel */}
                <div className="container">
                    <div className="slide">
                        <div className="item" style={{ backgroundImage: `url(/multimedia/carru2.jpg)` }}>

                        </div>

                        <div className="item" style={{ backgroundImage: `url(/multimedia/carru5-.jpg)` }}>
                           
                        </div>

                        <div className="item" style={{ backgroundImage: `url(/multimedia/carru4.jpg)` }}>
                            
                        </div>

                        <div className="item" style={{ backgroundImage: `url(/multimedia/carru6.jpeg)` }}>
                           
                        </div>

                        <div className="item" style={{ backgroundImage: `url(/multimedia/carru8.png)` }}>
                            
                        </div>

                        <div className="item" style={{ backgroundImage: `url(/multimedia/carru7.jpg)` }}>
                        
                        </div>
                    </div>
                    {/* <div className="button">
                        <button className="prev" onClick={handlePrev}><i className="fa-solid fa-arrow-left"></i></button>
                        <button className="next" onClick={handleNext}><i className="fa-solid fa-arrow-right"></i></button>
                    </div> */}
                </div>

                <div>
                    <h1 className="p-5 text-2xl md:text-3xl font-bold text-center mb-6">
                        Lo que deden saber de nosotros
                    </h1>
                    <p className="text-gray-500 text-center mb-5">
                        Nos dedicamos a ofrecer productos y servicios de calidad, con precios justos y soluciones creativas. <br /> Queremos que nuestros clientes conozcan nuestros valores y lo que nos distingue.
                    </p>

                    <section className="flex justify-center items-start py-10">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:px-12 px-6">

                            {/* Card 1 */}
                            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                                <span className="material-icons text-4xl text-black-500 mb-4">thumb_up</span>
                                <h1 className="text-2xl md:text-3xl text-[#25395C] font-bold mb-2">Calidad</h1>
                                <p className="text-gray-600 text-base md:text-lg">
                                    Productos de primera con materiales duraderos y acabados impecables para garantizar la mejor experiencia.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                                <span className="material-icons text-4xl text-black-500 mb-4">attach_money</span>
                                <h1 className="text-2xl md:text-3xl text-[#25395C] font-bold mb-2">Buenos precios</h1>
                                <p className="text-gray-600 text-base md:text-lg">
                                    Ofrecemos precios competitivos sin comprometer la calidad de nuestros productos y servicios.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300">
                                <span className="material-icons text-4xl text-black-500 mb-4">lightbulb</span>
                                <h1 className="text-2xl md:text-3xl text-[#25395C] font-bold mb-2">Creatividad</h1>
                                <p className="text-gray-600 text-base md:text-lg">
                                    Diseños únicos y originales que reflejan ideas innovadoras y atención al detalle.
                                </p>
                            </div>

                        </div>
                    </section>

                </div>

                {/* Lo que ofrecemos */}
                <div>
                    <section className="flex justify-center items-center text-white">
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 justify-items-center">

                            <div className="bg-gray-900 flex flex-col justify-center items-center text-center px-6 py-10 h-[400px]">
                                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                <p className="p-5 italic text-1xl md:text-1xl text-center mb-6 text-white">
                                    Ofrecemos soluciones de impresión de alta calidad: offset y digital, diseño gráfico, papelería corporativa, publicidad impresa, empaques, etiquetas y material promocional.
                                    Nos enfocamos en brindarte rapidez, creatividad y confianza para que cada impresión resalte tu marca.
                                </p>
                                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            </div>

                            <div className="bg-red-500 w-[675px] h-[400px]">
                                <img src="/multimedia/espacio_2.png" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </section>

                    <section className="flex justify-center items-center text-white">
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 justify-items-center">

                            <div className="bg-red-500 w-[676px] h-[400px]">
                                <img src="/multimedia/espacio_1.jpg" className="w-full h-full object-cover" />
                            </div>

                            <div className="bg-[#25395C] flex flex-col justify-center items-center text-center px-6 py-10 h-[400px]">
                                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                <p className="p-5 italic text-1xl md:text-1xl text-center mb-6 text-white">
                                    Brindamos soluciones completas de impresión: offset y digital, diseño gráfico creativo, papelería corporativa, material publicitario, empaques, etiquetas y productos promocionales.
                                    Nuestro objetivo es ofrecerte calidad y rapidez en cada proyecto, impulsando la imagen de tu marca.
                                </p>
                                <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            </div>
                        </div>
                    </section>
                </div>

                {/*Opiniones*/}

                <div>
                    <h1 className="p-5 text-2xl md:text-3xl font-bold text-center mb-6">
                        Lo que dicen nuestros clientes
                    </h1>
                    <p className="text-gray-500 text-center mb-5">La satisfacción de nuestros clientes es nuestro mayor logro.</p>

                    {/* Contenedor grid para cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:px-12 px-6">

                        {/* Card 1 */}
                        <div className="h-[260px] max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 m-10">
                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    className="w-16 h-16 rounded-full object-cover"
                                    src="https://www.dzoom.org.es/wp-content/uploads/2020/02/portada-foto-perfil-redes-sociales-consejos.jpg"
                                    alt="Vanessa Sánchez"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Vanessa Sánchez</h2>
                                    <p className="text-sm text-gray-500">Cliente Satisfecho</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic mb-4">
                                “La calidad de las obras es excepcional. Cada pieza que he adquirido ha superado mis expectativas. El servicio al cliente es impecable.”
                            </p>

                            <div className="flex items-center mt-2 text-yellow-400">
                                <p className="text-2xl">★★★★★</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="h-[260px] max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 m-10">

                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    className="w-16 h-16 rounded-full object-cover"
                                    src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVyZmlsfGVufDB8fDB8fHww"
                                    alt="Sebastián Restrepo"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Sebastián Restrepo</h2>
                                    <p className="text-sm text-gray-500">Cliente Satisfecho</p>
                                </div>
                            </div>

                            <p className="text-gray-700 italic mb-4">
                                “Descubrí esta galería hace un año y desde entonces he adquirido varias obras. La autenticidad y el cuidado en cada detalle es notable.”
                            </p>

                            <div className="flex items-center mt-2 text-yellow-400">
                                <p className="text-2xl">★★★★★</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="h-[260px] max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 m-10">
                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    className="w-16 h-16 rounded-full object-cover"
                                    src="https://media.istockphoto.com/id/1386479313/es/foto/feliz-mujer-de-negocios-afroamericana-millennial-posando-aislada-en-blanco.jpg?s=612x612&w=0&k=20&c=JP0NBxlxG2-bdpTRPlTXBbX13zkNj0mR5g1KoOdbtO4="
                                    alt="Sebastián Restrepo"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Andrés Restrepo</h2>
                                    <p className="text-sm text-gray-500">Cliente Satisfecho</p>
                                </div>
                            </div>

                            <p className="text-gray-700 italic mb-4">
                                “Trabajo frecuentemente con esta galería para mis proyectos. Sus piezas clásicas aportan elegancia y sofisticación a cualquier espacio.”
                            </p>

                            <div className="flex items-center mt-2 text-yellow-400">
                                <p className="text-2xl">★★★★★</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
            <Footer />
        </>
    )
}