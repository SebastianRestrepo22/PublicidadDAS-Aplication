import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

export const Inicio = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState({});

    const benefits = [
        {
            icon: "payments",
            title: "Calidad al cliente",
            description: "Eres nuestro mayor objetivo.",
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

    const carouselImages = [
        "/multimedia/carrusel1.jpeg",
        "/multimedia/carrusel3.jpeg",
        "/multimedia/carrusel5.jpeg"
    ];

    const fallbackImages = [
        "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2000&q=80"
    ];

    const products = [
        { name: "LAPICEROS", img: "/multimedia/lapiceros.jpg", alt: "Lapiceros" },
        { name: "PAPEL IRIS", img: "/multimedia/iris.png", alt: "Papeliris" },
        { name: "MARCADORES", img: "/multimedia/marcadores.jpg", alt: "Marcadores" },
        { name: "AGENDA Y CUADERNOS", img: "/multimedia/cuadernos.jpg", alt: "Agenda y Cuaderno" },
        { name: "REGLA", img: "/multimedia/regla1.jpg", alt: "Reglas" },
        { name: "TIJERAS", img: "/multimedia/tijeras.jpg", alt: "Tijeras" },
        { name: "COLORES", img: "/multimedia/colores.jpg", alt: "Colores" },
        { name: "BORRADOR SACAPUNTA", img: "/multimedia/borradorsaca.png", alt: "Borradorsaca" },
    ];

    useEffect(() => {
        const preloadImages = async () => {
            const allImages = [
                ...carouselImages,
                ...products.map(p => p.img),
                ...benefits.map(b => b.image)
            ];
            
            const imagePromises = allImages.map((src) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => resolve();
                    img.onerror = () => {
                        setImageErrors(prev => ({ ...prev, [src]: true }));
                        resolve(); 
                    };
                });
            });

            await Promise.all(imagePromises);
            setTimeout(() => setLoading(false), 500); 
        };

        preloadImages();
    }, []);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    };

    useEffect(() => {
        const auto = setInterval(() => handleNext(), 5000);
        return () => clearInterval(auto);
    }, [currentIndex]);

    const getImageUrl = (index, localSrc) => {
        if (imageErrors[localSrc]) {
            return fallbackImages[index % fallbackImages.length];
        }
        return localSrc;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="fixed inset-0 flex items-center justify-center bg-[#25395C] z-50">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white text-lg font-light tracking-widest">CARGANDO...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="transition-all">
                
                {/* --- CARRUSEL A PANTALLA COMPLETA (100% ALTO) --- */}
                <div className="relative w-full min-h-screen overflow-hidden bg-gray-900">
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <img
                                src={getImageUrl(currentIndex, carouselImages[currentIndex])}
                                alt={`Slide ${currentIndex + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="eager"
                                onError={(e) => {
                                    setImageErrors(prev => ({ ...prev, [carouselImages[currentIndex]]: true }));
                                }}
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60"></div>
                            <div className="absolute inset-0 bg-[#25395C]/10 mix-blend-overlay"></div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
                        <motion.div
                            key={`text-${currentIndex}`}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="max-w-5xl"
                        >
                            <div className="w-24 h-1 bg-white/50 mx-auto mb-8 rounded-full"></div>
                            
                            <h1 className="mb-6">
                                <span className="block text-4xl md:text-6xl lg:text-7xl font-light text-white/90 mb-2 tracking-tight">
                                    Haz que
                                </span>
                                <span className="block text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-2 tracking-tight italic">
                                    tu marca
                                </span>
                                <span className="block text-4xl md:text-6xl lg:text-7xl font-light text-white/90 tracking-tight">
                                    hable por ti
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-white/80 font-light tracking-wide leading-relaxed max-w-3xl mx-auto">
                                Impresiones con calidad real para que tu negocio<br className="hidden md:block" />
                                se vea profesional, moderno y confiable
                            </p>
                        </motion.div>
                    </div>

                    <div className="absolute right-8 lg:right-12 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-4">
                        <button onClick={handlePrev} className="w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                            <i className="fa-solid fa-chevron-up"></i>
                        </button>
                        <button onClick={handleNext} className="w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                            <i className="fa-solid fa-chevron-down"></i>
                        </button>
                    </div>

                    <div className="absolute left-8 lg:left-12 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-6">
                        {carouselImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className="group flex items-center space-x-3"
                            >
                                <div className={`h-0.5 transition-all duration-500 ${i === currentIndex ? 'w-12 bg-white' : 'w-6 bg-white/30 group-hover:bg-white/60'}`}></div>
                                <span className={`text-xs font-medium transition-all ${i === currentIndex ? 'text-white opacity-100' : 'text-white/50 opacity-0 group-hover:opacity-100'}`}>
                                    0{i + 1}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SECCIÓN DE BENEFICIOS (CARDS SUPERIORES) */}
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
                                className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-black/5 p-8 flex flex-col items-center text-center hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 group"
                                whileHover={{ y: -5 }}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#25395C] to-[#3d5a8c] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-[#25395C]/30">
                                    <span className="material-icons text-3xl text-white">{item.icon}</span>
                                </div>
                                <h2 className="text-xl text-[#25395C] font-bold mb-3 tracking-tight">{item.title}</h2>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* SECCIÓN PRODUCTOS - SIN CUADRO BLANCO, SOLO BORDER RADIUS */}
                <section className="py-20 bg-gray-50 text-black">
                    <div className="max-w-6xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#25395C] mb-4 tracking-tight">
                                NUESTROS PRODUCTOS
                            </h2>
                            <div className="w-20 h-1 bg-[#25395C] mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">
                                Materiales de oficina y escolares de alta calidad
                            </p>
                        </motion.div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                            {products.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    className="group relative flex flex-col items-center p-4 cursor-pointer"
                                >
                                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-100 mb-4 overflow-hidden border-4 border-gray-50 group-hover:border-[#25395C]/10 transition-colors">
                                        <img
                                            src={item.img}
                                            alt={item.alt}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/160?text=Producto";
                                            }}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 text-center tracking-wide uppercase">
                                        {item.name}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECCIÓN CONFIANZA / BENEFICIOS DETALLADOS - MÁS SEPARADA */}
                <section className="bg-white py-32 px-6 overflow-hidden ">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8 order-2 lg:order-1">
                                <h2 className="text-3xl md:text-4xl font-bold text-[#25395C] mb-8">
                                    ¿Por qué elegirnos?
                                </h2>
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={`cursor-pointer p-4 rounded-xl transition-all duration-300 ${activeIndex === index ? 'bg-gray-50 shadow-sm' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={`
                                                flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300
                                                ${activeIndex === index ? 'bg-[#25395C] text-white' : 'bg-gray-200 text-gray-500'}
                                            `}>
                                                <span className="material-icons text-xl">{benefit.icon}</span>
                                            </div>
                                            <div>
                                                <h3 className={`text-xl font-bold mb-1 transition-colors ${activeIndex === index ? 'text-[#25395C]' : 'text-gray-700'}`}>
                                                    {benefit.title}
                                                </h3>
                                                <AnimatePresence mode="wait">
                                                    {activeIndex === index && (
                                                        <motion.p
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="text-gray-600 text-sm leading-relaxed overflow-hidden"
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

                            <div className="relative h-[400px] lg:h-[500px] order-1 lg:order-2">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl"
                                    >
                                        <img
                                            src={getImageUrl(activeIndex, currentBenefit.image)}
                                            alt={currentBenefit.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                        <div className="absolute bottom-6 left-6 text-white">
                                            <h3 className="text-2xl font-bold">{currentBenefit.title}</h3>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIOS */}
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
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/64?text=User";
                                        }}
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