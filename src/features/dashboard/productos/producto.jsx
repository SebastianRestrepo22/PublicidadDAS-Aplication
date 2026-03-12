import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { deleteDataproducto, GetDataproductos, postDataproductos, updateDataproductos, buscarProductos, getColores, updateColoresProducto, getColoresProducto, cambiarEstadoProducto } from "./services/services.products.js";
import axios from "axios";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "../components/paginacion/pagination.jsx";
import Modal from "../components/modals/modal.jsx";

// Importamos los componentes separados
import { ProductoForm } from "./components/ProductoForm.jsx";
import { ProductoView } from "./components/ProductoView.jsx";
import { ProductosTable } from "./components/ProductosTable.jsx";
import { ProductoColoresModal } from "./components/ProductoColoresModal.jsx";
import { CategoriaModal } from "./components/CategoriaModal.jsx";
import { getAllCategorias } from "../categoria/services/services.categoria.js";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const [filtroEstado, setFiltroEstado] = useState('');
  const [colores, setColores] = useState([]);
  const [coloresConStock, setColoresConStock] = useState([]);
  const [openColores, setOpenColores] = useState(false);
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

  const cargarProducto = async () => {
  if (mode !== "list") return;

  try {
    let resultado;

    console.log('Cargando productos - Filtros:', {
      filtroCampo,
      filtroValor,
      filtroEstado,
      currentPage,
      itemsPerPage
    });

    if (filtroCampo && filtroValor) {
      resultado = await buscarProductos(filtroCampo, filtroValor, currentPage, itemsPerPage, filtroEstado || null);
    } else {
      resultado = await GetDataproductos(filtroEstado === 'Activo', currentPage, itemsPerPage);
    }

    console.log('Resultado de la API:', resultado);

    const data = resultado?.data && Array.isArray(resultado.data) ? resultado.data : [];
    const pagination = resultado?.pagination || {};

    console.log('Datos procesados:', data);
    console.log('Paginación:', pagination);

    setAllData(data);
    setPaginatedData(data);
    setTotalItems(pagination.totalItems || 0);
    setTotalPages(pagination.totalPages || 1);

    if (currentPage > (pagination.totalPages || 1) && (pagination.totalPages || 0) > 0) {
      setCurrentPage(pagination.totalPages);
    }
  } catch (error) {
    console.error("Error cargando productos:", error);
    setAllData([]);
    setPaginatedData([]);
    setTotalItems(0);
    setTotalPages(1);
  }
};

  useEffect(() => {
    const fetchCategoria = async () => {
      const data = await getAllCategorias();
      if (data?.data) {
        setCategorias(data.data);
        setCategoriasFiltradas(data.data);
      }
    };
    fetchCategoria();
  }, []);

  useEffect(() => {
    if (values.UsaColores === "0") {
      // Limpia colores y resetea Stock a 0
      setColoresConStock([]);
    }

    if (values.UsaColores === "1") {
      // Cuando activa colores, resetea Stock general
      setValues(prev => ({
        ...prev,
        Stock: 0
      }));
    }
  }, [values.UsaColores]);

  useEffect(() => {
    getColores()
      .then(setColores)
      .catch(console.error);
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
        try {
          const todos = await GetDataproductos();
          const resultados = todos?.data || [];
          const producto = resultados.find(p => p.ProductoId === id);

          if (producto) {
            console.log('Producto cargado para edición:', producto);
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
              Stock: producto.UsaColores === 0 ? (producto.Stock || 0) : 0
            };

            setValues(valoresIniciales);
            setOriginalNombre(producto.Nombre);
            setNombreError('');

            // Limpia colores primero
            setColoresConStock([]);

            // Luego carga SOLO si UsaColores === 1
            if (producto.UsaColores === 1) {
              try {
                const coloresData = await getColoresProducto(id);
                setColoresConStock(coloresData.map(c => ({
                  ColorId: c.ColorId,
                  Stock: c.Stock || 0,
                  Nombre: c.Nombre,
                  Hex: c.Hex
                })));
              } catch (error) {
                console.error('Error cargando colores:', error);
                // No seteamos error, solo dejamos vacío
              }
            }
          } else {
            toast.error('Producto no encontrado');
            goToBackToList();
          }
        } catch (error) {
          console.error('Error cargando producto:', error);
          toast.error('Error al cargar el producto');
          goToBackToList();
        }
      };

      cargarProducto();
    }
  }, [mode, id]);

  useEffect(() => {
    if (mode === "create") {
      setColoresConStock([]);
    }
  }, [mode]);

  const goToBackToList = () => {
    navigate("/dashboard/producto");
    resetForm();
    setColoresConStock([]);
  };

  const goToCreate = () => {
    navigate("/dashboard/producto/nuevo");
    resetForm();
    setColoresConStock([]);
  };

  const goToView = (ProductoId) => {
    navigate(`/dashboard/producto/${ProductoId}`);
  };

  const goToEdit = (ProductoId) => {
    navigate(`/dashboard/producto/${ProductoId}/editar`);
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;

    // Para Stock, maneja especialmente
    if (name === "Stock") {
      setValues({
        ...values,
        [name]: value === "" ? 0 : parseInt(value) || 0
      });
      return;
    }

    // Para Descuento, permite string vacío
    if (name === "Descuento") {
      // Permite string vacío o números válidos
      if (value === "" || (!isNaN(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
        setValues({
          ...values,
          [name]: value
        });
      }
      return;
    }

    // Para Precio, convierte a número
    if (name === "Precio") {
      setValues({
        ...values,
        [name]: value === "" ? "" : parseFloat(value)
      });
      return;
    }

    // Para otros campos
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
        `http://localhost:3000/producto/validar-nombre`,
        { params: { Nombre: values.Nombre } }
      );

      setNombreError(res.data.exists ? 'Este nombre ya está registrado' : '');
    } catch (error) {
      console.error(error);
      setNombreError('No se pudo validar el nombre');
    }
  };

  const handleToggleEstado = async (productoId, nuevoEstado) => {
    try {
      const response = await cambiarEstadoProducto(productoId, nuevoEstado);

      if (response.status === 200) {
        toast.success(`Producto ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`);

        //  recargar con paginación backend
        await cargarProducto();

      } else if (response.status === 400 && response.data?.message) {
        toast.error(response.data.message);
      } else {
        toast.error("No se pudo cambiar el estado");
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);

      if (error.response?.status === 400 && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al cambiar el estado");
      }
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
    setColoresConStock([]);
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

    console.log('========================================');
    console.log('🚀 DEBUG - handleSubmit:');
    console.log('values.UsaColores (string):', values.UsaColores);
    console.log('currentUsaColores (number):', currentUsaColores);
    console.log('values.Stock:', values.Stock);
    console.log('coloresConStock:', coloresConStock);
    console.log('========================================');

    // Si usa colores, debe tener al menos un color asignado
    if (currentUsaColores === 1 && coloresConStock.length === 0) {
      toast.error("Debes asignar al menos un color con stock");
      setIsSubmitting(false);
      return;
    }

    // Si no usa colores, no debe tener colores asignados
    if (currentUsaColores === 0 && coloresConStock.length > 0) {
      toast.error("Este producto no usa sistema de colores. Elimina los colores asignados");
      setIsSubmitting(false);
      return;
    }

    // Prepara los datos CORRECTAMENTE
    const datosParaEnviar = {
      Nombre: currentValues.Nombre.trim(),
      Descripcion: currentValues.Descripcion.trim(),
      Imagen: currentValues.Imagen.trim(),
      Precio: parseFloat(currentValues.Precio),
      // Si Descuento está vacío, envía 0, si no, parsea el número
      Descuento: currentValues.Descuento === "" ? 0 : parseFloat(currentValues.Descuento || 0),
      CategoriaId: currentValues.CategoriaId,
      UsaColores: currentUsaColores,
      Stock: currentUsaColores === 0 ?
        (parseInt(currentValues.Stock) || 0) :
        null
    };

    let hasErrors = false;

    if (!values.Nombre.trim()) {
      setNombreError("El nombre es requerido");
      hasErrors = true;
    }

    if (!values.Precio || parseFloat(values.Precio) <= 0) {
      hasErrors = true;
    }

    if (!values.CategoriaId) {
      hasErrors = true;
    }

    if (!values.Imagen.trim()) {
      setImagenError('Seleccione o ingrese una imagen');
      hasErrors = true;
    } else if (values.Imagen.length > 255) {
      setImagenError('La URL de la imagen es demasiado larga (máx. 255 caracteres)');
      hasErrors = true;
    } else {
      setImagenError('');
    }

    if (!values.Descripcion.trim()) {
      hasErrors = true;
    }

    if (values.Descuento && (parseFloat(values.Descuento) < 0 || parseFloat(values.Descuento) > 100)) {
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
          if (currentUsaColores === 0) {
            try {
              await updateColoresProducto(editData.ProductoId, []);
            } catch (error) {
              console.error('Error eliminando colores:', error);
            }
          } else if (currentUsaColores === 1 && coloresConStock.length > 0) {
            await updateColoresProducto(editData.ProductoId, coloresConStock);
          }

          toast.success("Producto actualizado correctamente");

          setCurrentPage(1);
          await cargarProducto();

          goToBackToList();
        }
      } else if (mode === "create") {
        const response = await postDataproductos(datosParaEnviar);
        if (response.status === 201) {
          const nuevoProductoId = response.data.ProductoId;

          // Solo guardar colores si UsaColores = 1
          if (currentUsaColores === 1 && coloresConStock.length > 0) {
            await updateColoresProducto(nuevoProductoId, coloresConStock);
          }

          toast.success("Producto creado correctamente");

          setCurrentPage(1);        // Volver a página 1 para mostrar el nuevo producto
          await cargarProducto();   // Recargar lista con paginación backend

          goToBackToList();         // Navegar al listado
        }

      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);

      if (error.response) {
        if (error.response.status === 400) {
          toast.error("Datos inválidos. Verifique la información");
        } else if (error.response.status === 409) {
          toast.error("Ya existe un producto con ese nombre");
        } else {
          toast.error(`Error del servidor: ${error.response.status}`);
        }
      } else if (error.request) {
        toast.error("No se pudo conectar con el servidor");
      } else {
        toast.error("Error al procesar la solicitud");
      }

      setIsSubmitting(false);
    }
  };

  // En ProductosDashboard.jsx, reemplaza la función handleDelete completa:

  const handleDelete = async (id) => {
    try {
      const response = await deleteDataproducto(id);

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);

        // 🔥 ÚNICA LÍNEA NECESARIA: recargar con paginación backend
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

      // No cerrar modal si hubo error
      if (error.response?.status === 200 || error.response?.status === 201) {
        setOpenEliminar(false);
      }
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

              {/* Filtro de estado */}
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
                    className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    onClick={() => handleDelete(editData.ProductoId)}
                  >
                    Eliminar
                  </button>
                  <button
                    className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
                    onClick={() => setOpenEliminar(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </Modal>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
              colores={colores}
              coloresConStock={coloresConStock}
              setColoresConStock={setColoresConStock}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitted={submitted}
              nombreError={nombreError}
              imagenError={imagenError}
              handleChanges={handleChanges}
              handleNombreBlur={handleNombreBlur}
              validateImagen={validateImagen}
              goToBackToList={goToBackToList}
              openColores={openColores}
              setOpenColores={setOpenColores}
              openCategoriasModal={openCategoriasModal}
              setOpenCategoriasModal={setOpenCategoriasModal}
              categoriaBusqueda={categoriaBusqueda}
              setCategoriaBusqueda={setCategoriaBusqueda}
              categoriasFiltradas={categoriasFiltradas}
              abrirModalCategorias={abrirModalCategorias}
              seleccionarCategoria={seleccionarCategoria}
              obtenerNombreCategoria={obtenerNombreCategoria}
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
            <ProductoView
              editData={editData}
              categorias={categorias}
              coloresConStock={coloresConStock}
              goToEdit={() => goToEdit(editData.ProductoId)}
              goToBackToList={goToBackToList}
            />
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
            <ProductoForm
              mode={mode}
              values={values}
              setValues={setValues}
              editData={editData}
              categorias={categorias}
              colores={colores}
              coloresConStock={coloresConStock}
              setColoresConStock={setColoresConStock}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitted={submitted}
              nombreError={nombreError}
              imagenError={imagenError}
              handleChanges={handleChanges}
              handleNombreBlur={handleNombreBlur}
              validateImagen={validateImagen}
              goToBackToList={goToBackToList}
              openColores={openColores}
              setOpenColores={setOpenColores}
              openCategoriasModal={openCategoriasModal}
              setOpenCategoriasModal={setOpenCategoriasModal}
              categoriaBusqueda={categoriaBusqueda}
              setCategoriaBusqueda={setCategoriaBusqueda}
              categoriasFiltradas={categoriasFiltradas}
              abrirModalCategorias={abrirModalCategorias}
              seleccionarCategoria={seleccionarCategoria}
              obtenerNombreCategoria={obtenerNombreCategoria}
            />
          </div>
        )}

        <ProductoColoresModal
          open={openColores}
          onClose={() => setOpenColores(false)}
          colores={colores}
          coloresConStock={coloresConStock}
          setColoresConStock={setColoresConStock}
        />

        <CategoriaModal
          open={openCategoriasModal}
          onClose={() => setOpenCategoriasModal(false)}
          categoriasFiltradas={categoriasFiltradas}
          categoriaBusqueda={categoriaBusqueda}
          setCategoriaBusqueda={setCategoriaBusqueda}
          seleccionarCategoria={seleccionarCategoria}
          selectedCategoriaId={values.CategoriaId}
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