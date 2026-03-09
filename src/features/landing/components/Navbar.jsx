import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import Modal from "../../dashboard/components/modals/modal";
import { User } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const [openModal, setOpenModal] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { cart } = useCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const shouldUseScrolledStyle = isHomePage ? isScrolled : true;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* NAVBAR CON ESTILO DINÁMICO SEGÚN SECCIÓN */}
            <motion.nav
                initial={isHomePage ? { opacity: 0, y: -20 } : false}
                animate={isHomePage ? { opacity: 1, y: 0 } : false}
                transition={isHomePage ? { duration: 0.6 } : undefined}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${shouldUseScrolledStyle
                    ? 'bg-[#e8e8e8] border-b border-gray-300' // Fondo gris más claro
                    : 'bg-white/5 backdrop-blur-md border-b border-white/30'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            className="flex items-center space-x-4 cursor-pointer group"
                        >
                            <div className="relative">
                                <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${shouldUseScrolledStyle ? 'bg-[#25395C]/20' : 'bg-white/20'
                                    }`}></div>

                                <motion.div
                                    className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${shouldUseScrolledStyle
                                        ? 'bg-gradient-to-br from-[#25395C] to-[#3d5a8c] shadow-lg shadow-[#25395C]/30'
                                        : 'bg-white/10 backdrop-blur-sm border border-white/20'
                                        }`}
                                    whileHover={{ rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <img
                                        src="/multimedia/logo.png"
                                        alt="logo"
                                        className="w-full h-full p-2 object-contain"
                                    />
                                </motion.div>
                            </div>

                            <div>
                                <h1 className={`text-xl font-semibold tracking-wide transition-all duration-500 ${shouldUseScrolledStyle
                                    ? 'text-[#25395C]'
                                    : 'text-white drop-shadow-lg'
                                    }`}>
                                    PublicidadDAS
                                </h1>
                                <p className={`text-[11px] font-medium tracking-wider uppercase transition-all duration-500 ${shouldUseScrolledStyle
                                    ? 'text-gray-500'
                                    : 'text-white/70'
                                    }`}>
                                    Papelería
                                </p>
                            </div>
                        </motion.div>

                        {/* Menu Items */}
                        <div className="hidden md:flex items-center space-x-1">
                            {!user ? (
                                <>
                                    <Link to='/'>
                                        <motion.button
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-300 relative ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}
                                        >
                                            <span className="relative z-10">Inicio</span>
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                                        </motion.button>
                                    </Link>
                                    <Link to="/productos">
                                        <motion.button
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-300 relative ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}
                                        >
                                            <span className="relative z-10">Productos</span>
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                                        </motion.button>
                                    </Link>
                                    <Link to="/servicios">
                                        <motion.button
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-300 relative ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}
                                        >
                                            <span className="relative z-10">Servicios</span>
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                                        </motion.button>
                                    </Link>
                                    <Link to='/quienessomos'>
                                        <motion.button
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-300 relative ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}
                                        >
                                            <span className="relative z-10">¿Quiénes somos?</span>
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                                        </motion.button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to='/cliente/productos'>
                                        <motion.button
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-300 relative ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}
                                        >
                                            <span className="relative z-10">Productos</span>
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                                        </motion.button>
                                    </Link>
                                    <Link to='/cliente/servicios'>
                                        <motion.button
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-300 relative ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}
                                        >
                                            <span className="relative z-10">Servicios</span>
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                                        </motion.button>
                                    </Link>
                                    <Link to='/cliente/MisPedidos'>
                                        <motion.button
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-300 relative ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}
                                        >
                                            <span className="relative z-10">Mis pedidos</span>
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
                                        </motion.button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* CTA Section */}
                        <div className="flex items-center space-x-3">
                            {!user ? (
                                <Link to='/login'>
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        className={`px-6 py-2.5 text-[13px] font-semibold tracking-wide rounded-full border-2 transition-all duration-500 ${shouldUseScrolledStyle
                                            ? 'border-[#25395C] text-[#25395C] hover:bg-[#25395C] hover:text-white shadow-md hover:shadow-lg hover:shadow-[#25395C]/20'
                                            : 'border-white/30 text-white hover:bg-[#25395C] hover:text-white backdrop-blur-sm'
                                            }`}
                                    >
                                        Registro/Login
                                    </motion.button>
                                </Link>
                            ) : (
                                <>
                                    <Link to='/cliente/perfil'>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${shouldUseScrolledStyle
                                                ? 'bg-gray-100 text-[#25395C] hover:bg-gray-200'
                                                : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20'
                                                }`}
                                        >
                                            <User className="w-5 h-5" />
                                        </motion.button>
                                    </Link>
                                    <motion.button
                                        onClick={() => setOpenModal(true)}
                                        whileHover={{ scale: 1.05, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        className="px-5 py-2.5 text-[13px] font-semibold tracking-wide bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md hover:shadow-lg hover:shadow-red-600/30 transition-all duration-500"
                                    >
                                        Cerrar sesión
                                    </motion.button>
                                </>
                            )}

                            {/* Shopping Cart Icon */}
                            <Link to='/carritodecompras'>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${shouldUseScrolledStyle
                                        ? 'bg-gray-100 text-[#25395C] hover:bg-gray-200'
                                        : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20'
                                        }`}
                                >
                                    <span className="material-icons text-xl">shopping_bag</span>
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg">
                                            {totalItems}
                                        </span>
                                    )}
                                </motion.button>
                            </Link>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className={`md:hidden w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${shouldUseScrolledStyle
                                    ? 'bg-gray-100 text-[#25395C] hover:bg-gray-200'
                                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20'
                                    }`}
                            >
                                <span className="material-icons text-xl">
                                    {menuOpen ? 'close' : 'menu'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subtle bottom glow */}
                <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-700 ${shouldUseScrolledStyle ? 'opacity-0' : 'opacity-100'
                    }`}></div>
            </motion.nav>

            {/* MENU MOBILE */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`md:hidden fixed top-20 left-0 right-0 z-40 ${shouldUseScrolledStyle
                            ? 'bg-gray-100 border-b border-gray-300'
                            : 'bg-white/95 backdrop-blur-2xl border-b border-gray-200/50 shadow-xl'
                            }`}
                    >
                        <ul className="flex flex-col items-center gap-2 py-6 px-4">
                            {!user ? (
                                <>
                                    <li className="w-full">
                                        <Link to='/' onClick={() => setMenuOpen(false)}>
                                            <button className={`group w-full px-5 py-3 font-semibold text-[15px] rounded-xl transition-all duration-300 relative text-center ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}>
                                                <span className="relative z-10">Inicio</span>
                                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-fit h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100"></span>
                                            </button>
                                        </Link>
                                    </li>
                                    <li className="w-full">
                                        <Link to='/productos' onClick={() => setMenuOpen(false)}>
                                            <button className={`group w-full px-5 py-3 font-semibold text-[15px] rounded-xl transition-all duration-300 relative text-center ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}>
                                                <span className="relative z-10">Productos</span>
                                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-fit h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100"></span>
                                            </button>
                                        </Link>
                                    </li>
                                    <li className="w-full">
                                        <Link to='/servicios' onClick={() => setMenuOpen(false)}>
                                            <button className={`group w-full px-5 py-3 font-semibold text-[15px] rounded-xl transition-all duration-300 relative text-center ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}>
                                                <span className="relative z-10">Servicios</span>
                                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-fit h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100"></span>
                                            </button>
                                        </Link>
                                    </li>
                                    <li className="w-full">
                                        <Link to='/quienessomos' onClick={() => setMenuOpen(false)}>
                                            <button className={`group w-full px-5 py-3 font-semibold text-[15px] rounded-xl transition-all duration-300 relative text-center ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}>
                                                <span className="relative z-10">¿Quiénes somos?</span>
                                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-fit h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100"></span>
                                            </button>
                                        </Link>
                                    </li>
                                    <li className="w-full mt-4">
                                        <Link to='/login' onClick={() => setMenuOpen(false)}>
                                            <button className={`w-full px-6 py-3 font-semibold text-[15px] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${shouldUseScrolledStyle
                                                ? 'bg-gradient-to-r from-[#25395C] to-[#3d5a8c] text-white'
                                                : 'bg-white/5 backdrop-blur-sm text-white hover:bg-[#25395C]'
                                                }`}>
                                                Registro/Login
                                            </button>
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="w-full">
                                        <Link to='/cliente/productos' onClick={() => setMenuOpen(false)}>
                                            <button className={`group w-full px-5 py-3 font-semibold text-[15px] rounded-xl transition-all duration-300 relative text-center ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}>
                                                <span className="relative z-10">Productos</span>
                                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-fit h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100"></span>
                                            </button>
                                        </Link>
                                    </li>
                                    <li className="w-full">
                                        <Link to='/cliente/servicios' onClick={() => setMenuOpen(false)}>
                                            <button className={`group w-full px-5 py-3 font-semibold text-[15px] rounded-xl transition-all duration-300 relative text-center ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}>
                                                <span className="relative z-10">Servicios</span>
                                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-fit h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100"></span>
                                            </button>
                                        </Link>
                                    </li>
                                    <li className="w-full">
                                        <Link to='/cliente/MisPedidos' onClick={() => setMenuOpen(false)}>
                                            <button className={`group w-full px-5 py-3 font-semibold text-[15px] rounded-xl transition-all duration-300 relative text-center ${shouldUseScrolledStyle
                                                ? 'text-gray-700'
                                                : 'text-white/90'
                                                }`}>
                                                <span className="relative z-10">Mis pedidos</span>
                                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-fit h-0.5 bg-[#25395C] transform scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100"></span>
                                            </button>
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Cerrar Sesión */}
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
            >
                <div className="w-[400px] p-6 mx-auto text-center bg-white rounded shadow-lg relative z-50">
                    <p className="mb-6 text-black">¿Está seguro que quiere cerrar sesión?</p>
                    <div className="flex gap-4">
                        <Link
                            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
                            onClick={() => {
                                logout();
                            }}
                            to="/login"
                        >
                            Cerrar sesión
                        </Link>
                        <button
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors"
                            onClick={() => setOpenModal(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};