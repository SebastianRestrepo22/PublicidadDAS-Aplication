import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

export const Inicio = () => {
    const navigate = useNavigate();

    // Carrusel principal
    const [currentIndex, setCurrentIndex] = useState(0);

    // Beneficios interactivos
    const [activeIndex, setActiveIndex] = useState(0);

    const benefits = [
        {
            icon: "payments",
            title: "Calidad al cliente",
            description: "Eres nuestro mayor objetivo .",
            image: "/multimedia/pape1.jpg",
        },
        {
            icon: "public",
            title: "Confianza estandar",
            description: "Queremos lo mejor para ti por eso trabajamos duro en ello.",
            image: "/multimedia/pape2.jpg",
        },
        {
            icon: "group",
            title: "Encuentra lo que buscas",
            description: "Somos escogidos por la gran variedad de productos que ofrecemos.",
            image: "/multimedia/pape3.jpg",
        },
        {
            icon: "group",
            title: "Pedidos seguros",
            description: "Tus pedidos con nostros estan seguros.",
            image: "/multimedia/pape4.jpg",
        }
    ];

    const currentBenefit = benefits[activeIndex];

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
                            "/multimedia/carrusel1.jpg",
                            "/multimedia/carrusel2.jpeg",
                            "/multimedia/carrusel3.jpg",
                            "/multimedia/carrusel4.jpg",
                            "/multimedia/carrusel5.png",
                            "/multimedia/carrusel6.png"
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
                <section className="flex justify-center py-8 px-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-6xl w-full">
                        {[
                            {
                                icon: "verified",
                                title: "Calidad Premium",
                                desc: "Cada impresión se realiza con máxima precisión para que tus ideas se vean claras, vibrantes y duraderas."
                            },
                            {
                                icon: "local_offer",
                                title: "Precios Justos",
                                desc: "Soluciones para todos los presupuestos sin sacrificar calidad. Queremos que tu marca crezca, no tus gastos."
                            },
                            {
                                icon: "design_services",
                                title: "Diseño Creativo",
                                desc: "Te ayudamos a transformar tus ideas en diseños frescos, modernos y atractivos que conectan con tu público."
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center"
                                whileHover={{
                                    y: -8,
                                    scale: 1.03,
                                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.1)",
                                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                <span className="material-icons text-4xl text-[#25395C] mb-4">{item.icon}</span>
                                <h2 className="text-xl md:text-2xl text-[#25395C] font-bold mb-3">{item.title}</h2>
                                <p className="text-gray-600 text-base md:text-lg leading-relaxed text-center">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* NUESTROS PRODUCTOS DESTACADOS */}
                <section className="py-16 bg-gray-50 text-black"> 
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-black">
                            NUESTROS PRODUCTOS DESTACADOS
                        </h2>
                        <p className="text-center text-gray-900 mb-10">
                            Nos destacamos por nuestra experiencia en la fabricación de estos productos
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {[
                                { name: "LAPICEROS", img: "/multimedia/lapiceros.jpg", alt: "Lapiceros" },
                                { name: "PAPEL IRIS", img: "/multimedia/iris.png", alt: "Papeliris" },
                                { name: "MARCADORES", img: "/multimedia/marcadores.jpg", alt: "Marcadores" },
                                { name: "AGENDA Y CUADERNOS", img: "/multimedia/cuadernos.jpg", alt: "Agenda y Cuaderno" },
                                { name: "REGLA", img: "/multimedia/regla1.jpg", alt: "Reglas" },
                                { name: "TIJERAS", img: "/multimedia/tijeras.jpg", alt: "Tijeras" },
                                { name: "COLORES", img: "/multimedia/colores.jpg", alt: "Colores" },
                                { name: "BORRADOR SACAPUNTA", img: "/multimedia/borradorsaca.png", alt: "Borradorsaca" },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="group relative flex flex-col items-center p-4 cursor-pointer hover:scale-105 transition-transform duration-300"
                                >
                                    <div className="w-40 h-40 rounded-full bg-black mb-3 group-hover:bg-cyan-500/30 transition-colors overflow-hidden">
                                        <img
                                            src={item.img}
                                            alt={item.alt}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="text-sm md:text-base font-medium text-center">
                                        {item.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                

                {/* SECCIÓN INFORMATIVA - BENEFICIOS */}
                <section className="min-h bg-white py-20 px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-black ">
                        CONFIANZA EN CALIDAD 
                    </h2>
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            {/* Lado izquierdo - Beneficios interactivos */}
                            <div className="space-y-12">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className="cursor-pointer group"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={`
                                                flex-shrink-0 w-16 h-16 rounded-full border-2 flex items-center justify-center
                                                transition-all duration-300
                                                ${activeIndex === index
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-300 bg-white group-hover:border-gray-400'
                                                }
                                            `}>
                                                <span className={`
                                                    material-icons text-2xl transition-colors duration-300
                                                    ${activeIndex === index ? 'text-orange-500' : 'text-gray-600 group-hover:text-gray-800'}
                                                `}>
                                                    {benefit.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <h3 className={`
                                                    text-2xl md:text-3xl font-semibold mb-2 transition-colors duration-300
                                                    ${activeIndex === index ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}
                                                `}>
                                                    {benefit.title}
                                                </h3>
                                                <AnimatePresence mode="wait">
                                                    {activeIndex === index && (
                                                        <motion.p
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="text-gray-600 text-base md:text-lg leading-relaxed"
                                                        >
                                                            {benefit.description}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Lado derecho - Imagen dinámica */}
                            <div className="relative h-[400px] lg:h-[500px] lg:sticky lg:top-16">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="w-full h-full"
                                    >
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                                            <img
                                                src={currentBenefit.image}
                                                alt={currentBenefit.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </section>

                {/* OPINIONES */}
                <div className="py-12 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
                        Lo que dicen quienes confían en nosotros
                    </h1>
                    <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
                        Nada nos hace más felices que ver a nuestros clientes satisfechos con el resultado final.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                name: "Vanessa Sánchez",
                                role: "Cliente Satisfecha",
                                quote: "La calidad del trabajo es espectacular. Superaron mis expectativas en cada detalle.",
                                img: "https://www.dzoom.org.es/wp-content/uploads/2020/02/portada-foto-perfil-redes-sociales-consejos.jpg",
                            },
                            {
                                name: "Sebastián Restrepo",
                                role: "Cliente Satisfecho",
                                quote: "Servicio ágil, profesional y con excelente atención. Muy recomendados.",
                                img: "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341",
                            },
                            {
                                name: "Ana María Pérez",
                                role: "Cliente Satisfecha",
                                quote: "Trabajo con ellos desde hace tiempo. Siempre entregan calidad y excelentes resultados.",
                                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200",
                            },
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col h-full"
                            >
                                <div className="flex items-center space-x-4 mb-5">
                                    <img
                                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                                        src={testimonial.img}
                                        alt={`${testimonial.name}, ${testimonial.role}`}
                                        loading="lazy"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 italic flex-grow">
                                    “{testimonial.quote}”
                                </p>
                                <div className="mt-4 flex text-yellow-400 text-xl" aria-label="5 estrellas">
                                    ★★★★★
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};