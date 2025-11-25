import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../../context/CartContext"; // Ajusta ruta según ubicación
import { useAuth } from "../../../context/AuthContext";
import Modal from "../../dashboard/components/modals/modal";
import { User } from "lucide-react";

export const Navbar = () => {
    const { user, logout } = useAuth();

    const [openModal, setOpenModal] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false);

    const { cart } = useCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="fixed top-0 left-0 w-full z-50 h-14">
            <nav className="bg-[#25395C] fixed top-0 left-0 w-full p-0 h-14 shadow z-50 flex items-center justify-between">

                <div className="flex items-center ml-6">
                    <img src="/public/multimedia/logo.png" alt="Logo" className="h-[70px] w-auto" />
                    <h1 style={{ fontFamily: 'Oswald, sans-serif' }} className="text-white">PublicidadDAS</h1>
                </div>

                {/* MENU DESKTOP */}
                <ul className="hidden md:flex mx-auto items-center gap-10">

                    {!user ? (
                        <>
                            <li><Link className="text-white font-bold text-[17px] hover:text-cyan-500 duration-500" to='/'>Inicio</Link></li>

                            <li className="relative group">
                                <span className="text-white font-bold text-[17px] cursor-pointer hover:text-cyan-500 duration-500">
                                    Nuestros productos
                                </span>
                                <ul className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                    <li><Link className="block px-4 py-2 hover:bg-cyan-500 hover:text-white" to="/productos">Productos</Link></li>
                                    <li><Link className="block px-4 py-2 hover:bg-cyan-500 hover:text-white" to="/servicios">Servicios</Link></li>
                                </ul>
                            </li>

                            <li><Link className="text-white font-bold text-[17px] hover:text-cyan-500 duration-500" to='/quienessomos'>¿Quiénes somos?</Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link className="text-white font-bold text-[17px] hover:text-cyan-500 duration-500" to='/cliente/productos'>Productos</Link></li>
                            <li><Link className="text-white font-bold text-[17px] hover:text-cyan-500 duration-500" to='/cliente/servicios'>Servicios</Link></li>
                        </>
                    )}

                </ul>

                {/* BOTONES Y TOGGLE */}
                <div className="flex items-center gap-2 mr-6">
                    {!user ? (
                        <li className="hidden md:inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-1 rounded-lg hover:bg-blue-600 transition-all font-medium">
                            <Link to='/login'>Registro</Link>
                        </li>
                    ) : (
                        <>
                            <Link
                                to='/cliente/perfil'
                                className="flex items-center justify-center text-white w-10 h-10 transition-all duration-300 shadow-md hover:shadow-xl hover:bg-blue-500/10 rounded-full"
                            >
                                <User className="w-7 h-7" />
                            </Link>
                        </>
                    )}


                    <div className="relative">
                        <Link
                            to='/carritodecompras'
                            className="flex items-center justify-center text-white w-10 h-10 transition-all duration-300 shadow-md hover:shadow-xl hover:bg-blue-500/10 rounded-full"
                        >
                            <img
                                src="/public/multimedia/carritoCompras.png"
                                alt="CarritoCompras"
                                className="h-7 cursor-pointer px-1 mx-4 hover:scale-110 transition-transform duration-300"
                            />
                        </Link>

                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                {totalItems}
                            </span>
                        )}
                    </div>

                    {user && (
                        <>
                            <button
                                onClick={() => setOpenModal(true)}
                                className="px-3 py-1 bg-red-600 text-white font-semibold rounded-xl shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-300"
                            >
                                Cerrar sesión
                            </button>
                        </>
                    )}

                    <span className="text-3xl cursor-pointer md:hidden block">
                        <ion-icon
                            name={menuOpen ? "close-outline" : "menu-outline"}
                            onClick={() => setMenuOpen(!menuOpen)}>
                        </ion-icon>
                    </span>
                </div>
            </nav>

            {/* MENU MOBILE */}
            <ul className={`md:hidden bg-[#25395C] text-white w-full absolute left-0 top-14 flex flex-col items-center gap-6 py-6 text-lg font-bold transition-all duration-500 
                ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>

                <li><Link to='/' onClick={() => setMenuOpen(false)}>Inicio</Link></li>

                <li><Link to='/productos' onClick={() => setMenuOpen(false)}>Productos</Link></li>
                <li><Link to='/servicios' onClick={() => setMenuOpen(false)}>Servicios</Link></li>

                <li><Link to='/quienessomos' onClick={() => setMenuOpen(false)}>¿Quiénes somos?</Link></li>

                <li className="bg-blue-500 text-white px-5 py-1 rounded-lg">
                    <Link to='/login' onClick={() => setMenuOpen(false)}>Registro</Link>
                </li>
            </ul>

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
                                logout(); //borra token y setea user(null)
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
        </header>
    );
};
