import { Link } from "react-router-dom";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/modals/modal";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Diseño = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [campoFiltro, setCampoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorDescripcion, setErrorDescipcion] = useState("");


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
    }
  };

  const validarFormularioCategoria = (form) => {
    const errores = {};

    if (!form.nombreCategoria.trim()) {
      errores.nombreCategoria = "El nombre de la categoria es obligatorio";
    }else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(form.nombreCategoria)) {
      errores.nombreCategoria = "El nombre solo puede contener letras y espacios";
    }

    if(!form.descripcion.trim()){
      errores.descripcion = "La descripcion es obligatoria";
    }else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s.,-]+$/.test(form.Descripcion)) {
      errores.descripcion =
      "La descripcion solo puede contener letras y signos basicos";
    }

    return errores;
  }

  const handleCreate = async () => {

    const validaciones = validarFormularioCategoria(formCrear);
    if(Object.keys(validaciones).length > 9) {
      setErrores(validaciones)
      return;
    }
    
    try {
      await axios.post("http://localhost:3000/api/categorias", formCrear);

      toast.success("Categoría creada con éxito ");
      fetchCategorias();
      setFormCrear({ nombreCategoria: "", descripcion: "" });
      setOpenCreate(false);
    } catch (error) {
      toast.error("Error al crear la categoría ");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/categorias/${selectedCategoria.CategoriaId}`,
        formEditar
      );

      toast.success("Categoría actualizada con éxito ");
      fetchCategorias();
      setOpenEditar(false);
    } catch (error) {
      toast.error("Error al actualizar la categoría ");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/categorias/${selectedCategoria.CategoriaId}`
      );
      setOpenEliminar(false);
      fetchCategorias();
    } catch (err) {
      toast.error("Error al eliminar la categoria:", err);
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


  const categoriasFiltradas = categorias.filter((c) =>  {
    if (!busqueda) return true;
    if (campoFiltro === "id") {
      return c.CategoriaId.toString().includes(busqueda); 
    }

    if (campoFiltro === "nombre") {
      return c.Nombre.toLowerCase().includes(busqueda.toLowerCase());
    }

    return (
      c.CategoriaId.toString().includes(busqueda) ||
      c.Nombre.toLowerCase().includes(busqueda.toLowerCase))
  
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">
            Gestión  diseño
          </h1>

          {/* botón crear */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 ">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald"
              >
                <Plus size={18} /> Nuevo diseño
              </Link>

              <select value={campoFiltro}
              onChange={(e) => setCampoFiltro(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500  focus:border-transparent transition-all duration-200 min-w-[140px]"
              >
                <option value="">Filtrar por campo</option>
                <option value="id">ID</option>
                <option value="nombre">Nombre</option>
              </select>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar diseño"
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
                    Nombre diseño
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">
                    Descripcion
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoriasFiltradas.map((c) => (
                  <tr
                    key={c.CategoriaId}
                    className="hover:bg-slate-50 transition-colors duration-150 "
                  >
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">
                      {c.CategoriaId}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">
                      {c.Nombre}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">
                      {c.Descripcion}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Link
                          onClick={() => openEditarModal(c)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        >
                          <Edit size={16} />
                        </Link>
                        <Link
                          onClick={() => {
                            setSelectedCategoria(c);
                            setOpenVer(true);
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          onClick={() => {
                            setSelectedCategoria(c);
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

          {/* Modal Crear */}
          <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-6">
                Nuevo diseño
              </h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex flex-col">
                  <label>Nombre diseño</label>
                  <input
                    placeholder="Ingrese la categoria"
                    value={formCrear.nombreCategoria}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, nombreCategoria: e.target.value, });
                      const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                      if(!regex.test(valor)) {
                        setErrorNombre("El nombre solo puede contener letras y espacios");
                      }else if (valor.trim() === "") {
                        setErrorNombre("El nombre es obligatorio")
                      }else {
                        setErrorNombre("")
                      }
                    }}
                  />  
                  {errorNombre  && (
                    <p className="text-red-500 text-sm mt-1">{errorNombre}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label>Descripcion</label>
                  <input
                    placeholder="Ingrese descripcion"
                    value={formCrear.descripcion}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const valor = e.target.value;
                      setFormCrear({ ...formCrear, descripcion: e.target.value, });
                      const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                      if(!regex.test(valor)) {
                        setErrorDescipcion("la descripcion solo puede contener letras y espacios");
                      }else if (valor.trim() === "") {
                        setErrorDescipcion("la descipcion es obligatorio")
                      }else {
                        setErrorDescipcion("")
                      }

                    }}
                  />
                  {errorDescripcion && (
                    <p className="text-red-500 text-sm mt-1">{errorDescripcion}</p>
                  )}
                </div>
                <div className="col-span-2 flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
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
              <h3 className="text-lg font-black text-gray-800 mb-6">
                Editar diseño
              </h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex flex-col">
                  <label>Nombre categoria</label>
                  <input
                    placeholder="Ingrese la categoria"
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
                <div className="flex flex-col">
                  <label>Descripcion</label>
                  <input
                    placeholder="Ingrese descripcion"
                    value={formEditar.descripcion}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setFormEditar({
                        ...formEditar,
                        descripcion: e.target.value,
                      })
                    }
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

          {/* Modal Ver */}
          <Modal open={openVer} onClose={() => setOpenVer(false)}>
            <div className="w-[450px] p-6 mx-auto text-center">
              <h3 className="text-lg font-black text-gray-800 mb-6">
                Ver diseño
              </h3>
              {selectedCategoria && (
                <div className="text-left space-y-2">
                  <p>ID: {selectedCategoria.CategoriaId}</p>
                  <p>Nombre: {selectedCategoria.Nombre}</p>
                  <p>Descripcion: {selectedCategoria.Descripcion}</p>
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

          {/* Modal Eliminar */}
          <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
            <div className="w-[400px] p-6 mx-auto text-center ">
              <h3 className="text-lg font-black text-gray-800 mb-4">
                Eliminar diseño
              </h3>
              <p className="mb-6">¿Estás seguro de eliminar este diseño?</p>
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