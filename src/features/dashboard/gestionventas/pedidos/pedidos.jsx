import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, Edit, Plus, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Modal from "../../components/modals/modal";

const API_URL = `http://localhost:3000/api/pedidos-clientes`;
const API_DETALLE_URL = "http://localhost:3000/api/detalle-pedido-clientes";

export const PedidosClientes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [estadoActivo, setEstadoActivo] = useState({});
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);

  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);

  const [formCrear, setFormCrear] = useState({
    ClienteId: "",
    FechaRegistro: "",
    Total: 0,
    Estado: 1,
  });

  const [detalles, setDetalles] = useState([
    {
      ProductoServicioId: "",
      Cantidad: 1,
      Alto: "",
      Ancho: "",
      Descripcion: "",
      UrlImagen: "",
    },
  ]);

  const [formEditar, setFormEditar] = useState({
    PedidoClienteId: "",
    ClienteId: "",
    FechaRegistro: "",
    Total: 0,
    Estado: 1,
    detalle: [],
  });

  
  const fetchPedidos = async () => {
    try {
      const { data } = await axios.get(API_URL);
      const arr = Array.isArray(data) ? data : [];
      setPedidos(arr);

      const estados = {};
      arr.forEach((p) => {
        estados[p.PedidoClienteId] = Number(p.Estado) === 1 ? 1 : 0;
      });
      setEstadoActivo(estados);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);


  const pedidosFiltrados = pedidos.filter((p) => {
    if (!filtroCampo || !filtroText.trim()) return true;
    const valor = String(p[filtroCampo] || "").toLowerCase();
    return valor.includes(filtroText.toLowerCase());
  });


  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const añadirDetalle = () => {
    setDetalles((prev) => [
      ...prev,
      {
        ProductoServicioId: "",
        Cantidad: 1,
        Alto: "",
        Ancho: "",
        Descripcion: "",
        UrlImagen: "",
      },
    ]);
  };

  const eliminarDetalle = (index) => {
    if (detalles.length === 1) return;
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (index, campo, valor) => {
    setDetalles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [campo]: valor };
      return copy;
    });
  };

  const handleCreate = async () => {
    try {
      const payload = { ...formCrear, detalle: detalles };
      await axios.post(API_URL, payload);

      setOpenCreate(false);
      setFormCrear({ ClienteId: "", FechaRegistro: "", Total: 0, Estado: 1 });
      setDetalles([
        { ProductoServicioId: "", Cantidad: 1, Alto: "", Ancho: "", Descripcion: "", UrlImagen: "" },
      ]);
      fetchPedidos();
    } catch (err) {
      console.error("Error al crear pedido:", err);
    }
  };


  const handleEdit = async () => {
    try {
      const payload = {
        ClienteId: formEditar.ClienteId,
        FechaRegistro: formEditar.FechaRegistro,
        Total: formEditar.Total,
        Estado: formEditar.Estado,
        detalle: formEditar.detalle,
      };

      await axios.put(`${API_URL}/${formEditar.PedidoClienteId}`, payload);

      setOpenEditar(false);
      fetchPedidos();
    } catch (err) {
      console.error("Error al editar pedido:", err);
    }
  };


  const handleToggleEstado = async (idPedido, nuevoEstadoBoolean) => {
    const nuevoEstadoNum = nuevoEstadoBoolean ? 1 : 0;
    const pedidoActual = pedidos.find((p) => p.PedidoClienteId === idPedido);
    if (!pedidoActual) return;

    try {
      await axios.put(`${API_URL}/${idPedido}`, {
        ClienteId: pedidoActual.ClienteId,
        FechaRegistro: pedidoActual.FechaRegistro,
        Total: pedidoActual.Total,
        Estado: nuevoEstadoNum,
      });

      setEstadoActivo((prev) => ({ ...prev, [idPedido]: nuevoEstadoNum }));
      setPedidos((prev) =>
        prev.map((p) => (p.PedidoClienteId === idPedido ? { ...p, Estado: nuevoEstadoNum } : p))
      );
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const openVerModal = (p) => {
    setSelectedPedido(p);

    setFormEditar({
      PedidoClienteId: p.PedidoClienteId,
      ClienteId: p.ClienteId,
      FechaRegistro: p.FechaRegistro,
      Total: p.Total,
      Estado: p.Estado,
      detalle: p.detalle || [],
    });

    setOpenVer(true);
  };

 
  const openEliminarModal = (p) => {
    setSelectedPedido(p);
    setOpenEliminar(true);
  };

  const handleDelete = async () => {
    try {
      if (!selectedPedido) return;

      await axios.delete(`${API_URL}/${selectedPedido.PedidoClienteId}`);
      setOpenEliminar(false);
      fetchPedidos();
    } catch (err) {
      console.error("Error al eliminar pedido:", err);
    }
  };

  const renderModalForm = (type = "create") => {
    const isReadOnly = type === "ver";

    const formState = type === "create" ? formCrear : formEditar;
    const formSetter = type === "create" ? setFormCrear : setFormEditar;

    const detallesParaRender = type === "create" ? detalles : formState.detalle || [];

    return (
      <form className="flex flex-col gap-8 p-6 bg-white rounded-lg ">


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha de registro</label>
            <input
              type="date"
              readOnly={isReadOnly}
              value={formState.FechaRegistro}
              onChange={(e) => formSetter({ ...formState, FechaRegistro: e.target.value })}
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Total</label>
            <input
              type="number"
              readOnly={isReadOnly}
              value={formState.Total}
              onChange={(e) => formSetter({ ...formState, Total: Number(e.target.value) })}
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (type === "create") añadirDetalle();
                else
                  formSetter({
                    ...formState,
                    detalle: [
                      ...formState.detalle,
                      {
                        ProductoServicioId: "",
                        Cantidad: 1,
                        Alto: "",
                        Ancho: "",
                        Descripcion: "",
                        UrlImagen: "",
                      },
                    ],
                  });
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg"
            >
              <Plus size={15} /> Añadir detalle
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {detallesParaRender.map((d, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 border p-3 rounded">

              <div className="flex flex-col gap-2">
                <label>ProductoServicioId</label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={d.ProductoServicioId || ""}
                  onChange={(e) => {
                    if (type === "create") actualizarDetalle(index, "ProductoServicioId", e.target.value);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].ProductoServicioId = e.target.value;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Cantidad</label>
                <input
                  type="number"
                  readOnly={isReadOnly}
                  value={d.Cantidad ?? ""}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    if (type === "create") actualizarDetalle(index, "Cantidad", num);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].Cantidad = num;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Alto</label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={d.Alto || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === "create") actualizarDetalle(index, "Alto", val);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].Alto = val;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Ancho</label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={d.Ancho || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === "create") actualizarDetalle(index, "Ancho", val);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].Ancho = val;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Descripción</label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={d.Descripcion || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === "create") actualizarDetalle(index, "Descripcion", val);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].Descripcion = val;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>UrlImagen</label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={d.UrlImagen || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === "create") actualizarDetalle(index, "UrlImagen", val);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].UrlImagen = val;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded"
                />

                {d.UrlImagen && (
                  <img
                    src={d.UrlImagen}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded mt-1"
                  />
                )}
              </div>

              {!isReadOnly && (
                <div className="md:col-span-6 flex justify-end">
                  <Trash2
                    size={18}
                    className="text-red-600 cursor-pointer"
                    onClick={() => {
                      if (type === "create") eliminarDetalle(index);
                      else {
                        const copy = [...formState.detalle];
                        copy.splice(index, 1);
                        formSetter({ ...formState, detalle: copy });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* BOTONES ABAJO */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          {type === "create" && (
            <button
              type="button"
              onClick={handleCreate}
              className="flex-1 bg-green-500 text-white h-11 rounded"
            >
              Crear
            </button>
          )}

          {type === "editar" && (
            <button
              type="button"
              onClick={handleEdit}
              className="flex-1 bg-blue-500 text-white h-11 rounded"
            >
              Guardar cambios
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (type === "create") setOpenCreate(false);
              if (type === "editar") setOpenEditar(false);
              if (type === "ver") setOpenVer(false);
            }}
            className="flex-1 bg-gray-200 text-gray-700 h-11 rounded"
          >
            {type === "ver" ? "Cerrar" : "Cancelar"}
          </button>
        </div>
      </form>
    );
  };

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Pedidos</h1>

        {/* =================== FILTROS =================== */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4">

          <Link
            onClick={() => {
              setFormCrear({ ClienteId: "", FechaRegistro: "", Total: 0, Estado: 1 });
              setDetalles([
                { ProductoServicioId: "", Cantidad: 1, Alto: "", Ancho: "", Descripcion: "", UrlImagen: "" },
              ]);
              setOpenCreate(true);
            }}
            className="bg-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Nuevo pedido
          </Link>

          <select
            value={filtroCampo}
            onChange={(e) => setFiltroCampo(e.target.value)}
            className="border rounded-lg px-4 py-3 bg-white text-slate-700"
          >
            <option value="">Filtrar por Campo</option>
            <option value="PedidoClienteId">PedidoId</option>
            <option value="ClienteId">ClienteId</option>
            <option value="FechaRegistro">Fecha</option>
          </select>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar pedido"
              value={filtroText}
              onChange={(e) => setFiltroText(e.target.value)}
              className="border rounded-lg pl-10 pr-4 py-3 w-full"
            />
            <img
              src="/multimedia/lupa.png"
              alt="Buscar"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5"
            />
          </div>
        </div>


        <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
          <div className="w-[850px] max-h-[90vh] overflow-y-auto p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-6">Nuevo pedido</h3>
            {renderModalForm("create")}
          </div>
        </Modal>

        <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
          <div className="w-[850px] max-h-[90vh] overflow-y-auto p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-6">Editar pedido</h3>
            {renderModalForm("editar")}
          </div>
        </Modal>

        <Modal open={openVer} onClose={() => setOpenVer(false)}>
          <div className="w-[850px] max-h-[90vh] overflow-y-auto p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-6">Ver pedido</h3>
            {selectedPedido ? renderModalForm("ver") : <p>Cargando...</p>}
          </div>
        </Modal>

        <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
          <div className="w-[750px] max-h-[90vh] overflow-y-auto p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4">Eliminar pedido</h3>
            <p className="mb-6">¿Está seguro de eliminar el pedido?</p>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-red-500 text-white py-2 rounded"
                onClick={handleDelete}
              >
                Eliminar
              </button>
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded"
                onClick={() => setOpenEliminar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

        {/* =================== TABLA =================== */}
        <div className="bg-white rounded-xl shadow-sm border overflow-auto max-h-[600px]">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800 sticky top-0">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3 text-white text-left">Pedido ID</th>
                <th className="px-4 py-3 text-white text-left">Cliente ID</th>
                <th className="px-4 py-3 text-white text-left">Fecha Registro</th>
                <th className="px-4 py-3 text-white text-left">Total</th>
                <th className="px-4 py-3 text-white text-left">Estado</th>
                <th className="px-4 py-3 text-white text-left">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {pedidosFiltrados.map((pedido) => (
                <React.Fragment key={pedido.PedidoClienteId}>
                  <tr className="hover:bg-slate-50">

                    {/* Expandir */}
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => toggleExpand(pedido.PedidoClienteId)}>
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${
                            expandedRow === pedido.PedidoClienteId ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-4 px-6">{pedido.PedidoClienteId}</td>
                    <td className="py-4 px-6">{pedido.ClienteId}</td>
                    <td className="py-4 px-6">{pedido.FechaRegistro}</td>
                    <td className="py-4 px-6">S/ {Number(pedido.Total || 0).toFixed(2)}</td>

                    {/* Switch */}
                    <td className="py-4 px-6">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={Number(estadoActivo[pedido.PedidoClienteId]) === 1}
                          onChange={(e) =>
                            handleToggleEstado(pedido.PedidoClienteId, e.target.checked)
                          }
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all"></div>
                        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-6 transition-all"></span>
                      </label>
                    </td>

                    {/* ACCIONES */}
                    <td className="py-4 px-6">
                      <div className="flex gap-3">
                        <button onClick={() => openVerModal(pedido)}>
                          <Eye size={16} className="text-emerald-600" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedPedido(pedido);
                            setFormEditar({
                              PedidoClienteId: pedido.PedidoClienteId,
                              ClienteId: pedido.ClienteId,
                              FechaRegistro: pedido.FechaRegistro,
                              Total: pedido.Total,
                              Estado: pedido.Estado,
                              detalle: pedido.detalle || [],
                            });
                            setOpenEditar(true);
                          }}
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>

                        <button onClick={() => openEliminarModal(pedido)}>
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* FILA EXPANDIDA */}
                  {expandedRow === pedido.PedidoClienteId && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="py-3 px-6">
                        <div className="overflow-auto">
                          <table className="min-w-full text-sm border">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="py-2 px-4">DetallePedidoClienteId</th>
                                <th className="py-2 px-4">ProductoServicioId</th>
                                <th className="py-2 px-4">Cantidad</th>
                                <th className="py-2 px-4">Alto</th>
                                <th className="py-2 px-4">Ancho</th>
                                <th className="py-2 px-4">Descripción</th>
                                <th className="py-2 px-4">Imagen</th>
                                <th className="py-2 px-4">Acciones</th>
                              </tr>
                            </thead>

                            <tbody>
                              {(pedido.detalle || []).map((item) => (
                                <tr key={item.DetallePedidoClienteId}>
                                  <td className="py-2 px-4">{item.DetallePedidoClienteId}</td>
                                  <td className="py-2 px-4">{item.ProductoServicioId}</td>
                                  <td className="py-2 px-4">{item.Cantidad}</td>
                                  <td className="py-2 px-4">{item.Alto}</td>
                                  <td className="py-2 px-4">{item.Ancho}</td>
                                  <td className="py-2 px-4">{item.Descripcion}</td>
                                  <td className="py-2 px-4">
                                    {item.UrlImagen ? (
                                      <img
                                        src={item.UrlImagen}
                                        className="w-20 h-20 object-cover rounded"
                                      />
                                    ) : (
                                      "Sin imagen"
                                    )}
                                  </td>

                                  <td className="py-2 px-4 text-center">
                                    <button onClick={() => openVerModal(pedido)}>
                                      <Eye size={14} className="text-emerald-600" />
                                    </button>
                                  </td>
                                </tr>
                              ))}

                              {(pedido.detalle || []).length === 0 && (
                                <tr>
                                  <td colSpan={8} className="py-2 text-center text-gray-500">
                                    Sin detalles
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    No hay pedidos a mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
