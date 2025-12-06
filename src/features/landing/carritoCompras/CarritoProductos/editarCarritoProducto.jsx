import React, { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/footer";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";

export const EditarCarritoProducto = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateItem } = useCart();

  const item = location.state?.item;

  useEffect(() => {
    if (!item) navigate("/carritodecompras");
  }, [item, navigate]);

  const [form, setForm] = useState({
    cantidad: item?.quantity || 1,
    alto: item?.options?.alto || "",
    ancho: item?.options?.ancho || "",
    descripcion: item?.options?.descripcion || "",
    urlImagen: item?.options?.urlImagen || "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const guardarCambios = () => {
    updateItem(item.id, {
      quantity: Number(form.cantidad),
      options: {
        alto: Number(form.alto),
        ancho: Number(form.ancho),
        descripcion: form.descripcion,
        urlImagen: form.urlImagen,
        ProductoServicioId: item.options.ProductoServicioId,
        Tipo: item.options.Tipo
      }
    });

    navigate("/carritodecompras");
  };

  if (!item) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto px-4 pt-[90px] flex-1 max-w-5xl">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">

          {/* Imagen + Título */}
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              {item.Nombre}
            </h2>

            <div className="rounded-3xl overflow-hidden shadow-xl bg-white p-2">
              <img
                className="w-full h-[420px] object-cover rounded-2xl"
                src={form.urlImagen || "https://via.placeholder.com/500"}
                alt="Producto"
              />
            </div>
          </div>

          {/* Formulario */}
          <form
            className="bg-white p-8 rounded-3xl shadow-xl flex flex-col gap-6 border border-gray-100"
            onSubmit={(e) => e.preventDefault()}
          >

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                className="h-12 px-4 border rounded-xl shadow-sm border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Alto (cm)</label>
              <input
                type="number"
                name="alto"
                value={form.alto}
                onChange={handleChange}
                className="h-12 px-4 border rounded-xl shadow-sm border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Ancho (cm)</label>
              <input
                type="number"
                name="ancho"
                value={form.ancho}
                onChange={handleChange}
                className="h-12 px-4 border rounded-xl shadow-sm border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border rounded-xl shadow-sm border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">URL de la Imagen</label>
              <input
                type="text"
                name="urlImagen"
                value={form.urlImagen}
                onChange={handleChange}
                className="h-12 px-4 border rounded-xl shadow-sm border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            {/* Botones lado a lado */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/carritodecompras")}
                className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-xl font-semibold hover:bg-gray-300 transition shadow"
              >
                Regresar
              </button>

              <button
                onClick={guardarCambios}
                className="flex-1 bg-black text-white p-3 rounded-xl font-semibold hover:bg-gray-900 transition shadow"
              >
                Guardar cambios
              </button>
            </div>

          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};
