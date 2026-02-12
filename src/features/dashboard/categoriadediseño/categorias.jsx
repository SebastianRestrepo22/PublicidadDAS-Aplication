import { Link } from "react-router-dom";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/modals/modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [campoFiltro, setCampoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorDescripcion, setErrorDescripcion] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);

  const [formCrear, setFormCrear] = useState({
    nombreCategoria: "",
    descripcion: "",
  });

  const [formEditar, setFormEditar] = useState({
    nombreCategoria: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/categorias");
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar categorias:", err);
      toast.error("Error al cargar las categorías");
    }
  };

  const resetCreateForm = () => {
    setFormCrear({ nombreCategoria: "", descripcion: "" });
    setErrorNombre("");
    setErrorDescripcion("");
  };

  const validarFormularioCategoria = (form) => {
    const errores = {};

    if (!form.nombreCategoria.trim()) {
      errores.nombreCategoria = "El nombre de la categoría es obligatorio";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(form.nombreCategoria)) {
      errores.nombreCategoria = "El nombre solo puede contener letras y espacios";
    }

    if (!form.descripcion.trim()) {
      errores.descripcion = "La descripción es obligatoria";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s.,-]+$/.test(form.descripcion)) {
      errores.descripcion = "La descripción solo puede contener letras y signos básicos";
    }

    return errores;
  };

  const handleCreate = async () => {
    const errores = validarFormularioCategoria(formCrear);
    if (Object.keys(errores).length > 0) {
      if (errores.nombreCategoria) setErrorNombre(errores.nombreCategoria);
      if (errores.descripcion) setErrorDescripcion(errores.descripcion);
      toast.error("Por favor corrige los errores del formulario");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/categorias", formCrear);
      toast.success("Categoría creada con éxito");
      fetchCategorias();
      setOpenCreate(false);
      resetCreateForm();
    } catch (error) {
      toast.error("Error al crear la categoría");
    }
  };

  const handleUpdate = async () => {
    const errores = validarFormularioCategoria(formEditar);
    if (Object.keys(errores).length > 0) {
      toast.error("Por favor corrige los errores del formulario");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/api/categorias/${selectedCategoria.CategoriaId}`,
        formEditar
      );
      toast.success("Categoría actualizada con éxito");
      fetchCategorias();
      setOpenEditar(false);
    } catch (error) {
      toast.error("Error al actualizar la categoría");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/categorias/${selectedCategoria.CategoriaId}`
      );
      toast.success("Categoría eliminada con éxito");
      setOpenEliminar(false);
      fetchCategorias();
    } catch (err) {
      toast.error("Error al eliminar la categoría");
    }
  };

  const openEditarModal = (c) => {
    setSelectedCategoria(c);
    setFormEditar({
      nombreCategoria: c.Nombre,
      descripcion: c.Descripcion,
    });
    setOpenEditar(true);
  };

  const categoriasFiltradas = categorias.filter((c) => {
    if (!busqueda) return true;
    if (campoFiltro === "id") {
      return c.CategoriaId.toString().includes(busqueda);
    }
    if (campoFiltro === "nombre") {
      return c.Nombre.toLowerCase().includes(busqueda.toLowerCase());
    }
    return (
      c.CategoriaId.toString().includes(busqueda) ||
      c.Nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
            Gestión de categorías
          </h1>

          {/* Controles de búsqueda y filtro */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <button
                onClick={() => {
                  resetCreateForm();
                  setOpenCreate(true);
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap text-sm sm:text-base"
              >
                <Plus size={18} /> Nueva categoria
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
                  <option value="Catgoriaid">Categoriaid</option>
                  <option value="nombre">Nombre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                  <tr>
                    <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-white uppercase tracking-wider w-24">
                      ID
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[180px]">
                      Nombre categoría
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[200px]">
                      Descripción
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-white uppercase tracking-wider w-32">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {categoriasFiltradas.length > 0 ? (
                    categoriasFiltradas.map((c) => (
                      <tr
                        key={c.CategoriaId}
                        className="hover:bg-slate-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-4 sm:px-6 text-sm font-medium text-slate-900 align-top">
                            {c.CategoriaId?.toString().substring(0, 3)}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-sm font-medium text-slate-900 align-top">
                          {c.Nombre}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-sm text-slate-700 align-top">
                          {c.Descripcion}
                        </td>
                        <td className="py-4 px-4 sm:px-6 align-top">
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => openEditarModal(c)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCategoria(c);
                                setOpenVer(true);
                              }}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                              title="Ver"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCategoria(c);
                                setOpenEliminar(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">
                        No se encontraron categorías
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Crear */}
          <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
            <div className="w-full max-w-md p-6 mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Nueva categoría
              </h3>
              <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre categoría
                  </label>
                  <input
                    placeholder="Ingrese el nombre de la categoría"
                    value={formCrear.nombreCategoria}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, nombreCategoria: valor });
                      if (!valor.trim()) {
                        setErrorNombre("El nombre es obligatorio");
                      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(valor)) {
                        setErrorNombre("El nombre solo puede contener letras y espacios");
                      } else {
                        setErrorNombre("");
                      }
                    }}
                  />
                  {errorNombre && (
                    <p className="text-red-500 text-xs mt-1">{errorNombre}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <input
                    placeholder="Ingrese la descripción"
                    value={formCrear.descripcion}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, descripcion: valor });
                      if (!valor.trim()) {
                        setErrorDescripcion("La descripción es obligatoria");
                      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s.,-]*$/.test(valor)) {
                        setErrorDescripcion("La descripción solo puede contener letras y signos básicos");
                      } else {
                        setErrorDescripcion("");
                      }
                    }}
                  />
                  {errorDescripcion && (
                    <p className="text-red-500 text-xs mt-1">{errorDescripcion}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenCreate(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Modal Editar */}
          <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
            <div className="w-full max-w-md p-6 mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Editar categoría
              </h3>
              <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre categoría
                  </label>
                  <input
                    placeholder="Ingrese el nombre de la categoría"
                    value={formEditar.nombreCategoria}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setFormEditar({
                        ...formEditar,
                        nombreCategoria: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <input
                    placeholder="Ingrese la descripción"
                    value={formEditar.descripcion}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setFormEditar({
                        ...formEditar,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenEditar(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Modal Ver */}
          <Modal open={openVer} onClose={() => setOpenVer(false)}>
            <div className="w-full max-w-md p-6 mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Ver categoría
              </h3>
              {selectedCategoria && (
                <div className="text-left space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID</p>
                    <p className="text-gray-800 font-mono">{selectedCategoria.CategoriaId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre</p>
                    <p className="text-gray-800">{selectedCategoria.Nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Descripción</p>
                    <p className="text-gray-800">{selectedCategoria.Descripcion}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setOpenVer(false)}
                className="mt-6 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </Modal>

          {/* Modal Eliminar */}
          <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
            <div className="w-full max-w-md p-6 mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Eliminar categoría
              </h3>
              {selectedCategoria && (
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">¿Estás seguro de eliminar la categoría?</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-medium text-red-800">{selectedCategoria.Nombre}</p>
                    <p className="text-sm text-red-600 mt-1">{selectedCategoria.Descripcion}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Eliminar
                </button>
                <button
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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