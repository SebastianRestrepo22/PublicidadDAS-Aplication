import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CarritoProducto = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const item = location.state?.item || null;
    const from = location.state?.from || "/productos";

    const { addToCart } = useCart();

    const [cantidad, setCantidad] = useState("1");
    const [alto, setAlto] = useState("");
    const [ancho, setAncho] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [urlImagen, setUrlImagen] = useState(item?.UrlImagen || item?.UrlImagen || "");

    const [errors, setErrors] = useState({});

    const esPersonalizado = item?.EsPersonalizado === true;

    useEffect(() => {
        if (item) {
            setUrlImagen(item.UrlImagen || item.Url || "");
        }
    }, [item]);

    const handleAdd = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!cantidad || Number(cantidad) < 1)
            newErrors.cantidad = "La cantidad debe ser mínimo 1";

        if (!descripcion.trim())
            newErrors.descripcion = "La descripción es obligatoria";

        if (esPersonalizado) {
            if (!alto) newErrors.alto = "Ingrese el alto requerido";
            if (!ancho) newErrors.ancho = "Ingrese el ancho requerido";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        const options = {
            descripcion,
            urlImagen,
            ProductoServicioId: item.ProductoServicioId,
            Tipo: item.Tipo
        };

        if (esPersonalizado) {
            options.alto = alto;
            options.ancho = ancho;
        }

        addToCart(item, options, Number(cantidad));
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <h1 className="font-serif text-4xl font-bold text-gray-900 tracking-tight">
                        {item.Nombre}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="rounded-3xl overflow-hidden shadow-xl bg-white p-2">
                        <img
                            className="w-full h-[420px] object-cover rounded-2xl"
                            src={
                                urlImagen ||
                                item.UrlImagen ||
                                item.Url ||
                                "https://via.placeholder.com/800x600"
                            }
                            alt={item.Nombre}
                        />
                    </div>

                    <form
                        onSubmit={handleAdd}
                        className="bg-white p-8 rounded-3xl shadow-xl flex flex-col gap-6 border border-gray-100"
                    >
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-gray-700">Cantidad</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={cantidad}
                                onChange={(e) => {
                                    let v = e.target.value;

                                    if (v === "") {
                                        setCantidad("");
                                        return;
                                    }

                                    v = v.replace(/^0+(?=\d)/, "");

                                    if (/^\d+$/.test(v)) {
                                        setCantidad(v);
                                    }
                                }}
                                onBlur={() => {
                                    if (cantidad.trim() === "") {
                                        setCantidad("1");
                                    }
                                }}
                                className={`h-12 px-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-black focus:outline-none ${
                                    errors.cantidad ? "border-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.cantidad && (
                                <p className="text-red-600 text-sm">{errors.cantidad}</p>
                            )}
                        </div>

                        {esPersonalizado && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold text-gray-700">Alto (cm)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={alto}
                                        onChange={(e) => {
                                            let v = e.target.value;

                                            if (v === "") {
                                                setAlto("");
                                                return;
                                            }

                                            v = v.replace(/^0+(?=\d)/, "");

                                            if (/^\d+$/.test(v)) {
                                                setAlto(v);
                                            }
                                        }}
                                        onBlur={() => {
                                            if (alto.trim() === "") {
                                                setAlto("");
                                            }
                                        }}
                                        className={`h-12 px-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-black focus:outline-none ${
                                            errors.alto ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.alto && <p className="text-red-600 text-sm">{errors.alto}</p>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold text-gray-700">Ancho (cm)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={ancho}
                                        onChange={(e) => {
                                            let v = e.target.value;

                                            if (v === "") {
                                                setAncho("");
                                                return;
                                            }

                                            v = v.replace(/^0+(?=\d)/, "");

                                            if (/^\d+$/.test(v)) {
                                                setAncho(v);
                                            }
                                        }}
                                        onBlur={() => {
                                            if (ancho.trim() === "") {
                                                setAncho("");
                                            }
                                        }}
                                        className={`h-12 px-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-black focus:outline-none ${
                                            errors.ancho ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.ancho && <p className="text-red-600 text-sm">{errors.ancho}</p>}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-gray-700">Descripción / Observaciones</label>
                            <textarea
                                rows={4}
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-black focus:outline-none ${
                                    errors.descripcion ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Ej: papel couché 200gr, acabado brillante, etc."
                            />
                            {errors.descripcion && (
                                <p className="text-red-600 text-sm">{errors.descripcion}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-gray-700">URL imagen (opcional)</label>
                            <input
                                type="text"
                                value={urlImagen}
                                onChange={(e) => setUrlImagen(e.target.value)}
                                className="h-12 px-4 border rounded-xl shadow-sm border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex gap-4 mt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-black text-white py-3 rounded-xl font-semibold shadow-md hover:bg-gray-900 transition"
                            >
                                Añadir al carrito
                            </button>

                            <Link
                                to={from}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl text-center font-medium shadow-md hover:bg-gray-300 transition"
                            >
                                Volver sin añadir
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />

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
