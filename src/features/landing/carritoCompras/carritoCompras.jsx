import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { useCart } from "../../../context/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";


export const CarritoCompras = () => {
  const { user } = useAuth();

  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="from-slate-50 to-blue-50 pt-6 sm:pt-12 m-4 sm:m-10 p-4 sm:p-10 flex-1">
          <div className="pt-10">
            <h1 className="font-bold text-lg sm:text-2xl">Mi carrito</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-10">
            {/* Resumen del pedido */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg ring-1 ring-gray-200 h-fit">
              <h1 className="font-bold text-base sm:text-lg mb-4 border-b pb-2">Resumen del pedido</h1>

              <div className="flex justify-between mb-4 text-sm sm:text-base">
                <h3 className="font-bold">Total aproximado:</h3>
                <h3 className="text-green-700 font-semibold">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(getTotal())}
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="w-full bg-black text-white py-3 rounded-xl font-bold"
                  onClick={() => {
                    if (!user) {
                      setShowModal(true);
                      return;
                    }
                    // aquí iría la navegación a checkout cuando sí hay usuario
                  }}
                >
                  Finalizar compra
                </button>
                <button onClick={clearCart} className="w-full border py-2 rounded-xl mt-2">
                  Vaciar carrito
                </button>
              </div>
            </div>

            {/* Lista de items */}
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {cart.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow text-center">
                  <h3 className="font-semibold">Tu carrito está vacío</h3>
                  <p className="mt-2">Añade productos desde <Link to="/productos" className="text-blue-600 underline">productos</Link> o <Link to="/servicios" className="text-blue-600 underline">servicios</Link>.</p>
                </div>
              ) : (
                cart.map((line) => (
                  <div key={line.id} className="bg-white p-4 rounded-xl shadow-lg flex gap-4 items-center">
                    <img src={line.UrlImagen || "https://via.placeholder.com/200"} alt={line.Nombre} className="w-28 h-28 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{line.Nombre}</h3>
                      <p className="text-sm text-gray-600">{line.options?.descripcion}</p>
                      <div className="text-sm text-gray-700 mt-2">
                        <div>Alto: {line.options?.alto ?? "-"} cm</div>
                        <div>Ancho: {line.options?.ancho ?? "-"} cm</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(line.id, line.quantity - 1)} className="px-2 py-1 border rounded">-</button>
                        <span>{line.quantity}</span>
                        <button onClick={() => updateQuantity(line.id, line.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format((Number(line.Precio) || 0) * (line.quantity || 1))}
                        </div>
                        <button onClick={() => removeFromCart(line.id)} className="text-sm text-red-600 mt-1">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
              <h2 className="text-lg font-bold">Necesitas una cuenta</h2>
              <p className="mt-2">Para continuar con la compra, inicia sesión o regístrate.</p>

              <div className="flex flex-col gap-2 mt-4">
                <Link
                  to="/login"
                  className="bg-blue-600 text-white py-2 rounded-xl font-semibold"
                >
                  Iniciar sesión
                </Link>

                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm text-gray-600 mt-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div >
    </>
  );
};
