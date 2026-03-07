import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";

// Configuración de axios
const API_URL = 'http://localhost:3000/';

export const Inicio = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState({});
    
    // Estados para productos y servicios aleatorios
    const [productosAleatorios, setProductosAleatorios] = useState([]);
    const [serviciosAleatorios, setServiciosAleatorios] = useState([]);
    const [cargandoItems, setCargandoItems] = useState(true);

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
            description: "Tus pedidos con nostos estan seguros.",
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

    // Función para obtener productos aleatorios activos
    const cargarProductosAleatorios = async () => {
        try {
            const response = await axios.get(`${API_URL}producto`, {
                params: { estado: 'Activo' }
            });
            
            let productos = [];
            if (response.data?.data) {
                productos = response.data.data;
            } else if (Array.isArray(response.data)) {
                productos = response.data;
            } else if (response.data?.productos) {
                productos = response.data.productos;
            }
            
            // Filtrar solo activos y aleatorizar
            const productosActivos = productos.filter(p => p.Estado === 'Activo');
            const aleatorios = [...productosActivos]
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);
            
            setProductosAleatorios(aleatorios);
        } catch (error) {
            console.error("Error cargando productos aleatorios:", error);
            setProductosAleatorios([]);
        }
    };

    // Función para obtener servicios aleatorios activos
    const cargarServiciosAleatorios = async () => {
        try {
            const response = await axios.get(`${API_URL}servicio`, {
                params: { estado: 'Activo' }
            });
            
            let servicios = [];
            if (response.data?.data) {
                servicios = response.data.data;
            } else if (Array.isArray(response.data)) {
                servicios = response.data;
            } else if (response.data?.servicios) {
                servicios = response.data.servicios;
            }
            
            // Filtrar solo activos y aleatorizar
            const serviciosActivos = servicios.filter(s => s.Estado === 'Activo');
            const aleatorios = [...serviciosActivos]
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);
            
            setServiciosAleatorios(aleatorios);
        } catch (error) {
            console.error("Error cargando servicios aleatorios:", error);
            setServiciosAleatorios([]);
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            setCargandoItems(true);
            await Promise.all([
                cargarProductosAleatorios(),
                cargarServiciosAleatorios()
            ]);
            setCargandoItems(false);
        };

        cargarDatos();
    }, []);

    useEffect(() => {
        const preloadImages = async () => {
            const allImages = [
                ...carouselImages,
                ...benefits.map(b => b.image)
            ];
            
            // Agregar imágenes de productos y servicios si existen
            productosAleatorios.forEach(p => {
                if (p.Imagen) allImages.push(p.Imagen);
            });
            serviciosAleatorios.forEach(s => {
                if (s.Imagen) allImages.push(s.Imagen);
            });
            
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

        if (!cargandoItems) {
            preloadImages();
        }
    }, [cargandoItems, productosAleatorios, serviciosAleatorios]);

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

    // 🔥 NUEVAS FUNCIONES DE NAVEGACIÓN - Ahora van a las vistas generales
    const handleProductoClick = () => {
        navigate("/productos");
    };

    const handleServicioClick = () => {
        navigate("/servicios");
    };

    const handleVerMasProductos = () => {
        navigate("/productos");
    };

    const handleVerMasServicios = () => {
        navigate("/servicios");
    };

    if (loading || cargandoItems) {
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

                {/* SECCIÓN PRODUCTOS DESTACADOS */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#25395C] mb-4 tracking-tight">
                                PRODUCTOS DESTACADOS
                            </h2>
                            <div className="w-20 h-1 bg-[#25395C] mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">
                                Los productos más populares de nuestra tienda
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                            {productosAleatorios.map((producto, index) => (
                                <motion.div
                                    key={producto.ProductoId || index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    onClick={handleProductoClick} // 🔥 AHORA VA A /productos
                                    className="group relative flex flex-col items-center p-4 cursor-pointer"
                                >
                                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-100 mb-4 overflow-hidden border-4 border-gray-50 group-hover:border-[#25395C]/10 transition-colors">
                                        <img
                                            src={producto.Imagen || "https://via.placeholder.com/160?text=Producto"}
                                            alt={producto.Nombre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/160?text=Producto";
                                            }}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 text-center tracking-wide uppercase line-clamp-2">
                                        {producto.Nombre}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Desde ${producto.Precio?.toLocaleString('es-CO')}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleVerMasProductos}
                                className="px-8 py-3 bg-[#25395C] text-white rounded-lg font-medium hover:bg-[#2d4a74] transition-all transform hover:scale-105 shadow-lg"
                            >
                                Ver todos los productos
                            </button>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN SERVICIOS DESTACADOS */}
                <section className="py-20 bg-white">
                    <div className="max-w-6xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#25395C] mb-4 tracking-tight">
                                SERVICIOS DESTACADOS
                            </h2>
                            <div className="w-20 h-1 bg-[#25395C] mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">
                                Los servicios más solicitados por nuestros clientes
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                            {serviciosAleatorios.map((servicio, index) => (
                                <motion.div
                                    key={servicio.ServicioId || index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    onClick={handleServicioClick} // 🔥 AHORA VA A /servicios
                                    className="group relative flex flex-col items-center p-4 cursor-pointer"
                                >
                                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-100 mb-4 overflow-hidden border-4 border-gray-50 group-hover:border-[#25395C]/10 transition-colors">
                                        <img
                                            src={servicio.Imagen || "https://via.placeholder.com/160?text=Servicio"}
                                            alt={servicio.Nombre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/160?text=Servicio";
                                            }}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 text-center tracking-wide uppercase line-clamp-2">
                                        {servicio.Nombre}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Desde ${servicio.Precio?.toLocaleString('es-CO')}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleVerMasServicios}
                                className="px-8 py-3 bg-[#25395C] text-white rounded-lg font-medium hover:bg-[#2d4a74] transition-all transform hover:scale-105 shadow-lg"
                            >
                                Ver todos los servicios
                            </button>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN CONFIANZA / BENEFICIOS DETALLADOS - MÁS SEPARADA */}
                <section className="bg-gray-50 py-32 px-6 overflow-hidden">
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
                                        className={`cursor-pointer p-4 rounded-xl transition-all duration-300 ${activeIndex === index ? 'bg-white shadow-sm' : 'hover:bg-white'}`}
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
            </main>
            <Footer />
        </>
    );
};