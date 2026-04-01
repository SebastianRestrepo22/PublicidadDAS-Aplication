import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { deleteDataproducto, GetDataproductos, postDataproductos, updateDataproductos, buscarProductos, cambiarEstadoProducto } from "./services/services.products.js";
import axios from "axios";
import { ConfirmProductoModal } from "./modals/ConfirmProductoModal.jsx";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "../components/paginacion/pagination.jsx";
import Modal from "../components/modals/modal.jsx";

// Importamos los componentes separados
import { ProductoForm } from "./components/ProductoForm.jsx";
import { ProductoView } from "./components/ProductoView.jsx";
import { ProductosTable } from "./components/ProductosTable.jsx";
import { CategoriaModal } from "./components/CategoriaModal.jsx";
import { getAllCategorias } from "../categoria/services/services.categoria.js";
import HelpModal from "../components/modals/HelpModal.jsx";

export const ProductosDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const mode = useMemo(() => {
    if (location.pathname === "/dashboard/producto/nuevo") return "create";
    if (id && location.pathname === `/dashboard/producto/${id}/editar`) return "edit";
    if (id && location.pathname === `/dashboard/producto/${id}`) return "view";
    return "list";
  }, [location.pathname, id]);

  const [open, setOpen] = useState(false);
    const helpVideos = [
      { key: "create", label: "Crear producto", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=14._Crear_producto_pmbww7" },
      { key: "status", label: "Cambiar el estado del producto", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=15._Cambio_de_estado_del_producto_si36zw" },
      { key: "update", label: "Editar producto", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=16._Editar_producto_pvknyb" },
      { key: "delete", label: "Eliminar producto", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=17._Eliminar_producto_hqclte" },
    ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado de loading para tabla y datos iniciales
  const [cargando, setCargando] = useState(true);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);

  const [values, setValues] = useState({
    ProductoId: "",
    Nombre: "",
    Descripcion: "",
    Imagen: "",
    Precio: "",
    Descuento: "",
    CategoriaId: "",
    UsaColores: "0",
    Stock: 0
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const [confirmEstadoModal, setConfirmEstadoModal] = useState({
    open: false,
    productoId: null,
    nuevoEstado: null,
    nombreProducto: ''
  });

  const [filtroEstado, setFiltroEstado] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [originalNombre, setOriginalNombre] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [editData, setEditData] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [imagenError, setImagenError] = useState('');
  const [openCategoriasModal, setOpenCategoriasModal] = useState(false);
  const [categoriaBusqueda, setCategoriaBusqueda] = useState("");
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');
  const [skipReload, setSkipReload] = useState(false);

const cargarProducto = async () => {
  if (mode !== "list") return;

  setCargando(true);
  try {
    let resultado;

    if (filtroCampo && filtroValor) {
      resultado = await buscarProductos(
        filtroCampo, 
        filtroValor, 
        currentPage, 
        itemsPerPage, 
        filtroEstado || null
      );
    } else {
      // Usar buscarProductos con un campo genérico para obtener todos
      // Esto asume que tu backend soporta búsqueda sin campo específico
      resultado = await buscarProductos(
        'nombre',  // Campo temporal
        '',        // Valor vacío para obtener todos
        currentPage, 
        itemsPerPage, 
        filtroEstado || null
      );
    }

    const data = resultado?.data && Array.isArray(resultado.data) ? resultado.data : [];
    const pagination = resultado?.pagination || {};

    setAllData(data);
    setPaginatedData(data);
    setTotalItems(pagination.totalItems || 0);
    setTotalPages(pagination.totalPages || 1);

    if (currentPage > (pagination.totalPages || 1) && (pagination.totalPages || 0) > 0) {
      setCurrentPage(pagination.totalPages);
    }
  } catch (error) {
    console.error("Error cargando productos:", error);
    toast.error("Error al cargar los productos");
    setAllData([]);
    setPaginatedData([]);
    setTotalItems(0);
    setTotalPages(1);
  } finally {
    setCargando(false);
  }
};

  useEffect(() => {
    const fetchCategoria = async () => {
      setCargandoCategorias(true);
      try {
        const categorias = await getAllCategorias();

        if (Array.isArray(categorias) && categorias.length > 0) {
          setCategorias(categorias);
          setCategoriasFiltradas(categorias);
        } else {
          console.warn("⚠️ No se encontraron categorías o respuesta vacía");
          setCategorias([]);
          setCategoriasFiltradas([]);
        }
      } catch (error) {
        console.error("❌ Error cargando categorías:", error);
        toast.error("Error al cargar las categorías");
        setCategorias([]);
        setCategoriasFiltradas([]);
      } finally {
        setCargandoCategorias(false);
      }
    };
    fetchCategoria();
  }, []);

  useEffect(() => {
    if (categoriaBusqueda.trim() === "") {
      setCategoriasFiltradas(categorias);
    } else {
      const filtradas = categorias.filter(categoria =>
        categoria.Nombre.toLowerCase().includes(categoriaBusqueda.toLowerCase()) ||
        categoria.CategoriaId.toLowerCase().includes(categoriaBusqueda.toLowerCase())
      );
      setCategoriasFiltradas(filtradas);
    }
  }, [categoriaBusqueda, categorias]);

  useEffect(() => {
    if (skipReload) {
      setSkipReload(false);
      return;
    }
    cargarProducto();
  }, [currentPage, itemsPerPage, filtroCampo, filtroValor, filtroEstado, mode]);

  useEffect(() => {
    if (filtroCampo && filtroValor) {
      setCurrentPage(1);
    }
  }, [filtroCampo, filtroValor]);

  useEffect(() => {
    if (mode === "view" || mode === "edit") {
      const cargarProducto = async () => {
        setCargando(true);
        try {
          const todos = await GetDataproductos();
          const resultados = todos?.data || [];
          const producto = resultados.find(p => p.ProductoId === id);

          if (producto) {
            setEditData(producto);

            const valoresIniciales = {
              ProductoId: producto.ProductoId,
              Nombre: producto.Nombre || "",
              Descripcion: producto.Descripcion || "",
              Imagen: producto.Imagen || "",
              Precio: producto.Precio || "",
              Descuento: producto.Descuento !== undefined && producto.Descuento !== null
                ? String(producto.Descuento)
                : "",
              CategoriaId: producto.CategoriaId || "",
              UsaColores: String(producto.UsaColores || "0"),
              Stock: producto.Stock || 0
            };

            setValues(valoresIniciales);
            setOriginalNombre(producto.Nombre);
            setNombreError('');
          } else {
            toast.error('Producto no encontrado');
            goToBackToList();
          }
        } catch (error) {
          console.error('Error cargando producto:', error);
          toast.error('Error al cargar el producto');
          goToBackToList();
        } finally {
          setCargando(false);
        }
      };

      cargarProducto();
    }
  }, [mode, id]);

  const goToBackToList = () => {
    navigate("/dashboard/producto");
    resetForm();
  };

  const goToCreate = () => {
    navigate("/dashboard/producto/nuevo");
    resetForm();
  };

  const goToView = (ProductoId) => {
    navigate(`/dashboard/producto/${ProductoId}`);
  };

  const goToEdit = (ProductoId) => {
    navigate(`/dashboard/producto/${ProductoId}/editar`);
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;

    if (name === "Stock") {
      setValues({
        ...values,
        [name]: value === "" ? 0 : parseInt(value) || 0
      });
      return;
    }

    if (name === "Descuento") {
      if (value === "" || (!isNaN(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
        setValues({
          ...values,
          [name]: value
        });
      }
      return;
    }

    if (name === "Precio") {
      setValues({
        ...values,
        [name]: value === "" ? "" : parseFloat(value)
      });
      return;
    }

    setValues({
      ...values,
      [name]: value
    });

    if (name === "Imagen") {
      validateImagen(value);
    }
  };

  const handleNombreBlur = async () => {
    if (!values.Nombre.trim()) return;
    if (values.Nombre === originalNombre) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/producto/validar-nombre`,
        { params: { Nombre: values.Nombre } }
      );

      setNombreError(res.data.exists ? 'Este nombre ya está registrado' : '');
    } catch (error) {
      console.error(error);
      setNombreError('No se pudo validar el nombre');
    }
  };

  const handleToggleEstado = (productoId, nuevoEstado) => {
    const producto = paginatedData.find(p => p.ProductoId === productoId);
    if (!producto) return;

    setConfirmEstadoModal({
      open: true,
      productoId,
      nuevoEstado,
      nombreProducto: producto.Nombre
    });
  };

  const handleConfirmToggleEstado = async () => {
    const { productoId, nuevoEstado } = confirmEstadoModal;

    try {
      const response = await cambiarEstadoProducto(productoId, nuevoEstado);

      if (response.status === 200) {
        toast.success(`Producto ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`);
        setSkipReload(true);
        const productoActualizado = response.data;

        setAllData(prevData =>
          prevData.map(p =>
            p.ProductoId === productoId ? productoActualizado : p
          )
        );

        setPaginatedData(prevData =>
          prevData.map(p =>
            p.ProductoId === productoId ? productoActualizado : p
          )
        );
      } else if (response.status === 400 && response.data?.message) {
        toast.error(response.data.message);
      } else {
        toast.error("No se pudo cambiar el estado");
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error(error.response?.data?.message || "Error al cambiar el estado");
    } finally {
      setConfirmEstadoModal({
        open: false,
        productoId: null,
        nuevoEstado: null,
        nombreProducto: ''
      });
    }
  };

  const resetForm = () => {
    setValues({
      ProductoId: "",
      Nombre: "",
      Descripcion: "",
      Imagen: "",
      Precio: "",
      Descuento: "",
      CategoriaId: "",
      UsaColores: "0",
      Stock: 0
    });
    setEditData(null);
    setSubmitted(false);
    setNombreError('');
    setIsSubmitting(false);
  };

  const abrirModalCategorias = () => {
    setOpenCategoriasModal(true);
    setCategoriaBusqueda("");
  };

  const seleccionarCategoria = (categoria) => {
    setValues({
      ...values,
      CategoriaId: categoria.CategoriaId
    });
    setOpenCategoriasModal(false);
    setCategoriaBusqueda("");
  };

  const obtenerNombreCategoria = (categoriaId) => {
    const categoria = categorias.find(c => c.CategoriaId === categoriaId);
    return categoria ? categoria.Nombre : "Seleccione la categoría";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setSubmitted(true);
    setIsSubmitting(true);

    const currentValues = { ...values };
    const currentUsaColores = parseInt(currentValues.UsaColores);

    const datosParaEnviar = {
      Nombre: currentValues.Nombre.trim(),
      Descripcion: currentValues.Descripcion.trim(),
      Imagen: currentValues.Imagen.trim(),
      Precio: parseFloat(currentValues.Precio),
      Descuento: currentValues.Descuento === "" ? 0 : parseFloat(currentValues.Descuento || 0),
      CategoriaId: currentValues.CategoriaId,
      UsaColores: currentUsaColores,
      Stock: currentUsaColores === 0 ? (parseInt(currentValues.Stock) || 0) : 0
    };

    // Validaciones...
    let hasErrors = false;
    if (!datosParaEnviar.Nombre) {
      hasErrors = true;
    }
    if (!datosParaEnviar.CategoriaId) {
      hasErrors = true;
    }
    if (!datosParaEnviar.Precio || datosParaEnviar.Precio <= 0) {
      hasErrors = true;
    }
    if (!datosParaEnviar.Imagen) {
      hasErrors = true;
    }

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "edit" && editData) {
        const response = await updateDataproductos(editData.ProductoId, datosParaEnviar);
        if (response.status === 200) {
          toast.success("Producto actualizado correctamente");
          setCurrentPage(1);
          await cargarProducto();
          goToBackToList();
        }
      } else if (mode === "create") {
        const response = await postDataproductos(datosParaEnviar);
        if (response.status === 201) {
          toast.success("Producto creado correctamente");
          setCurrentPage(1);
          await cargarProducto();
          goToBackToList();
        }
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      toast.error(error.response?.data?.message || "Error al procesar la solicitud");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await deleteDataproducto(id);

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        await cargarProducto();
        setOpenEliminar(false);
      } else {
        toast.error(response.data?.message || "No se pudo eliminar el producto");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error("Producto no encontrado");
      } else {
        toast.error("Error al eliminar el producto");
      }

      if (error.response?.status === 200 || error.response?.status === 201) {
        setOpenEliminar(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (producto) => {
    setEditData(producto);
    setOpenEliminar(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEditClick = (u) => {
    goToEdit(u.ProductoId);
  };

  const handleViewClick = (u) => {
    goToView(u.ProductoId);
  };

  const validateImagen = (imagen) => {
    if (!imagen.trim()) {
      setImagenError('Seleccione o ingrese una imagen');
      return false;
    } else if (imagen.length > 255) {
      setImagenError('La URL de la imagen es demasiado larga (máx. 255 caracteres)');
      return false;
    } else {
      setImagenError('');
      return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Gestión de productos
        </h1>

        {mode === "list" && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={goToCreate}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                <Plus size={18} /> Nuevo producto
              </button>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[150px]"
              >
                <option value="">Todos los estados</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  value={filtroValor}
                  onChange={(e) => setFiltroValor(e.target.value)}
                  type="text"
                  placeholder="Buscar producto"
                  className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
                />
              </div>

              <select
                value={filtroCampo}
                onChange={(e) => setFiltroCampo(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[180px]"
              >
                <option value="">Filtrar por campo</option>
                <option value="nombre">Nombre</option>
                <option value="descripcion">Descripción</option>
                <option value="precio">Precio</option>
                <option value="descuento">Descuento</option>
                <option value="stock">Stock</option>
                <option value="categoria">CategoriaId</option>
              </select>

              <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        >
          ?
        </button>
        <HelpModal
          isOpen={open}
          onClose={() => setOpen(false)}
          videos={helpVideos}
        />
            </div>

            <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
              <div className="w-[400px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
                <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar producto</h3>

                {editData && (
                  <div className="mb-4 text-left bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">Producto: {editData.Nombre}</p>
                    <p className="text-sm text-gray-600">ID: {editData.ProductoId}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Estado:
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${editData.Estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {editData.Estado}
                      </span>
                    </p>
                  </div>
                )}

                <p className="mb-6 text-gray-600">¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>

                <div className="flex gap-4">
                  <button
                    className={`flex-1 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium
                      ${isSubmitting 
                        ? 'bg-red-400 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600'} 
                      text-white`}
                    onClick={() => handleDelete(editData?.ProductoId)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Eliminando...
                      </>
                    ) : (
                      'Eliminar'
                    )}
                  </button>
                  <button
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
                    onClick={() => setOpenEliminar(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </Modal>

            <ConfirmProductoModal
              open={confirmEstadoModal.open}
              onClose={() => setConfirmEstadoModal({ open: false, productoId: null, nuevoEstado: null, nombreProducto: '' })}
              onConfirm={handleConfirmToggleEstado}
              title={`${confirmEstadoModal.nuevoEstado === 'Activo' ? 'Activar' : 'Desactivar'} Producto`}
              message={`¿Estás seguro de que deseas ${confirmEstadoModal.nuevoEstado === 'Activo' ? 'activar' : 'desactivar'} este producto?`}
              productoNombre={confirmEstadoModal.nombreProducto}
              type={confirmEstadoModal.nuevoEstado === 'Activo' ? 'info' : 'warning'}
              confirmText={confirmEstadoModal.nuevoEstado === 'Activo' ? 'Sí, activar' : 'Sí, desactivar'}
              cancelText="Cancelar"
            />

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {cargando ? (
                <div className="text-center py-12">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="mt-3 text-slate-600">Cargando productos...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <ProductosTable
                      data={paginatedData}
                      categorias={categorias}
                      onEdit={handleEditClick}
                      onView={handleViewClick}
                      onDelete={handleDeleteClick}
                      onToggleEstado={handleToggleEstado}
                    />
                  </div>

                  {paginatedData && paginatedData.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                      totalItems={totalItems}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}

        {mode === "create" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">Nuevo producto</h3>
            </div>
            <ProductoForm
              mode={mode}
              values={values}
              setValues={setValues}
              editData={editData}
              categorias={categorias}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitted={submitted}
              nombreError={nombreError}
              imagenError={imagenError}
              handleChanges={handleChanges}
              handleNombreBlur={handleNombreBlur}
              validateImagen={validateImagen}
              goToBackToList={goToBackToList}
              openCategoriasModal={openCategoriasModal}
              setOpenCategoriasModal={setOpenCategoriasModal}
              categoriaBusqueda={categoriaBusqueda}
              setCategoriaBusqueda={setCategoriaBusqueda}
              categoriasFiltradas={categoriasFiltradas}
              abrirModalCategorias={abrirModalCategorias}
              seleccionarCategoria={seleccionarCategoria}
              obtenerNombreCategoria={obtenerNombreCategoria}
              cargandoCategorias={cargandoCategorias}
            />
          </div>
        )}

        {mode === "view" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">
                Ver producto #{editData?.ProductoId || id}
              </h3>
            </div>
            {cargando ? (
              <div className="text-center py-12">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
                <p className="mt-3 text-slate-600">Cargando producto...</p>
              </div>
            ) : (
              <ProductoView
                editData={editData}
                categorias={categorias}
                goToEdit={() => goToEdit(editData?.ProductoId)}
                goToBackToList={goToBackToList}
              />
            )}
          </div>
        )}

        {mode === "edit" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">
                Editar producto #{editData?.ProductoId || id}
              </h3>
            </div>
            {cargando ? (
              <div className="text-center py-12">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
                <p className="mt-3 text-slate-600">Cargando producto...</p>
              </div>
            ) : (
              <ProductoForm
                mode={mode}
                values={values}
                setValues={setValues}
                editData={editData}
                categorias={categorias}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitted={submitted}
                nombreError={nombreError}
                imagenError={imagenError}
                handleChanges={handleChanges}
                handleNombreBlur={handleNombreBlur}
                validateImagen={validateImagen}
                goToBackToList={goToBackToList}
                openCategoriasModal={openCategoriasModal}
                setOpenCategoriasModal={setOpenCategoriasModal}
                categoriaBusqueda={categoriaBusqueda}
                setCategoriaBusqueda={setCategoriaBusqueda}
                categoriasFiltradas={categoriasFiltradas}
                abrirModalCategorias={abrirModalCategorias}
                seleccionarCategoria={seleccionarCategoria}
                obtenerNombreCategoria={obtenerNombreCategoria}
                cargandoCategorias={cargandoCategorias}
              />
            )}
          </div>
        )}

        <CategoriaModal
          open={openCategoriasModal}
          onClose={() => setOpenCategoriasModal(false)}
          categoriasFiltradas={categoriasFiltradas}
          categoriaBusqueda={categoriaBusqueda}
          setCategoriaBusqueda={setCategoriaBusqueda}
          seleccionarCategoria={seleccionarCategoria}
          selectedCategoriaId={values.CategoriaId}
          cargando={cargandoCategorias}
        />

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