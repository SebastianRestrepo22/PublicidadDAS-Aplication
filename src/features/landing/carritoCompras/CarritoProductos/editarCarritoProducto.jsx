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
<<<<<<< HEAD
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 pt-40 flex-1">
        <button
          onClick={() => navigate("/carritodecompras")}
          className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-700 transition duration-300"
        >
          Regresar
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="flex flex-col justify-center items-center md:items-start">
            <h2 className="font-bold text-2xl mb-4">{item.Nombre}</h2>
            <img
              className="max-w-sm w-[500px] h-[500px] rounded-xl shadow-lg"
              src={form.urlImagen || "https://via.placeholder.com/500"}
              alt="Producto"
            />
          </div>

          <form
            className="text-black border-2 border-gray-300 p-6 rounded-xl w-full max-w-md flex flex-col gap-4 shadow-md"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Cantidad</label>
=======
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
>>>>>>> origin/main
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
<<<<<<< HEAD
                className="w-full h-10 px-3 border rounded bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Alto (cm)</label>
=======
                className="h-12 px-4 border rounded-xl shadow-sm border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Alto (cm)</label>
>>>>>>> origin/main
              <input
                type="number"
                name="alto"
                value={form.alto}
                onChange={handleChange}
<<<<<<< HEAD
                className="w-full h-10 px-3 border rounded bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Ancho (cm)</label>
=======
                className="h-12 px-4 border rounded-xl shadow-sm border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Ancho (cm)</label>
>>>>>>> origin/main
              <input
                type="number"
                name="ancho"
                value={form.ancho}
                onChange={handleChange}
<<<<<<< HEAD
                className="w-full h-10 px-3 border rounded bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Descripción</label>
=======
                className="h-12 px-4 border rounded-xl shadow-sm border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Descripción</label>
>>>>>>> origin/main
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={4}
<<<<<<< HEAD
                className="w-full px-3 border rounded bg-gray-100"
              ></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">URL de la Imagen</label>
=======
                className="w-full px-4 py-3 border rounded-xl shadow-sm border-gray-300 bg-gray-50 focus:ring-2 focus:ring-black focus:outline-none"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">URL de la Imagen</label>
>>>>>>> origin/main
              <input
                type="text"
                name="urlImagen"
                value={form.urlImagen}
                onChange={handleChange}
<<<<<<< HEAD
                className="w-full h-10 px-3 border rounded bg-gray-100"
              />
            </div>

            <button
              onClick={guardarCambios}
              className="bg-black text-white p-3 rounded-xl hover:bg-gray-900 font-bold transition duration-300 text-center"
            >
              Guardar cambios
            </button>
=======
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

>>>>>>> origin/main
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};
