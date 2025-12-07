import { Link } from "react-router-dom";
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
    nombreInsumo: "",
    stock: "",
  });

  // Obtener insumos
  const fetchInsumos = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setInsumos(data);
    } catch (error) {
      toast.error("Error al obtener insumo");
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  // Crear insumo
  const handleCreate = async () => {
    try {
      await axios.post(API_URL, {
        nombreInsumo: formCrear.nombreInsumo,
        stock: Number(formCrear.stock), 
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
    try {
      await axios.put(
        `http://localhost:3000/api/insumos/${selectedInsumo.InsumoId}`,
        formEditar
      );
      toast.success("Insumo actualizado correctamente ")
      fetchInsumos();
      setOpenEditar(false);
    } catch (error) {
      toast.error("Error al actualizar el insumo");
    }
  };

  // Eliminar insumo
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/insumos/${selectedInsumo.InsumoId}`
      );
      toast.success("Insumo eliminado correctamente")
      setOpenEliminar(false);
      fetchInsumos();
    } catch (err) {
      toast.error("Error al eliminar el insumo");

    }
  };

  const openEditarModal = (item) => {
    setSelectedInsumo(item);
    setFormEditar({
      nombreInsumo: item.Nombre,
      stock: item.Stock,
    });
    setOpenEditar(true);
  };

  // filtro
  const insumosFiltrados = insumos.filter((i) => {
    if (!busqueda) return true;
    if (campoFiltro === "id") {
      return i.InsumoId.toString().includes(busqueda);
    }

    if (campoFiltro === "nombre") {
      return i.Nombre.toLowerCase().includes(busqueda.toLowerCase());
    }

    if (campoFiltro === "stock") {
      return i.Stock.toString().includes(busqueda)
    }

    return (
      i.InsumoId.toString().includes(busqueda) ||
      i.Nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.Stock.toString().includes(busqueda)
    );

  })



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">
            Gestión de insumos
          </h1>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 ">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald"
              >
                <Plus size={18} /> Nuevo insumo
              </Link>

              <select value={campoFiltro}
                onChange={(e) => setCampoFiltro(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[140px]"
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
                  className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                <tr>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">
                    ID
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">
                    Nombre del insumo
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {insumosFiltrados.map((i) => (
                  <tr key={i.InsumoId} className="hover:bg-slate-50 transition-colors duration-150 ">
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{i.InsumoId}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{i.Nombre}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{i.Stock}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Link
                          onClick={() => openEditarModal(i)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        >
                          <Edit size={16} />
                        </Link>
                        <Link
                          onClick={() => {
                            setSelectedInsumo(i);
                            setOpenVer(true);
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          onClick={() => {
                            setSelectedInsumo(i);
                            setOpenEliminar(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        >
                          <Trash2 size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODALES */}
          {/* Crear */}
          <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-6">Nuevo insumo</h3>
              <form className="grid grid-cols-1 gap-6 text-left">
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">Nombre insumo</label>
                  <input
                    placeholder="Ingrese nombre insumo"
                    value={formCrear.nombreInsumo}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-[#EEECEC focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, nombreInsumo: valor});
                      const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                      if (!regex.test(valor)) {
                        setErrorNombre("El nombre solo puede contener letras y espacios");
                      } else if (valor.trim() === "") {
                        setErrorNombre("El nombre es obligatorio")
                      }else {
                        setErrorNombre("")
                      }
                    }}
                  />
                  {errorNombre && (
                    <span className="text-red-500 text-sm mt-1">{errorNombre}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">Stock</label>
                  <input
                    placeholder="Ingrese stock"
                    value={formCrear.stock}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-[#EEECEC focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, stock: valor});

                      const regex = /^[0-9]+$/;
                      if (!regex.test(valor)) {
                        setErrorStock("El stock solo puede contener numeros");
                      }else if (valor.trim() === "") {
                        setErrorStock("El stock es obligatorio")
                      }
                    }}
                  />
                  {errorStock && (
                    <span className="text-red-500 text-sm mt-1">{errorStock}</span>
                  )}
                </div>
                <div className="col-span-2 flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Crear insumo
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenCreate(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Editar */}
          <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-6">Editar insumo</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex flex-col">
                  <input
                    placeholder="Ingrese su insumo"
                    value={formEditar.nombreInsumo}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-[#EEECEC focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFormEditar({ ...formEditar, nombreInsumo: e.target.value })}
                  />
                </div>
                <div className="flex flex-col">
                  <input
                    placeholder="Insumo su stock"
                    value={formEditar.stock}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-[#EEECEC focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFormEditar({ ...formEditar, stock: e.target.value })}
                  />
                </div>
                <div className="col-span-2 flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenEditar(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Ver */}
          <Modal open={openVer} onClose={() => setOpenVer(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-6">Ver insumo</h3>
              {selectedInsumo && (
                <div className="text-left space-y-2">
                  <p>ID: {selectedInsumo.InsumoId}</p>
                  <p>Nombre: {selectedInsumo.Nombre}</p>
                  <p>Stock: {selectedInsumo.Stock}</p>
                </div>
              )}
              <button
                onClick={() => setOpenVer(false)}
                className="mt-4 bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </Modal>

          {/* Eliminar */}
          <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
            <div className="w-[400px] p-6 mx-auto text-center ">
              <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar insumo</h3>
              <p className="mb-6">¿Estás seguro de eliminar este insumo?</p>
              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
                <button
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => setOpenEliminar(false)}
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