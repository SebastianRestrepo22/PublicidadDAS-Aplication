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
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                className="w-full h-10 px-3 border rounded bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Alto (cm)</label>
              <input
                type="number"
                name="alto"
                value={form.alto}
                onChange={handleChange}
                className="w-full h-10 px-3 border rounded bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Ancho (cm)</label>
              <input
                type="number"
                name="ancho"
                value={form.ancho}
                onChange={handleChange}
                className="w-full h-10 px-3 border rounded bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 border rounded bg-gray-100"
              ></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">URL de la Imagen</label>
              <input
                type="text"
                name="urlImagen"
                value={form.urlImagen}
                onChange={handleChange}
                className="w-full h-10 px-3 border rounded bg-gray-100"
              />
            </div>

            <button
              onClick={guardarCambios}
              className="bg-black text-white p-3 rounded-xl hover:bg-gray-900 font-bold transition duration-300 text-center"
            >
              Guardar cambios
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};
