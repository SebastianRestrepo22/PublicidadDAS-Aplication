import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar"; // ajusta la ruta si la tienes en otra carpeta
import { Footer } from "../../components/footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext"; // ruta relativa según tu estructura

//importamos toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CarritoProducto = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const item = location.state?.item || null;
    const from = location.state?.from || "/productos";

    const { addToCart } = useCart();

    // Form state (inicia con valores útiles si vienen del producto)
    const [cantidad, setCantidad] = useState(1);
    const [alto, setAlto] = useState("");
    const [ancho, setAncho] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [urlImagen, setUrlImagen] = useState(item?.UrlImagen || item?.UrlImagen || "");

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (item) {
            // si quieres precargar algo del item al form, lo haces aquí
            setUrlImagen(item.UrlImagen || item.Url || "");
        }
    }, [item]);

    const handleAdd = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!cantidad || cantidad < 1) {
            newErrors.cantidad = "La cantidad debe ser mínimo 1";
        }

        if (!alto) {
            newErrors.alto = "Ingrese el alto requerido";
        }

        if (!ancho) {
            newErrors.ancho = "Ingrese el ancho requerido";
        }

        if (!descripcion.trim()) {
            newErrors.descripcion = "La descripción es obligatoria";
        }

        setErrors(newErrors);

        // Si hay errores, no continúa
        if (Object.keys(newErrors).length > 0) return;

        const options = {
            alto,
            ancho,
            descripcion,
            urlImagen
        };

        addToCart(item, options, cantidad);
        navigate(from);
    };


    if (!item) {
        return (
            <>
                <Navbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">No se encontró el producto</h2>
                        <p className="mt-4">Vuelve a <Link to="/productos" className="text-blue-600 underline">productos</Link>.</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <div className="mx-auto px-4 pt-[70px] flex-1 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <h1 className="font-serif text-3xl font-bold text-gray-900">{item.Nombre}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="rounded-2xl overflow-hidden shadow-lg">
                        <img
                            className="w-full h-[420px] object-cover"
                            src={urlImagen || item.UrlImagen || item.Url || item.UrlImagen || "https://via.placeholder.com/800x600"}
                            alt={item.Nombre}
                        />
                    </div>

                    <form onSubmit={handleAdd} className="bg-white p-8 rounded-3xl shadow-lg flex flex-col gap-4">
                        <label className="font-semibold">Cantidad</label>
                        <input
                            type="number"
                            min="1"
                            value={cantidad}
                            onChange={(e) => setCantidad(Number(e.target.value))}
                            className={`h-12 px-4 border rounded-lg ${errors.cantidad ? "border-red-500" : ""}`}
                        />
                        {errors.cantidad && <p className="text-red-600 text-sm mt-1">{errors.cantidad}</p>}


                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold">Alto (cm)</label>
                                <input
                                    type="number"
                                    value={alto}
                                    onChange={(e) => setAlto(e.target.value)}
                                    className={`h-12 px-4 border rounded-lg ${errors.alto ? "border-red-500" : ""}`}
                                />
                                {errors.alto && <p className="text-red-600 text-sm mt-1">{errors.alto}</p>}

                            </div>
                            <div>
                                <label className="font-semibold">Ancho (cm)</label>
                                <input
                                    type="number"
                                    value={ancho}
                                    onChange={(e) => setAncho(e.target.value)}
                                    className={`h-12 px-4 border rounded-lg ${errors.ancho ? "border-red-500" : ""}`}
                                />
                                {errors.ancho && <p className="text-red-600 text-sm mt-1">{errors.ancho}</p>}

                            </div>
                        </div>

                        <div>
                            <label className="font-semibold">Descripción / Observaciones</label>
                            <textarea
                                rows={4}
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg ${errors.descripcion ? "border-red-500" : ""}`}
                                placeholder="Ej: papel couché 200gr, acabado brillante, etc."
                            />
                            {errors.descripcion && <p className="text-red-600 text-sm mt-1">{errors.descripcion}</p>}

                        </div>

                        <div>
                            <label className="font-semibold">URL imagen (opcional)</label>
                            <input
                                type="text"
                                value={urlImagen}
                                onChange={(e) => setUrlImagen(e.target.value)}
                                className="h-12 px-4 border rounded-lg"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-black to-gray-800 text-white text-white py-3 rounded-xl font-semibold">
                                Añadir al carrito
                            </button>
                            <Link to={from} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl text-center">
                                Volver sin añadir
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
            
            {/* El contenedor de notificaciones (una sola vez) */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
};
