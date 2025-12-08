import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetDataServices } from "../../dashboard/servicios/services/services.servicios";
import { getAllCategorias } from "../../dashboard/categoriadediseño/services/services.categoria";
import { useCart } from "../../../context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Servicios = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [serviciosDescuentoRandom, setServiciosDescuentoRandom] = useState([]);

  useEffect(() => {
    const fetchServicios = async () => {
      const response = await GetDataServices();
      const serviciosSolo = response.data.filter((s) => s.Tipo === "servicio");
      setServicios(serviciosSolo);

      // Selección de servicios con descuento (máx 3)
      const serviciosConDesc = serviciosSolo.filter((s) => s.Descuento > 0);
      const seleccion = serviciosConDesc.sort(() => 0.5 - Math.random()).slice(0, 3);
      setServiciosDescuentoRandom(seleccion);
    };
    fetchServicios();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      const data = await getAllCategorias();
      if (data?.data) setCategorias(data.data);
    };
    fetchCategorias();
  }, []);

  const serviciosFiltrados = servicios.filter((servicio) => {
    const coincideCategoria = categoriaSeleccionada
      ? String(servicio.CategoriaId) === categoriaSeleccionada
      : true;
    const coincideBusqueda = servicio.Nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const handleAddClick = (servicio) => {
    // Siempre se envía al formulario, personalizado o no
    navigate("/carritoproducto", { state: { item: servicio, from: "/servicios" } });
  };

  const handleCategoriaClick = (id) => {
    setCategoriaSeleccionada(id);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Navbar />

      {/* Buscador + botón sidebar */}
      <div className="sticky top-[55px] z-40 bg-white border-b shadow-sm px-4 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar servicio"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full bg-white"
            />
          </div>
          <button
            className="p-2 rounded bg-blue-500 text-white whitespace-nowrap"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Cerrar categorías" : "Categorías"}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-[55px] left-0 h-[calc(100vh-55px)] w-[260px] bg-white border-r shadow-md p-5 z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Categorías</h2>
        <div className="flex flex-col gap-3">
          <button
            className={`text-left px-3 py-2 rounded-lg border ${
              categoriaSeleccionada === "" ? "bg-blue-200" : "bg-slate-100"
            }`}
            onClick={() => handleCategoriaClick("")}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.CategoriaId}
              className={`text-left px-3 py-2 rounded-lg border ${
                categoriaSeleccionada === String(cat.CategoriaId) ? "bg-blue-200" : "bg-slate-100"
              }`}
              onClick={() => handleCategoriaClick(String(cat.CategoriaId))}
            >
              {cat.Nombre}
            </button>
          ))}
        </div>
      </aside>

      {/* Sección descuentos */}
      {serviciosDescuentoRandom.length > 0 && (
        <section className="bg-yellow-100 py-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">¡Aprovecha nuestras ofertas!</h2>
            <div className="flex justify-center flex-wrap gap-6">
              {serviciosDescuentoRandom.map((servicio) => (
                <div
                  key={servicio.ProductoServicioId}
                  className="bg-white p-6 rounded-xl shadow-lg w-[90%] sm:w-72"
                >
                  <h3 className="text-xl font-semibold mb-2">{servicio.Nombre}</h3>
                  <p className="text-gray-500 mb-4">
                    Antes:{" "}
                    <span className="line-through">
                      {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(servicio.Precio)}
                    </span>
                  </p>
                  <p className="text-green-600 font-bold text-2xl mb-4">
                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(
                      servicio.Precio - (servicio.Precio * servicio.Descuento) / 100
                    )}
                  </p>
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                    onClick={() => handleAddClick(servicio)}
                  >
                    Comprar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Listado servicios */}
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 pt-10">Nuestros servicios</h1>
      <div className="flex flex-wrap justify-center gap-6 px-4 pb-20">
        {serviciosFiltrados.length === 0 ? (
          <div className="text-center w-full">
            <h2>No hay servicios disponibles</h2>
            <p>Vuelve más tarde o revisa nuestras categorías.</p>
          </div>
        ) : (
          serviciosFiltrados.map((servicio) => (
            <div
              key={servicio.ProductoServicioId}
              className="bg-white rounded-xl shadow-lg overflow-hidden w-[90%] sm:w-72"
            >
              <img
                src={servicio.UrlImagen || "https://via.placeholder.com/400x300"}
                alt={servicio.Nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-semibold">{servicio.Nombre}</h3>
                <p className="text-gray-500 text-sm line-clamp-3">{servicio.Descripcion}</p>
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    onClick={() => handleAddClick(servicio)}
                  >
                    Añadir
                  </button>
                  <div>
                    {servicio.Descuento > 0 && (
                      <span className="line-through text-gray-400 mr-2">
                        {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(servicio.Precio)}
                      </span>
                    )}
                    <span className="font-bold text-lg">
                      {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(
                        servicio.Descuento > 0
                          ? servicio.Precio - (servicio.Precio * servicio.Descuento) / 100
                          : servicio.Precio
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
      <ToastContainer theme="colored" />
    </>
  );
};
