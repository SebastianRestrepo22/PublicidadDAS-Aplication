import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

export const Inicio = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
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
            <main className="transition-all">
                {/* ULTRA PROFESSIONAL HERO CAROUSEL */}
                <div className="relative w-full h-screen overflow-hidden bg-black">
                    {/* Background Images with Ken Burns Effect */}
                    <AnimatePresence mode="wait">
                        {[
                            "/multimedia/carrusel1.jpg",
                            "/multimedia/carrusel2.jpeg",
                            "/multimedia/carrusel3.jpg",
                            "/multimedia/carrusel4.jpg",
                            "/multimedia/carrusel5.png",
                            "/multimedia/carrusel6.png"
                        ].map((src, i) => (
                            i === currentIndex && (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 1, opacity: 0 }}
                                    animate={{ scale: 1.08, opacity: 1 }}
                                    exit={{ scale: 1.15, opacity: 0 }}
                                    transition={{ 
                                        scale: { duration: 12, ease: "linear" },
                                        opacity: { duration: 1.2, ease: "easeInOut" }
                                    }}
                                    className="absolute inset-0"
                                    style={{ 
                                        backgroundImage: `url(${src})`, 
                                        backgroundSize: 'cover', 
                                        backgroundPosition: 'center' 
                                    }}
                                >
                                    {/* Premium Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#25395C]/30 to-transparent"></div>
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>

                    {/* Hero Content - Perfectly Centered */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                                className="text-center max-w-5xl"
                            >
                                {/* Top Decorative Line */}
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                                    className="w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-12"
                                ></motion.div>

                                {/* Main Headline - Improved Typography */}
                                <h1 className="mb-8">
                                    <motion.span 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.8 }}
                                        className="block text-5xl md:text-6xl lg:text-7xl font-light text-white/90 mb-3 tracking-tight"
                                    >
                                        Haz que
                                    </motion.span>
                                    <motion.span 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.8 }}
                                        className="block text-6xl md:text-7xl lg:text-8xl font-semibold text-white mb-3 tracking-tight italic"
                                    >
                                        tu marca
                                    </motion.span>
                                    <motion.span 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8, duration: 0.8 }}
                                        className="block text-5xl md:text-6xl lg:text-7xl font-light text-white/90 tracking-tight"
                                    >
                                        hable por ti
                                    </motion.span>
                                </h1>

                                {/* Subtitle - Perfect Typography */}
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1, duration: 0.8 }}
                                    className="text-lg md:text-xl lg:text-2xl text-white/80 font-light tracking-wide leading-relaxed mb-14 max-w-3xl mx-auto"
                                >
                                    Impresiones con calidad real para que tu negocio<br className="hidden md:block" />
                                    se vea profesional, moderno y confiable
                                </motion.p>

                                {/* CTA Button - Premium Design */}
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.8 }}
                                    whileHover={{ 
                                        scale: 1.05, 
                                        boxShadow: "0 20px 60px rgba(255,255,255,0.15)",
                                        y: -2
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative px-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white text-sm font-semibold tracking-[0.15em] uppercase rounded-full overflow-hidden transition-all duration-500 hover:bg-white hover:text-[#25395C] hover:border-white"
                                >
                                    <span className="relative z-10">Descubrir más</span>
                                    
                                    {/* Hover effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-white"
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    ></motion.div>
                                </motion.button>

                                {/* Bottom Decorative Line */}
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    transition={{ duration: 1.2, delay: 1.4, ease: "easeOut" }}
                                    className="w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-12"
                                ></motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Elegant Side Navigation */}
                    <div className="absolute right-8 lg:right-12 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-3">
                        <motion.button
                            onClick={handlePrev}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-11 h-11 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                        >
                            <i className="fa-solid fa-chevron-up text-sm"></i>
                        </motion.button>
                        <motion.button
                            onClick={handleNext}
                            whileHover={{ scale: 1.1, y: 2 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-11 h-11 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                        >
                            <i className="fa-solid fa-chevron-down text-sm"></i>
                        </motion.button>
                    </div>

                    {/* Refined Vertical Progress Indicator */}
                    <div className="absolute left-8 lg:left-12 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className="group flex items-center space-x-4"
                            >
                                {/* Progress line */}
                                <div className="relative">
                                    <div className={`w-0.5 transition-all duration-500 ${
                                        i === currentIndex 
                                            ? 'h-16 bg-white shadow-lg shadow-white/50' 
                                            : 'h-10 bg-white/30 group-hover:bg-white/50'
                                    }`}></div>
                                    
                                    {/* Active indicator dot */}
                                    {i === currentIndex && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute top-1/2 -left-1 w-2.5 h-2.5 bg-white rounded-full shadow-lg shadow-white/50"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        ></motion.div>
                                    )}
                                </div>
                                
                                {/* Number label */}
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: i === currentIndex ? 1 : 0, x: i === currentIndex ? 0 : -10 }}
                                    className="text-xs font-medium tracking-wider text-white"
                                >
                                    0{i + 1}
                                </motion.span>
                            </button>
                        ))}
                    </div>

                    {/* Elegant Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2, duration: 1 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-3"
                    >
                        <span className="text-white/60 text-[11px] font-medium tracking-[0.2em] uppercase">Scroll</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-px h-16 bg-gradient-to-b from-white/60 via-white/30 to-transparent"
                        ></motion.div>
                    </motion.div>
                </div>

                {/* REST OF THE SECTIONS */}
                <section className="flex justify-center py-20 px-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
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
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                className="bg-white rounded-2xl border-2 border-[#25395C]/20 shadow-lg shadow-black/5 p-8 flex flex-col items-center text-center hover:shadow-xl hover:shadow-black/10 transition-all duration-230 group"
                                whileHover={{ y: -8 }}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#25395C] to-[#3d5a8c] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <span className="material-icons text-3xl text-white">{item.icon}</span>
                                </div>
                                <h2 className="text-2xl text-[#25395C] font-semibold mb-4 tracking-tight">{item.title}</h2>
                                <p className="text-gray-600 text-base leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="py-20 bg-gradient-to-b from-gray-50 to-white text-black"> 
                    <div className="max-w-6xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-4xl font-semibold text-black mb-3 tracking-tight">
                                NUESTROS PRODUCTOS DESTACADOS
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#25395C] to-transparent mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">
                                Nos destacamos por nuestra experiencia en la fabricación de estos productos
                            </p>
                        </motion.div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
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
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.05 }}
                                    className="group relative flex flex-col items-center p-4 cursor-pointer"
                                >
                                    <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4 overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                                        <img
                                            src={item.img}
                                            alt={item.alt}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#25395C]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 text-center tracking-wide">
                                        {item.name}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="min-h bg-white py-24 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-semibold text-black mb-3 tracking-tight">
                            CONFIANZA EN CALIDAD 
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#25395C] to-transparent mx-auto"></div>
                    </motion.div>
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-12">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
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

                <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
                            Lo que dicen quienes confían en nosotros
                        </h1>
                        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#25395C] to-transparent mx-auto mb-6"></div>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Nada nos hace más felices que ver a nuestros clientes satisfechos con el resultado final.
                        </p>
                    </motion.div>
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
                                whileHover={{ y: -8 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-500 p-8 flex flex-col h-full"
                            >
                                <div className="flex items-center space-x-4 mb-6">
                                    <img
                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-md"
                                        src={testimonial.img}
                                        alt={`${testimonial.name}, ${testimonial.role}`}
                                        loading="lazy"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-base leading-relaxed flex-grow italic">
                                    "{testimonial.quote}"
                                </p>
                                <div className="mt-6 flex text-yellow-400 text-xl" aria-label="5 estrellas">
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