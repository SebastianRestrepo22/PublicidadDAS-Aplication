import React, { useRef, useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetDataServices } from "../../dashboard/servicios/services/services.servicios";
import { getAllCategorias } from "../../dashboard/categoriadediseño/services/services.categoria";
import { useCart } from "../../../context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Productos = () => {
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState([]);
  const [productosDescuentoRandom, setProductosDescuentoRandom] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const carouselRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Datos de ejemplo para carrusel
  const products = [
    { name: "Tarjetas de Presentación", price: "$49", image: "https://images.unsplash.com/photo-1581092588429-14f0d3f8df8e?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=400" },
    { name: "Volantes Publicitarios", price: "$79", image: "https://images.unsplash.com/photo-1557683316-973673baf926?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=400" },
    { name: "Afiches Promocionales", price: "$129", image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=400" },
    { name: "Catálogos Empresariales", price: "$199", image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=400" },
    { name: "Calendarios Personalizados", price: "$59", image: "https://images.unsplash.com/photo-1581090700227-4c4b6a5a5cfb?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=400" },
    { name: "Stickers Adhesivos", price: "$39", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=400" },
    { name: "Carpetas Corporativas", price: "$149", image: "https://images.unsplash.com/photo-1503602642458-232111445657?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=400" },
    { name: "Revistas", price: "$299", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=400" }
  ];

  const slide = (direction) => {
    let newIndex = carouselIndex + direction;
    if (newIndex >= products.length) newIndex = 0;
    if (newIndex < 0) newIndex = products.length - 1;
    setCarouselIndex(newIndex);

    if (carouselRef.current) {
      const card = carouselRef.current.firstChild;
      if (card) {
        const cardWidth = card.getBoundingClientRect().width + 24; // gap-6
        carouselRef.current.scrollTo({ left: newIndex * cardWidth, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => slide(1), 10000);
    return () => clearInterval(interval);
  }, [carouselIndex]);

  useEffect(() => {
    const fetchProductos = async () => {
      const response = await GetDataServices();
      const productosSolo = response.data.filter(p => p.Tipo === "producto");
      setProductos(productosSolo);

      const productosConDesc = productosSolo.filter(p => p.Descuento > 0);
      const seleccion = productosConDesc.sort(() => 0.5 - Math.random()).slice(0, 3);
      setProductosDescuentoRandom(seleccion);
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      const data = await getAllCategorias();
      if (data?.data) setCategorias(data.data);
    };
    fetchCategorias();
  }, []);

  const productosConDescuento = productos.filter(p => p.Descuento > 0);

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria = categoriaSeleccionada ? String(producto.CategoriaId) === categoriaSeleccionada : true;
    const coincideBusqueda = producto.Nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const handleAddClick = (producto) => {
    // Si es personalizado → va al diseño del producto
    if (producto.EsPersonalizado) {
      navigate("/carritoproducto", { state: { item: producto, from: "/productos" } });
      return;
    }

    const stock = producto.Stock ?? producto.stock ?? null;

    // Verificar si ya existe en el carrito
    const existing = cart.find(
      (item) => item.ProductoServicioId === producto.ProductoServicioId
    );

    const currentQuantity = existing ? existing.quantity : 0;
    const newQuantity = currentQuantity + 1;

    // Validación de stock antes de agregar
    if (stock !== null && newQuantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }

    // Si todo bien → agregar al carrito
    addToCart(producto, {}, 1);
    toast.success(`${producto.Nombre} agregado al carrito`);
  };


  const handleCategoriaClick = (id) => {
    setCategoriaSeleccionada(id);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <Navbar />
      </nav>

      {/* Buscador + botón sidebar */}
      <div className="sticky top-[55px] z-40 bg-white border-b shadow-sm px-4 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar producto"
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
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-[55px] left-0 h-[calc(100vh-55px)] w-[260px] bg-white border-r shadow-md p-5 z-50 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <h2 className="text-xl font-bold mb-4">Categorías</h2>
        <div className="flex flex-col gap-3">
          <button
            className={`text-left px-3 py-2 rounded-lg border ${categoriaSeleccionada === "" ? "bg-blue-200" : "bg-slate-100"}`}
            onClick={() => handleCategoriaClick("")}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.CategoriaId}
              className={`text-left px-3 py-2 rounded-lg border ${categoriaSeleccionada === String(cat.CategoriaId) ? "bg-blue-200" : "bg-slate-100"}`}
              onClick={() => handleCategoriaClick(String(cat.CategoriaId))}
            >
              {cat.Nombre}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex justify-center mt-6">
        <div className="w-full max-w-6xl px-4">

          {/* Carrusel */}
          <div className="pt-8 relative">
            <h1 className="text-center font-bold text-4xl mb-2">Productos que no puedes perder</h1>
            <p className="text-gray-400 text-center mb-12">Descubra nuestros productos y transforma tus ideas en impresiones únicas.</p>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center z-10">
                <button onClick={() => slide(-1)} className="bg-white text-gray-800 rounded-full p-2 shadow-lg">&lt;</button>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center z-10">
                <button onClick={() => slide(1)} className="bg-white text-gray-800 rounded-full p-2 shadow-lg">&gt;</button>
              </div>

              <div ref={carouselRef} className="flex gap-6 overflow-hidden py-8 px-2 sm:px-8 scroll-smooth">
                {products.map((product, idx) => (
                  <div key={idx} className="flex-none w-[90%] sm:w-72 bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-white font-semibold">{product.name}</h3>
                      <p className="text-indigo-400 font-bold">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sección descuentos */}
          <section className="bg-yellow-100 py-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">¡Aprovecha nuestras ofertas!</h2>
              <div className="flex justify-center flex-wrap gap-6">
                {productosConDescuento.length === 0 ? (
                  <p>No hay productos con descuento disponibles.</p>
                ) : (
                  productosDescuentoRandom.map(producto => (
                    <div key={producto.ProductoServicioId} className="bg-white p-6 rounded-xl shadow-lg w-[90%] sm:w-72">
                      <h3 className="text-xl font-semibold mb-2">{producto.Nombre}</h3>
                      <p className="text-gray-500 mb-4">
                        Antes: <span className="line-through">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(producto.Precio)}</span>
                      </p>
                      <p className="text-green-600 font-bold text-2xl mb-4">
                        {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(producto.Precio - (producto.Precio * producto.Descuento) / 100)}
                      </p>
                      <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition" onClick={() => handleAddClick(producto)}>Comprar</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Listado productos */}
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 pt-10">Nuestros productos</h1>
          <div className="flex flex-wrap justify-center gap-6 pb-12">
            {productosFiltrados.length === 0 ? (
              <div className="text-center w-full">
                <h2>No hay productos disponibles</h2>
                <p>Vuelve más tarde o revisa nuestras categorías.</p>
              </div>
            ) : (
              productosFiltrados.map((producto) => (
                <div key={producto.ProductoServicioId} className="bg-white rounded-xl shadow-lg overflow-hidden w-[90%] sm:w-72">
                  <img src={producto.UrlImagen} alt={producto.Nombre} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{producto.Nombre}</h3>
                    <p className="text-gray-500">{producto.Descripcion}</p>
                    <div className="mt-4 flex flex-col gap-2">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" onClick={() => handleAddClick(producto)}>
                        {producto.EsPersonalizado ? "Personalizar" : "Añadir"}
                      </button>
                      <div>
                        {producto.Descuento > 0 && (
                          <span className="line-through text-gray-400 mr-2">
                            {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(producto.Precio)}
                          </span>
                        )}
                        <span className="font-bold text-lg">
                          {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(
                            producto.Descuento > 0 ? producto.Precio - (producto.Precio * producto.Descuento) / 100 : producto.Precio
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      <Footer />

      <ToastContainer theme="colored" />
    </>
  );
};