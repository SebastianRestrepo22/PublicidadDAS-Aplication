import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../../components/modals/modal";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:3000/api/insumos";

export const Insumos = () => {
  const [insumos, setInsumos] = useState([]);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [campoFiltro, setCampoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorStock, setErrorStock] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);

  const [formCrear, setFormCrear] = useState({
    nombreInsumo: "",
    stock: "",
  });

  const [formEditar, setFormEditar] = useState({
    Nombre: "", // ✅ Nombres que espera el backend
    Stock: "",
  });

  // Obtener insumos
  const fetchInsumos = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setInsumos(data);
    } catch (error) {
      toast.error("Error al obtener insumos");
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  // Crear insumo
  const handleCreate = async () => {
    if (!formCrear.nombreInsumo.trim()) {
      setErrorNombre("El nombre es obligatorio");
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!formCrear.stock || isNaN(Number(formCrear.stock)) || Number(formCrear.stock) < 0) {
      setErrorStock("El stock debe ser un número válido >= 0");
      toast.error("El stock debe ser un número válido");
      return;
    }
    setErrorNombre("");
    setErrorStock("");

    try {
      await axios.post(API_URL, {
        Nombre: formCrear.nombreInsumo, // ✅ Envía Nombre, no nombreInsumo
        Stock: Number(formCrear.stock),
      });
      toast.success("Insumo creado exitosamente");
      setOpenCreate(false);
      setFormCrear({ nombreInsumo: "", stock: "" });
      fetchInsumos();
    } catch (err) {
      toast.error("Error al crear insumo");
    }
  };

  // Editar insumo
  const handleUpdate = async () => {
    if (!formEditar.Nombre?.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!formEditar.Stock || isNaN(Number(formEditar.Stock)) || Number(formEditar.Stock) < 0) {
      toast.error("El stock debe ser un número válido >= 0");
      return;
    }

    try {
      await axios.put(`${API_URL}/${selectedInsumo.InsumoId}`, {
        Nombre: formEditar.Nombre,
        Stock: Number(formEditar.Stock),
      });
      toast.success("Insumo actualizado correctamente");
      fetchInsumos();
      setOpenEditar(false);
    } catch (error) {
      toast.error("Error al actualizar el insumo");
    }
  };

  // Eliminar insumo
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedInsumo.InsumoId}`);
      toast.success("Insumo eliminado correctamente");
      setOpenEliminar(false);
      fetchInsumos();
    } catch (err) {
      toast.error("Error al eliminar el insumo");
    }
  };

  const openEditarModal = (item) => {
    setSelectedInsumo(item);
    setFormEditar({
      Nombre: item.Nombre, // ✅ Usa los mismos nombres que la API
      Stock: item.Stock,
    });
    setOpenEditar(true);
  };

  // Filtro
  const insumosFiltrados = insumos.filter((i) => {
    if (!busqueda.trim()) return true;
    const search = busqueda.toLowerCase();
    if (campoFiltro === "id") {
      return i.InsumoId.toString().includes(busqueda);
    }
    if (campoFiltro === "nombre") {
      return i.Nombre.toLowerCase().includes(search);
    }
    if (campoFiltro === "stock") {
      return i.Stock.toString().includes(busqueda);
    }
    return (
      i.InsumoId.toString().includes(busqueda) ||
      i.Nombre.toLowerCase().includes(search) ||
      i.Stock.toString().includes(busqueda)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6"> {/* ✅ Fondo neutro */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">
            Gestión de insumos
          </h1>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-all"
              >
                <Plus size={18} /> Nuevo insumo
              </button>

              <select
                value={campoFiltro}
                onChange={(e) => setCampoFiltro(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
              >
                <option value="">Filtrar por campo</option>
                <option value="id">ID</option>
                <option value="nombre">Nombre</option>
                <option value="stock">Stock</option>
              </select>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar insumos"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-800"> {/* ✅ Sin gradiente */}
                <tr>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Nombre del insumo</th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Stock</th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {insumosFiltrados.map((i) => (
                  <tr key={i.InsumoId} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">
                      {i.InsumoId?.toString().substring(0, 3)}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{i.Nombre}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{i.Stock}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditarModal(i)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInsumo(i);
                            setOpenVer(true);
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInsumo(i);
                            setOpenEliminar(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODAL CREAR */}
          <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-4">Nuevo insumo</h3>
              <form className="grid grid-cols-1 gap-4 text-left">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    placeholder="Nombre del insumo"
                    value={formCrear.nombreInsumo}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                      errorNombre ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                    }`}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, nombreInsumo: valor });
                      const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                      if (!regex.test(valor)) {
                        setErrorNombre("Solo letras y espacios");
                      } else if (valor.trim() === "") {
                        setErrorNombre("El nombre es obligatorio");
                      } else {
                        setErrorNombre("");
                      }
                    }}
                  />
                  {errorNombre && <span className="text-red-500 text-xs mt-1">{errorNombre}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Cantidad en stock"
                    value={formCrear.stock}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                      errorStock ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                    }`}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, stock: valor });
                      if (valor === "" || (Number(valor) >= 0 && !isNaN(Number(valor)))) {
                        setErrorStock("");
                      } else {
                        setErrorStock("Ingrese un número válido >= 0");
                      }
                    }}
                  />
                  {errorStock && <span className="text-red-500 text-xs mt-1">{errorStock}</span>}
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenCreate(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* MODAL EDITAR */}
          <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-4">Editar insumo</h3>
              <form className="grid grid-cols-1 gap-4 text-left">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    placeholder="Nombre del insumo"
                    value={formEditar.Nombre}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFormEditar({ ...formEditar, Nombre: e.target.value })}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Cantidad en stock"
                    value={formEditar.Stock}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFormEditar({ ...formEditar, Stock: e.target.value })}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenEditar(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* MODAL VER */}
          <Modal open={openVer} onClose={() => setOpenVer(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-4">Ver insumo</h3>
              {selectedInsumo && (
                <div className="text-left space-y-3 text-gray-700">
                  <p><strong>ID:</strong> {selectedInsumo.InsumoId?.toString().substring(0, 3)}</p>
                  <p><strong>Nombre:</strong> {selectedInsumo.Nombre}</p>
                  <p><strong>Stock:</strong> {selectedInsumo.Stock}</p>
                </div>
              )}
              <button
                onClick={() => setOpenVer(false)}
                className="mt-6 bg-gray-200 px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </Modal>

          {/* MODAL ELIMINAR */}
          <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
            <div className="w-[400px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-3">Eliminar insumo</h3>
              {selectedInsumo && (
                <p className="mb-5 text-gray-600">
                  ¿Estás seguro de eliminar <strong>"{selectedInsumo.Nombre}"</strong>?
                </p>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setOpenEliminar(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
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