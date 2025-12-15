import { Link } from "react-router-dom";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../../components/modals/modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "./services/services.proveedores";

// Función auxiliar para obtener las primeras 3 letras o dígitos
const getShortId = (id) => {
  const str = String(id);
  return str.length > 3 ? str.substring(0, 3) : str;
};

// Validaciones
const validateForm = (form, isEditing = false) => {
  const errors = {};

  if (!form.nombreProveedor || form.nombreProveedor.trim().length < 2) {
    errors.nombreProveedor = "El nombre es obligatorio y debe tener al menos 2 caracteres.";
  }

  const phoneRegex = /^[0-9]{7,15}$/;
  if (!form.telefono || !phoneRegex.test(form.telefono)) {
    errors.telefono = "El teléfono debe contener entre 7 y 15 dígitos numéricos.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.correo || !emailRegex.test(form.correo)) {
    errors.correo = "Ingrese un correo electrónico válido.";
  }

  if (!form.direccion || form.direccion.trim().length < 5) {
    errors.direccion = "La dirección es obligatoria y debe tener al menos 5 caracteres.";
  }

  return errors;
};

export const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [estadoActivos, setEstadoActivo] = useState({});
  const [selectedProveedor, setSelectedProveedor] = useState(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");

  const [formCrear, setFormCrear] = useState({
    nombreProveedor: "",
    telefono: "",
    correo: "",
    direccion: "",
    estado: 1,
  });

  const [formEditar, setFormEditar] = useState({
    nombreProveedor: "",
    telefono: "",
    correo: "",
    direccion: "",
    estado: 1,
  });

  const [errorsCrear, setErrorsCrear] = useState({});
  const [errorsEditar, setErrorsEditar] = useState({});

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const data = await getAllProveedores();
      setProveedores(data);

      const estados = {};
      data.forEach((p) => {
        const val = Number(p.Estado) === 1 ? 1 : 0;
        estados[p.ProveedorId] = val;
      });
      setEstadoActivo(estados);
    } catch (err) {
      toast.error("Error al cargar proveedores: " + (err.message || err));
    }
  };

  const proveedoresFiltrados = proveedores.filter((p) => {
    if (!filtroCampo || !filtroText.trim()) return true;
    const valor = String(p[filtroCampo] || "").toLowerCase();
    return valor.includes(filtroText.toLowerCase());
  });

  const handleCreate = async () => {
    const errors = validateForm(formCrear);
    if (Object.keys(errors).length > 0) {
      setErrorsCrear(errors);
      toast.error("Por favor corrige los errores en el formulario.");
      return;
    }
    setErrorsCrear({});
    try {
      await createProveedor(formCrear); // 👈
      setOpenCreate(false);
      setFormCrear({
        nombreProveedor: "",
        telefono: "",
        correo: "",
        direccion: "",
        estado: 1,
      });
      fetchProveedores();
      toast.success("Proveedor creado exitosamente");
    } catch (err) {
      toast.error("Error al crear proveedor: " + (err.message || err));
    }
  };

  const handleUpdate = async () => {
    const errors = validateForm(formEditar);
    if (Object.keys(errors).length > 0) {
      setErrorsEditar(errors);
      toast.error("Por favor corrige los errores en el formulario.");
      return;
    }
    setErrorsEditar({});
    try {
      await updateProveedor(selectedProveedor.ProveedorId, formEditar); // 
      setOpenEditar(false);
      fetchProveedores();
      toast.success("Proveedor actualizado exitosamente");
    } catch (err) {
      toast.error("Error al actualizar proveedor: " + (err.message || err));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProveedor(selectedProveedor.ProveedorId); // 
      setOpenEliminar(false);
      setSelectedProveedor(null);
      fetchProveedores();
      toast.success("Proveedor eliminado correctamente");
    } catch (err) {
      toast.error("Error al eliminar el proveedor: " + (err.message || err));
    }
  };

  const openEditarModal = (p) => {
    setSelectedProveedor(p);
    setFormEditar({
      nombreProveedor: p.NombreProveedor,
      telefono: p.Telefono,
      correo: p.Correo,
      direccion: p.Direccion,
      estado: Number(p.Estado) === 1 ? 1 : 0,
    });
    setErrorsEditar({});
    setOpenEditar(true);
  };

  const toggleEstado = async (idProveedor, estadoNuevoBoolean) => {
    const nuevoEstadoNum = estadoNuevoBoolean ? 1 : 0;
    const provActual = proveedores.find(p => p.ProveedorId === idProveedor);
    if (!provActual) {
      toast.error("Proveedor no encontrado");
      return;
    }

    try {
      await updateProveedor(idProveedor, {
        nombreProveedor: provActual.NombreProveedor,
        telefono: provActual.Telefono,
        correo: provActual.Correo,
        direccion: provActual.Direccion,
        estado: nuevoEstadoNum
      });

      setEstadoActivo((prev) => ({ ...prev, [idProveedor]: nuevoEstadoNum }));
      setProveedores((prev) =>
        prev.map((p) =>
          p.ProveedorId === idProveedor ? { ...p, Estado: nuevoEstadoNum } : p
        )
      );
      toast.success("Estado actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar estado: " + (error.message || error));
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">
            Gestión de proveedores
          </h1>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus size={18} /> Nuevo proveedor
              </button>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={filtroText}
                  onChange={(e) => setFiltroText(e.target.value)}
                  placeholder="Buscar proveedor"
                  className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
                />
              </div>

              <div className="flex gap-2 items-center">
                <select
                  value={filtroCampo}
                  onChange={(e) => setFiltroCampo(e.target.value)}
                  className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700"
                >
                  <option value="">Filtrar por campo</option>
                  <option value="ProveedorId">ID</option>
                  <option value="NombreProveedor">Nombre</option>
                  <option value="Correo">Correo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Nombre Empresa</th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Teléfono</th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Correo Electrónico</th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Dirección</th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Estado</th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proveedoresFiltrados.map((p) => (
                  <tr key={p.ProveedorId} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">
                      {getShortId(p.ProveedorId)}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{p.NombreProveedor}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{p.Telefono}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{p.Correo}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{p.Direccion}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">
                      <label className="inline-flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            id={`switch-${p.ProveedorId}`}
                            type="checkbox"
                            className="sr-only peer"
                            checked={estadoActivos[p.ProveedorId] === 1}
                            onChange={(e) => toggleEstado(p.ProveedorId, e.target.checked)}
                          />
                          <div className="w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="ml-3 text-sm text-slate-700">
                          {estadoActivos[p.ProveedorId] === 1}
                        </span>
                      </label>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditarModal(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProveedor(p);
                            setOpenVer(true);
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProveedor(p);
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

          {/* Modal Crear */}
          <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-4">Nuevo proveedor</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    placeholder="Nombre del proveedor"
                    value={formCrear.nombreProveedor}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorsCrear.nombreProveedor ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => setFormCrear({ ...formCrear, nombreProveedor: e.target.value })}
                  />
                  {errorsCrear.nombreProveedor && <span className="text-red-500 text-xs mt-1">{errorsCrear.nombreProveedor}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Teléfono *</label>
                  <input
                    placeholder="Ej: 3001234567"
                    value={formCrear.telefono}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorsCrear.telefono ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value.replace(/\D/g, "") })}
                  />
                  {errorsCrear.telefono && <span className="text-red-500 text-xs mt-1">{errorsCrear.telefono}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Correo *</label>
                  <input
                    type="email"
                    placeholder="proveedor@ejemplo.com"
                    value={formCrear.correo}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorsCrear.correo ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => setFormCrear({ ...formCrear, correo: e.target.value })}
                  />
                  {errorsCrear.correo && <span className="text-red-500 text-xs mt-1">{errorsCrear.correo}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Dirección *</label>
                  <input
                    placeholder="Dirección completa"
                    value={formCrear.direccion}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorsCrear.direccion ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => setFormCrear({ ...formCrear, direccion: e.target.value })}
                  />
                  {errorsCrear.direccion && <span className="text-red-500 text-xs mt-1">{errorsCrear.direccion}</span>}
                </div>
                <div className="col-span-2 flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Crear
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

          {/* Modal Editar */}
          <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-4">Editar proveedor</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    value={formEditar.nombreProveedor}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorsEditar.nombreProveedor ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => setFormEditar({ ...formEditar, nombreProveedor: e.target.value })}
                  />
                  {errorsEditar.nombreProveedor && <span className="text-red-500 text-xs mt-1">{errorsEditar.nombreProveedor}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Teléfono *</label>
                  <input
                    value={formEditar.telefono}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorsEditar.telefono ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value.replace(/\D/g, "") })}
                  />
                  {errorsEditar.telefono && <span className="text-red-500 text-xs mt-1">{errorsEditar.telefono}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Correo *</label>
                  <input
                    type="email"
                    value={formEditar.correo}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorsEditar.correo ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => setFormEditar({ ...formEditar, correo: e.target.value })}
                  />
                  {errorsEditar.correo && <span className="text-red-500 text-xs mt-1">{errorsEditar.correo}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Dirección *</label>
                  <input
                    value={formEditar.direccion}
                    className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorsEditar.direccion ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    onChange={(e) => setFormEditar({ ...formEditar, direccion: e.target.value })}
                  />
                  {errorsEditar.direccion && <span className="text-red-500 text-xs mt-1">{errorsEditar.direccion}</span>}
                </div>
                <div className="col-span-2 flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

          {/* Modal Ver */}
          <Modal open={openVer} onClose={() => setOpenVer(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-4">Ver proveedor</h3>
              {selectedProveedor && (
                <div className="text-left space-y-2 text-gray-700">
                  <p><strong>ID:</strong> {getShortId(selectedProveedor.ProveedorId)}</p>
                  <p><strong>Nombre:</strong> {selectedProveedor.NombreProveedor}</p>
                  <p><strong>Teléfono:</strong> {selectedProveedor.Telefono}</p>
                  <p><strong>Correo:</strong> {selectedProveedor.Correo}</p>
                  <p><strong>Dirección:</strong> {selectedProveedor.Direccion}</p>
                </div>
              )}
              <button
                onClick={() => setOpenVer(false)}
                className="mt-6 bg-gray-200 px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </Modal>

          {/* Modal Eliminar */}
          <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
            <div className="w-[400px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-3">Eliminar proveedor</h3>
              {selectedProveedor && (
                <p className="mb-5 text-gray-600">
                  ¿Estás seguro de eliminar a <strong>{selectedProveedor.NombreProveedor}</strong>?
                </p>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setOpenEliminar(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>
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
    </div>
  );
};