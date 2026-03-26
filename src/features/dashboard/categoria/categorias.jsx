import { Link } from "react-router-dom";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../components/modals/modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "../components/paginacion/pagination.jsx";
import { useCategorias } from "./hook/useCategorias.js";

export const Categorias = () => {
  const {
    paginatedData,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    formData,
    editData,
    filtroCampo,
    filtroValor,

    // Estados de error
    submitted,
    nombreError,
    descripcionError,
    nombreDuplicado,
    verificandoNombre,
    originalNombre,

    setCurrentPage,
    setItemsPerPage,
    setFormData,
    setEditData,
    setFiltroCampo,
    setFiltroValor,
    setSubmitted,
    setNombreError,
    setDescripcionError,
    setOriginalNombre,

    // Funciones
    cargarCategorias,
    handleSubmit,
    handleDelete,
    verificarNombreDuplicado,
    resetFormErrors,
    resetForm
  } = useCategorias();

  // Solo estados para controlar la apertura de modales
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Simular carga de datos inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setCargandoDatos(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    resetForm();
    setOpenCreate(true);
  };

  const openEditarModal = (categoria) => {
    console.log("🔍 Abriendo modal de editar con:", categoria);

    resetFormErrors();
    setEditData(categoria);
    setFormData({
      nombreCategoria: categoria.Nombre || "",
      descripcion: categoria.Descripcion || ""
    });
    setOriginalNombre(categoria.Nombre);
    setOpenEditar(true);
  };

  const openVerModal = (categoria) => {
    setEditData(categoria);
    setOpenVer(true);
  };

  const openEliminarModal = (categoria) => {
    setEditData(categoria);
    setOpenEliminar(true);
  };

  const handleCloseModal = () => {
    setOpenCreate(false);
    setOpenEditar(false);
    setOpenVer(false);
    setOpenEliminar(false);
    resetForm();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await handleSubmit(e);
    if (success) {
      handleCloseModal();
    }
    setLoading(false);
  };

  const handleDeleteConfirm = async () => {
    if (!editData?.CategoriaId) return;
    setLoading(true);
    const success = await handleDelete(editData.CategoriaId);
    if (success) {
      setOpenEliminar(false);
    }
    setLoading(false);
  };

  // Filtrar localmente solo para la UI
  const categoriasFiltradas = paginatedData.filter((c) => {
    if (!busqueda) return true;
    return (
      c.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.Descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-[90rem] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
            Gestión de categorías
          </h1>

          {/* Controles de búsqueda y filtro */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                <Plus size={18} /> Nueva categoria
              </button>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="border border-slate-300 rounded-lg pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 text-sm sm:text-base"
                />
              </div>

              <div className="flex gap-2 items-center">
                <select
                  value={filtroCampo}
                  onChange={(e) => {
                    setFiltroCampo(e.target.value);
                    if (!e.target.value) setFiltroValor("");
                  }}
                  className="border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-sm sm:text-base"
                >
                  <option value="">Filtrar por campo</option>
                  <option value="id">ID</option>
                  <option value="nombre">Nombre</option>
                  <option value="descripcion">Descripción</option>
                </select>

                {filtroCampo && (
                  <input
                    type="text"
                    placeholder={`Buscar por ${filtroCampo}...`}
                    value={filtroValor}
                    onChange={(e) => setFiltroValor(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2.5 sm:py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] text-sm sm:text-base"
                  />
                )}
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
                  {cargandoDatos ? (
                    <tr>
                      <td colSpan="4" className="py-12">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                          <p className="text-slate-600 text-base font-medium">Cargando categorías...</p>
                        </div>
                      </td>
                    </tr>
                  ) : categoriasFiltradas.length > 0 ? (
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
                              onClick={() => openVerModal(c)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                              title="Ver"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => openEliminarModal(c)}
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

            {!cargandoDatos && totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>

          {/* ========== MODAL CREAR ========== */}
          <Modal open={openCreate} onClose={handleCloseModal}>
            <div className="w-full max-w-2xl p-6 mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Nueva categoría
              </h3>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre categoría <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ingrese el nombre de la categoría"
                      value={formData.nombreCategoria}
                      className={`w-full h-12 px-4 border ${nombreDuplicado || nombreError ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      onChange={async (e) => {
                        const valor = e.target.value;
                        setFormData({ ...formData, nombreCategoria: valor });

                        if (valor.trim().length >= 2) {
                          await verificarNombreDuplicado(valor);
                        } else {
                          setNombreDuplicado(false);
                        }
                      }}
                    />
                    {verificandoNombre && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  {nombreError && (
                    <p className="text-red-500 text-xs mt-1">{nombreError}</p>
                  )}
                  {nombreDuplicado && !nombreError && (
                    <p className="text-red-500 text-xs mt-1">⚠️ Ya existe una categoría con este nombre</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Ingrese la descripción"
                    value={formData.descripcion}
                    rows={4}
                    className={`w-full px-4 py-3 border ${descripcionError ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                    onChange={(e) => {
                      setFormData({ ...formData, descripcion: e.target.value });
                      if (e.target.value.trim()) {
                        setDescripcionError("");
                      }
                    }}
                  />
                  {descripcionError && (
                    <p className="text-red-500 text-xs mt-1">{descripcionError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || nombreDuplicado || verificandoNombre}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creando..." : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={loading}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* ========== MODAL EDITAR ========== */}
          <Modal open={openEditar} onClose={handleCloseModal}>
            <div className="w-full max-w-2xl p-6 mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Editar categoría
              </h3>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre categoría <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ingrese el nombre de la categoría"
                      value={formData.nombreCategoria}
                      className={`w-full h-12 px-4 border ${nombreDuplicado || nombreError ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      onChange={async (e) => {
                        const valor = e.target.value;
                        setFormData({ ...formData, nombreCategoria: valor });

                        if (valor.trim().length >= 2 && editData?.CategoriaId) {
                          await verificarNombreDuplicado(valor, editData.CategoriaId);
                        } else {
                          setNombreDuplicado(false);
                        }
                      }}
                    />
                    {verificandoNombre && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  {nombreError && (
                    <p className="text-red-500 text-xs mt-1">{nombreError}</p>
                  )}
                  {nombreDuplicado && !nombreError && (
                    <p className="text-red-500 text-xs mt-1">⚠️ Ya existe otra categoría con este nombre</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Ingrese la descripción"
                    value={formData.descripcion}
                    rows={4}
                    className={`w-full px-4 py-3 border ${descripcionError ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                    onChange={(e) => {
                      setFormData({ ...formData, descripcion: e.target.value });
                      if (e.target.value.trim()) {
                        setDescripcionError("");
                      }
                    }}
                  />
                  {descripcionError && (
                    <p className="text-red-500 text-xs mt-1">{descripcionError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || nombreDuplicado || verificandoNombre}
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={loading}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* ========== MODAL VER CATEGORÍA ========== */}
          <Modal open={openVer} onClose={handleCloseModal}>
            <div className="w-full max-w-md p-6 mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Ver categoría
              </h3>

              {editData && (
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-black-800">Nombre categoría</p>
                    <p className="text-gray-800 mt-1">{editData.Nombre || "N/A"}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-black-800">Descripción</p>
                    <p className="text-gray-800 mt-1">{editData.Descripcion || "Sin descripción"}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-black-800">ID de categoría</p>
                    <p className="text-gray-600 text-sm mt-1 break-all">{editData.CategoriaId}</p>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-gray-400 text-black py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </Modal>

          {/* ========== MODAL ELIMINAR ========== */}
          <Modal open={openEliminar} onClose={handleCloseModal}>
            <div className="w-full max-w-md p-6 mx-auto text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                ¿Eliminar categoría?
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                La categoría <span className="font-semibold">{editData?.Nombre}</span> será eliminada permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </button>
                <button
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm disabled:opacity-50"
                  onClick={handleCloseModal}
                  disabled={loading}
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