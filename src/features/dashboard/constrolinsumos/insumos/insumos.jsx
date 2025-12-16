import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../../components/modals/modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  getAllInsumos, 
  createInsumo, 
  updateInsumo, 
  deleteInsumo 
} from "./services/services.insumos";
import { Pagination } from "../../components/paginacion/pagination"; // 👈 Importado

// Función para reducir el ID a 4 caracteres con puntos suspensivos
const getShortId = (id) => {
  const str = String(id || "");
  if (str.length <= 4) return str;
  return str.substring(0, 4) + "...";
};

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

  // 👇 Estados para PAGINACIÓN
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
      const data = await getAllInsumos();
      setInsumos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener insumos:", error);
      toast.error("Error al obtener insumos");
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  // 👇 Efecto para filtrar y preparar datos para paginación
  useEffect(() => {
    let filtered = insumos;
    if (campoFiltro && busqueda.trim()) {
      filtered = insumos.filter((i) => {
        const id = i.InsumoId || i.id || "";
        const nombre = i.Nombre || i.nombreInsumo || "";
        const stock = i.Stock || i.stock || "";
        
        if (campoFiltro === "id") {
          return id.toString().includes(busqueda);
        }
        if (campoFiltro === "nombre") {
          return nombre.toLowerCase().includes(busqueda.toLowerCase());
        }
        if (campoFiltro === "stock") {
          return stock.toString().includes(busqueda);
        }
        return (
          id.toString().includes(busqueda) ||
          nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          stock.toString().includes(busqueda)
        );
      });
    }
    setAllData(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1); // Reiniciar página al filtrar
  }, [busqueda, campoFiltro, insumos]);

  // 👇 Efecto para paginar
  useEffect(() => {
    if (allData.length > 0) {
      const totalPagesCalc = Math.ceil(allData.length / itemsPerPage);
      setTotalPages(totalPagesCalc > 0 ? totalPagesCalc : 1);
      if (currentPage > totalPagesCalc && totalPagesCalc > 0) {
        setCurrentPage(totalPagesCalc);
      }
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedData(allData.slice(startIndex, endIndex));
    } else {
      setPaginatedData([]);
      setTotalPages(1);
    }
  }, [itemsPerPage, currentPage, allData]);

  // Resetear formulario de creación
  const resetCreateForm = () => {
    setFormCrear({ nombreInsumo: "", stock: "" });
    setErrorNombre("");
    setErrorStock("");
  };

  // Validar nombre
  const validarNombre = (nombre) => {
    if (!nombre || !nombre.trim()) {
      return "El nombre es obligatorio";
    }
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nombreRegex.test(nombre.trim())) {
      return "Solo letras y espacios permitidos";
    }
    if (nombre.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    if (nombre.trim().length > 100) {
      return "El nombre no puede exceder 100 caracteres";
    }
    return "";
  };

  // Validar stock
  const validarStock = (stock) => {
    if (stock === "" || stock === null || stock === undefined) {
      return "El stock es obligatorio";
    }
    
    // Convertir a número
    const numStock = parseInt(stock, 10);
    if (isNaN(numStock)) {
      return "El stock debe ser un número válido";
    }
    if (numStock < 0) {
      return "El stock debe ser mayor o igual a 0";
    }
    if (!Number.isInteger(numStock)) {
      return "El stock debe ser un número entero";
    }
    if (numStock > 999999) {
      return "El stock no puede exceder 999,999";
    }
    return "";
  };

  // Crear insumo
  const handleCreate = async () => {
    // Validaciones
    const nombreError = validarNombre(formCrear.nombreInsumo);
    const stockError = validarStock(formCrear.stock);

    if (nombreError) {
      setErrorNombre(nombreError);
      toast.error(nombreError);
      return;
    }

    if (stockError) {
      setErrorStock(stockError);
      toast.error(stockError);
      return;
    }

    try {
      // Asegurarnos de que los datos estén en el formato correcto que espera el backend
      const insumoData = {
        nombreInsumo: formCrear.nombreInsumo.trim(),
        stock: parseInt(formCrear.stock, 10)
      };

      console.log("Enviando datos para crear insumo:", insumoData);
      
      const result = await createInsumo(insumoData);
      console.log("Respuesta del servidor:", result);
      
      toast.success("Insumo creado exitosamente");
      setOpenCreate(false);
      resetCreateForm();
      fetchInsumos();
    } catch (err) {
      console.error("Error al crear insumo:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        toast.error(err.response?.data?.error || err.response?.data?.message || "Error al crear insumo");
      } else if (err.request) {
        toast.error("No se pudo conectar con el servidor");
      } else {
        toast.error("Error inesperado al crear insumo");
      }
    }
  };

  // Editar insumo
  const handleUpdate = async () => {
    if (!selectedInsumo) {
      toast.error("No se seleccionó ningún insumo para editar");
      return;
    }

    const nombreError = validarNombre(formEditar.nombreInsumo);
    const stockError = validarStock(formEditar.stock);

    if (nombreError) {
      toast.error(nombreError);
      return;
    }

    if (stockError) {
      toast.error(stockError);
      return;
    }

    try {
      const insumoData = {
        nombreInsumo: formEditar.nombreInsumo.trim(),
        stock: parseInt(formEditar.stock, 10)
      };

      console.log("Enviando datos para actualizar insumo:", insumoData);
      
      await updateInsumo(selectedInsumo.InsumoId, insumoData);
      toast.success("Insumo actualizado correctamente");
      fetchInsumos();
      setOpenEditar(false);
      setSelectedInsumo(null);
    } catch (error) {
      console.error("Error al actualizar insumo:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Error al actualizar el insumo");
    }
  };

  // Eliminar insumo
  const handleDelete = async () => {
    if (!selectedInsumo) {
      toast.error("No se seleccionó ningún insumo para eliminar");
      return;
    }

    try {
      await deleteInsumo(selectedInsumo.InsumoId);
      toast.success("Insumo eliminado correctamente");
      setOpenEliminar(false);
      setSelectedInsumo(null);
      fetchInsumos();
    } catch (err) {
      console.error("Error al eliminar insumo:", err);
      toast.error(err.response?.data?.error || err.response?.data?.message || "Error al eliminar el insumo");
    }
  };

  const openEditarModal = (item) => {
    setSelectedInsumo(item);
    setFormEditar({
      nombreInsumo: item.Nombre || item.nombreInsumo || "",
      stock: item.Stock || item.stock || "",
    });
    setOpenEditar(true);
  };

  // 👇 Funciones de paginación
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-6">
            Gestión de insumos
          </h1>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <button
                onClick={() => {
                  resetCreateForm();
                  setOpenCreate(true);
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap text-sm sm:text-base"
              >
                <Plus size={18} /> Nuevo insumo
              </button>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar insumos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="border border-slate-300 rounded-lg pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 text-sm sm:text-base"
                />
              </div>

              <div className="flex gap-2 items-center">
                <select
                  value={campoFiltro}
                  onChange={(e) => setCampoFiltro(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-sm sm:text-base"
                >
                  <option value="">Filtrar por campo</option>
                  <option value="id">ID</option>
                  <option value="nombre">Nombre</option>
                  <option value="stock">Stock</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">
                      ID
                    </th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-7 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-left">
                      Nombre del insumo
                    </th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">
                      Stock
                    </th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((i) => (
                      <tr key={i.InsumoId || i.id} className="hover:bg-slate-50 transition-colors duration-150">
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle font-mono">
                          {getShortId(i.InsumoId || i.id)}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 align-middle">
                          {i.Nombre || i.nombreInsumo}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle">
                          {i.Stock || i.stock}
                        </td>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-center align-middle">
                          <div className="flex justify-center gap-1 sm:gap-2">
                            <button
                              onClick={() => openEditarModal(i)}
                              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                              title="Editar"
                            >
                              <Edit size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInsumo(i);
                                setOpenVer(true);
                              }}
                              className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                              title="Ver"
                            >
                              <Eye size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInsumo(i);
                                setOpenEliminar(true);
                              }}
                              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                              title="Eliminar"
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 sm:py-6 text-center text-gray-500 text-sm sm:text-base">
                        {insumos.length === 0 ? "No hay insumos registrados" : "No se encontraron resultados"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 👇 PAGINACIÓN */}
            {paginatedData.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>

          {/* MODALES */}
          {/* Crear */}
          <Modal open={openCreate} onClose={() => {
            setOpenCreate(false);
            resetCreateForm();
          }}>
            <div className="w-[90vw] max-w-[450px] p-4 sm:p-6 mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Nuevo insumo</h3>
              <form className="grid grid-cols-1 gap-4 text-left" onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">Nombre del insumo *</label>
                  <input
                    placeholder="Ingrese nombre del insumo"
                    value={formCrear.nombreInsumo}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorNombre ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, nombreInsumo: valor });
                      setErrorNombre(validarNombre(valor));
                    }}
                    onBlur={(e) => {
                      setErrorNombre(validarNombre(e.target.value));
                    }}
                  />
                  {errorNombre && (
                    <span className="text-red-500 text-xs mt-1">{errorNombre}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ingrese stock"
                    value={formCrear.stock}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorStock ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, stock: valor });
                      setErrorStock(validarStock(valor));
                    }}
                    onBlur={(e) => {
                      setErrorStock(validarStock(e.target.value));
                    }}
                    onKeyDown={(e) => {
                      if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {errorStock && (
                    <span className="text-red-500 text-xs mt-1">{errorStock}</span>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Crear insumo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenCreate(false);
                      resetCreateForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Editar */}
          <Modal open={openEditar} onClose={() => {
            setOpenEditar(false);
            setSelectedInsumo(null);
          }}>
            <div className="w-[90vw] max-w-[450px] p-4 sm:p-6 mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Editar insumo</h3>
              <form className="grid grid-cols-1 gap-4 text-left" onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">Nombre del insumo *</label>
                  <input
                    placeholder="Nombre del insumo"
                    value={formEditar.nombreInsumo}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFormEditar({ ...formEditar, nombreInsumo: e.target.value })}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Cantidad en stock"
                    value={formEditar.stock}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFormEditar({ ...formEditar, stock: e.target.value })}
                    onKeyDown={(e) => {
                      if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenEditar(false);
                      setSelectedInsumo(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Ver */}
          <Modal open={openVer} onClose={() => {
            setOpenVer(false);
            setSelectedInsumo(null);
          }}>
            <div className="w-[90vw] max-w-[450px] p-4 sm:p-6 mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ver insumo</h3>
              {selectedInsumo && (
                <div className="text-left space-y-3 text-gray-700">
                  <p>
                    <strong>ID:</strong> {getShortId(selectedInsumo.InsumoId || selectedInsumo.id)}
                    <span className="text-gray-500 text-sm ml-2">(completo: {selectedInsumo.InsumoId || selectedInsumo.id})</span>
                  </p>
                  <p>
                    <strong>Nombre:</strong> {selectedInsumo.Nombre || selectedInsumo.nombreInsumo}
                  </p>
                  <p>
                    <strong>Stock:</strong> {selectedInsumo.Stock || selectedInsumo.stock}
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  setOpenVer(false);
                  setSelectedInsumo(null);
                }}
                className="mt-6 bg-gray-200 px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </Modal>

          {/* Eliminar */}
          <Modal open={openEliminar} onClose={() => {
            setOpenEliminar(false);
            setSelectedInsumo(null);
          }}>
            <div className="w-[90vw] max-w-[400px] p-4 sm:p-6 mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Eliminar insumo</h3>
              {selectedInsumo && (
                <div className="mb-5 text-gray-600">
                  <p>¿Estás seguro de eliminar el insumo?</p>
                  <p className="mt-2 font-medium">
                    <strong>{selectedInsumo.Nombre || selectedInsumo.nombreInsumo}</strong> (ID: {getShortId(selectedInsumo.InsumoId || selectedInsumo.id)})
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setOpenEliminar(false);
                    setSelectedInsumo(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
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