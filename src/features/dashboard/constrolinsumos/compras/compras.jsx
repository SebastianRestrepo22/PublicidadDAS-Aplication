import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye, Trash2, ChevronDown } from "lucide-react";
import Modal from "../../components/modals/modal";
import axios from "axios";

const API_URL = `http://localhost:3000/api/compras`;

export const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [estadoActivo, setEstadoActivo] = useState({});
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [expandeRow, setExpandedRow] = useState(null);
  const [selectedCompra, setSelectedCompra] = useState(null);

  const [formCrear, setFormCrear] = useState({
    ProveedorId: "",
    Total: 0,
    FechaRegistro: "",
    Estado: 1,
  });

  //dinami
  const [detalles, setDetalles] = useState([
    { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: "", Descripcion: "" }
  ]);

  const fetchCompras = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/compras`);

      const comprasconDetalles = await Promise.all(
        data.map(async (compra) => {
          try {
            const { data: detalles } = await axios.get(
              `http://localhost:3000/api/detalle/compra/${compra.CompraId}`
            );
            return { ...compra, detalle: detalles};
          }catch {
            return { ...compra, detalle: [] };
          }
        })
      )
      setCompras(data);

      const estados = {};
      comprasconDetalles.forEach((c) => {
        estados[c.CompraId] = Number(c.Estado) === 1 ? 1 : 0;
      });

      setEstadoActivo(estados);
    } catch (err) {
      console.error("Error al cargar compras:", err);
    }
  };

  const comprasFiltradas = compras.filter((c) => {
    if (!filtroCampo || !filtroText.trim()) return true;
    const valor = String(c[filtroCampo] || "").toLowerCase();
    return valor.includes(filtroText.toLowerCase());
  });

  useEffect(() => {
    fetchCompras();
  }, []);

  const toggleExpand = (id) => {
    setExpandedRow(expandeRow === id ? null : id);
  };

  const añadirDetalle = () => {
    setDetalles([
      ...detalles,
      { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: "", Descripcion: "" }
    ]);
  };

  const eliminarDetalle = (index) => {
    if (detalles.length === 1) return;
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detalles];
    nuevos[index][campo] = valor;
    setDetalles(nuevos);
  };

  const handleCreate = async () => {
    try {
      await axios.post(API_URL, {
        ...formCrear,
        detalle: detalles,
      });

      setOpenCreate(false);
      setFormCrear({ ProveedorId: "", Total: 0, FechaRegistro: "", Estado: 1 });
      setDetalles([
        { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: "", Descripcion: "" }
      ]);

      fetchCompras();
    } catch (err) {
      console.error("Error al crear compra:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/${selectedCompra.CompraId}`, formEditar);
      setOpenEditar(false);
      fetchCompras();
    } catch (err) {
      console.error("Error al actualizar compra:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedCompra.CompraId}`);
      setOpenEliminar(false);
      fetchCompras();
    } catch (err) {
      console.error("Error al eliminar compras:", err);
    }
  };

  const openEditarModal = (c) => {
    setSelectedCompra(c);
    setOpenEditar(true);
  };

  const handleToggleEstado = async (idCompra, nuevoEstadoBoolean) => {
    const nuevoEstadoNum = nuevoEstadoBoolean ? 1 : 0;
    const compraActual = compras.find((c) => c.CompraId === idCompra);
    if (!compraActual) return;

    try {
      await axios.put(`${API_URL}/${idCompra}`, {
        ProveedorId: compraActual.ProveedorId,
        Total: compraActual.Total,
        FechaRegistro: compraActual.FechaRegistro,
        Estado: nuevoEstadoNum,
      });

      setEstadoActivo((prev) => ({ ...prev, [idCompra]: nuevoEstadoNum }));

      setCompras((prev) =>
        prev.map((c) =>
          c.CompraId === idCompra ? { ...c, Estado: nuevoEstadoNum } : c
        )
      );
    } catch (err) {
      console.error(" Error al actualizar estado", err);
    }
  };

  const renderModalForm = (type = "create") => {
    const isReadOnly = type === "ver";

    return (
      <form className="flex flex-col gap-8 p-6 bg-white rounded-lg ">
        {/* MASTER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Proveedor ID</label>
            <input
              type="text"
              placeholder="P001"
              readOnly={isReadOnly}
              value={formCrear.ProveedorId}
              onChange={(e) =>
                setFormCrear({ ...formCrear, ProveedorId: e.target.value })
              }
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha de registro</label>
            <input
              type="date"
              readOnly={isReadOnly}
              value={formCrear.FechaRegistro}
              onChange={(e) =>
                setFormCrear({ ...formCrear, FechaRegistro: e.target.value })
              }
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Total</label>
            <input
              type="number"
              readOnly={isReadOnly}
              value={formCrear.Total}
              onChange={(e) =>
                setFormCrear({ ...formCrear, Total: Number(e.target.value) })
              }
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>
        </div>

        {/* BOTÓN AÑADIR DETALLE */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={añadirDetalle}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} /> Añadir detalle
          </button>
        </div>

        {/* DETALLES DINÁMICO */}
        {(detalles ?? []).map((d, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-3 border rounded-lg bg-gray-100"
          >
            {[
              "TipoDetalle",
              "ProductoServicioId",
              "InsumoId",
              "Cantidad",
              "Descripcion",
            ].map((campo, i) => (
              <div key={i} className="flex flex-col">
                <label>{campo}</label>
                <input
                  type={campo === "Cantidad" ? "number" : "text"}
                  value={d[campo]}
                  onChange={(e) =>
                    actualizarDetalle(index, campo, e.target.value)
                  }
                  className="border rounded px-2"
                />
              </div>
            ))}

            <div className="flex items-center justify-center">
              <Trash2
                size={20}
                onClick={() => eliminarDetalle(index)}
                className="text-red-600 cursor-pointer hover:text-red-800"
              />
            </div>
          </div>
        ))}

        {/* BOTONES */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          {type === "create" && (
            <button
              type="button"
              onClick={handleCreate}
              className="flex-1 h-11 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Crear
            </button>
          )}

          <button
            type="button"
            className="flex-1 h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={() => setOpenCreate(false)}
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Compras</h1>

        {/* BARRA DE ACCIONES */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Link
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 bg-green-800 text-white px-6 py-3 rounded-lg"
          >
            <Plus size={18} /> Nueva compra
          </Link>

          <select className="border rounded-lg px-4 py-3 bg-white">
            <option value="">Filtrar por campo</option>
            <option value="CompraId">CompraID</option>
            <option value="ProveedorId">ProveedorID</option>
            <option value="FechaRegistro">Fecha</option>
          </select>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar compra"
              className="border rounded-lg pl-10 pr-4 py-3 w-full"
            />
            <img
              src="/public/multimedia/lupa.png"
              alt="Buscar"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
          </div>
        </div>

        {/* MODALES */}
        <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
          <div className="w-[750px] max-h[90px] overflow-y-auto p-6 mx-auto text-center rounded-xl">
            <h3 className="text-lg font-black text-gray-800 mb-6">Nueva compra</h3>
            {renderModalForm("create")}
          </div>
        </Modal>

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto max-h-[600px] w-full">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 text-left text-white">Compra ID</th>
                <th className="px-4 py-3 text-left text-white">Proveedor ID</th>
                <th className="px-4 py-3 text-left text-white">Fecha Registro</th>
                <th className="px-4 py-3 text-center text-white">Total</th>
                <th className="px-4 py-3 text-center text-white">Estado</th>
                <th className="px-4 py-3 text-center text-white">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {compras.map((compra) => (
                <React.Fragment key={compra.CompraId}>
                  <tr className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => toggleExpand(compra.CompraId)}>
                        <ChevronDown
                          size={18}
                          className={`transform transition-transform ${
                            expandeRow === compra.CompraId ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-4 px-6">{compra.CompraId}</td>
                    <td className="py-4 px-6">{compra.ProveedorId}</td>
                    <td className="py-4 px-6">{compra.FechaRegistro}</td>
                    <td className="py-4 px-6 text-center">${compra.Total}</td>

                    <td className="py-4 px-6 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={compra.Estado}
                          onChange={(e) =>
                            handleToggleEstado(compra.CompraId, e.target.checked)
                          }
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all"></div>
                        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-6"></span>
                      </label>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-3">
                        <Link onClick={() => setOpenEliminar(true)}>
                          <Trash2 size={16} className="text-red-600 hover:text-red-800" />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  {/* DETALLE */}
                  {expandeRow === compra.CompraId && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="py-3 px-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm border">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="py-2 px-4">DetalleCompraId</th>
                                <th className="py-2 px-4">TipoDetalle</th>
                                <th className="py-2 px-4">ProductoServicioId</th>
                                <th className="py-2 px-4">InsumoId</th>
                                <th className="py-2 px-4">Cantidad</th>
                                <th className="py-2 px-4">Descripcion</th>
                                <th className="py-2 px-4 text-center">Acciones</th>
                              </tr>
                            </thead>

                            <tbody>
                              {(compra.detalle ?? []).map((item) => (
                                <tr key={item.DetalleCompraId}>
                                  <td className="py-2 px-4">{item.DetalleCompraId}</td>
                                  <td className="py-2 px-4">{item.TipoDetalle}</td>
                                  <td className="py-2 px-4">{item.ProductoServicioId}</td>
                                  <td className="py-2 px-4">{item.InsumoId}</td>
                                  <td className="py-2 px-4">{item.Cantidad}</td>
                                  <td className="py-2 px-4">{item.Descripcion}</td>

                                  <td className="py-2 px-4 text-center">
                                    <div className="flex justify-center gap-2">
                                      <Link onClick={() => setOpenVer(true)}>
                                        <Eye size={14} className="text-emerald-600 hover:text-emerald-800" />
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
