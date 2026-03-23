import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";

// Servicios
import {
  getAllPedidosClientes,
  getDetallesByPedidoId,
  getAllProductos,
  getAllServicios,
  getAllColores,
  getAllClientes,
} from "./services/services.pedidosClientes";

// Componentes
import { OrderList } from "./OrderList";
import { OrderForm } from "./OrderForm";
import { OrderView } from "./OrderView";
import { OrderEdit } from "./OrderEdit";

// Helpers
import { generateTempId, calcularTotalDetalles } from "../pedidos/utils/pedidosHelpers";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const PedidosClientes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true); // Nuevo estado para el loading de la tabla

  // Catálogos
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [colores, setColores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [errores, setErrores] = useState([]);

  // Formulario de creación
  const [formCrear, setFormCrear] = useState({
    ClienteId: "",
    NombreCliente: "",
    FechaRegistro: getTodayDate(),
    Total: 0,
    Estado: "pendiente",
    MetodoPago: "transferencia",
    NombreRecibe: "",
    TelefonoEntrega: "",
    DireccionEntrega: "",
    Voucher: "",
    VoucherPreview: ""
  });

  const [detallesCrear, setDetallesCrear] = useState([{
    _tempId: generateTempId(),
    ProductoId: "",
    ServicioId: "",
    Cantidad: 1,
    Descripcion: "",
    UrlImagen: "",
    Precio: 0,
    ColorId: ""
  }]);

  const [tipoClienteCrear, setTipoClienteCrear] = useState('registrado');
  const [clienteWalkinCrear, setClienteWalkinCrear] = useState({
    Nombre: "",
    Telefono: "",
    Correo: ""
  });

  const [voucherFileCrear, setVoucherFileCrear] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Paginación
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  // Cargar catálogos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, s, c, cl] = await Promise.all([
          getAllProductos(),
          getAllServicios(),
          getAllColores(),
          getAllClientes()
        ]);

        setProductos(Array.isArray(p) ? p : []);
        setServicios(Array.isArray(s) ? s : []);
        setColores(Array.isArray(c) ? c : []);
        setClientes(Array.isArray(cl) ? cl : []);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
        toast.error("Error cargando datos iniciales");
      }
    };
    fetchData();
  }, []);

  // Calcular total
  useEffect(() => {
    if (viewMode === "create" || viewMode === "edit") {
      const total = calcularTotalDetalles(detallesCrear);
      setFormCrear(prev => ({ ...prev, Total: total }));
    }
  }, [detallesCrear, viewMode]);

  // Función para cargar pedidos con paginación
  const fetchPedidos = async (page = currentPage) => {
    setCargandoDatos(true); // Activar loading antes de cargar
    try {
      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage
      });

      if (filtroCampo && filtroText) {
        params.append('filtroCampo', filtroCampo);
        params.append('filtroValor', filtroText);
      }

      const response = await axios.get(`${API_URL}/api/pedidos-clientes?${params.toString()}`);

      const { data, pagination } = response.data;

      // Obtener detalles para cada pedido
      const conDetalles = await Promise.all(
        data.map(async (p) => {
          try {
            const det = await getDetallesByPedidoId(p.PedidoClienteId);
            return {
              ...p,
              detalle: Array.isArray(det)
                ? det.map(item => ({
                  ...item,
                  _tempId: item.DetallePedidoClienteId || generateTempId()
                }))
                : []
            };
          } catch {
            return { ...p, detalle: [] };
          }
        })
      );

      setPaginatedData(conDetalles);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);
      setCurrentPage(pagination.currentPage);

    } catch (err) {
      console.error("Error cargando pedidos:", err);
      toast.error("Error al cargar pedidos");
      setPaginatedData([]);
    } finally {
      setCargandoDatos(false); // Desactivar loading después de cargar
    }
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    fetchPedidos(1);
  }, []);

  // Cargar pedidos cuando cambian los filtros o paginación
  useEffect(() => {
    if (viewMode === "list") {
      fetchPedidos(1);
    }
  }, [filtroCampo, filtroText, itemsPerPage]);

  // Navegación
  const goToList = () => {
    setViewMode("list");
    setSelectedPedido(null);
    setErrores([]);
    fetchPedidos(1);
  };

  const goToCreate = () => {
    resetForm();
    setViewMode("create");
  };

  const goToView = async (pedido) => {
    try {
      const det = await getDetallesByPedidoId(pedido.PedidoClienteId);
      setSelectedPedido({
        ...pedido,
        detalle: Array.isArray(det)
          ? det.map(item => ({
            ...item,
            _tempId: item.DetallePedidoClienteId || generateTempId()
          }))
          : []
      });
      setViewMode("view");
    } catch {
      toast.error("Error al cargar detalles");
    }
  };

  // Función goToEdit
  const goToEdit = async (pedido) => {
    try {
      const det = await getDetallesByPedidoId(pedido.PedidoClienteId);

      const pedidoAEditar = {
        ...pedido,
        detalle: Array.isArray(det)
          ? det.map(item => ({
            ...item,
            _tempId: item.DetallePedidoClienteId || generateTempId(),
            tipo: item.ProductoId ? 'producto' : 'servicio',
            tipoStock: item.ColorId ? 'por_color' : 'general',
            ProductoNombre: item.ProductoNombre,
            ServicioNombre: item.ServicioNombre,
            ColorNombre: item.ColorNombre,
            ColorHex: item.ColorHex
          }))
          : []
      };

      setFormCrear({
        ClienteId: pedido.ClienteId || "",
        NombreCliente: pedido.NombreCliente || pedido.ClienteNombre || "",
        FechaRegistro: pedido.FechaRegistro?.split('T')[0] || getTodayDate(),
        Total: pedido.Total || 0,
        Estado: pedido.Estado || "pendiente",
        MetodoPago: pedido.MetodoPago || "transferencia",
        NombreRecibe: pedido.NombreRecibe || "",
        TelefonoEntrega: pedido.TelefonoEntrega || "",
        DireccionEntrega: pedido.DireccionEntrega || "",
        Voucher: pedido.Voucher || "",
        VoucherPreview: ""
      });

      setDetallesCrear(pedidoAEditar.detalle);
      setTipoClienteCrear(pedido.TipoCliente || 'registrado');

      if (pedido.TipoCliente === 'walkin') {
        setClienteWalkinCrear({
          Nombre: pedido.ClienteNombre || "",
          Telefono: pedido.ClienteTelefono || "",
          Correo: pedido.ClienteCorreo || ""
        });
      }

      setSelectedPedido(pedidoAEditar);
      setErrores([]);
      setViewMode("edit");

    } catch (error) {
      console.error('❌ Error al cargar para editar:', error);
      toast.error('Error al cargar el pedido para editar');
    }
  };

  const resetForm = () => {
    setFormCrear({
      ClienteId: "",
      NombreCliente: "",
      FechaRegistro: getTodayDate(),
      Total: 0,
      Estado: "pendiente",
      MetodoPago: "transferencia",
      NombreRecibe: "",
      TelefonoEntrega: "",
      DireccionEntrega: "",
      Voucher: "",
      VoucherPreview: ""
    });
    setDetallesCrear([{
      _tempId: generateTempId(),
      ProductoId: "",
      ServicioId: "",
      Cantidad: 1,
      Descripcion: "",
      UrlImagen: "",
      Precio: 0,
      ColorId: ""
    }]);
    setTipoClienteCrear('registrado');
    setClienteWalkinCrear({
      Nombre: "",
      Telefono: "",
      Correo: ""
    });
    setVoucherFileCrear(null);
    setErrores([]);
  };

  const handleCreate = async () => {
    const errs = [];
    if (!formCrear.FechaRegistro) errs.push("La fecha es obligatoria.");
    if (tipoClienteCrear === 'walkin' && !clienteWalkinCrear.Nombre) {
      errs.push("El nombre del cliente es obligatorio");
    }
    if (!detallesCrear?.length) errs.push("Agregue al menos un producto/servicio.");

    if (errs.length) {
      setErrores(errs);
      toast.error("Corrija los errores");
      return;
    }

    try {
      setUploading(true);

      const detallesLimpios = detallesCrear.map(d => {
        let precioLimpio = 0;
        if (d.Precio) {
          const precioStr = String(d.Precio).replace(/\./g, '').replace(',', '.');
          precioLimpio = parseFloat(precioStr) || 0;
        }

        return {
          ProductoId: d.ProductoId?.trim() || null,
          ServicioId: d.ServicioId?.trim() || null,
          Cantidad: Number(d.Cantidad) || 1,
          Descripcion: d.Descripcion || "",
          UrlImagen: d.UrlImagen || "",
          Precio: precioLimpio,
          ColorId: d.ColorId || null
        };
      });

      const pedidoCompleto = {
        ClienteId: tipoClienteCrear === 'registrado' ? formCrear.ClienteId?.trim() || null : null,
        FechaRegistro: formCrear.FechaRegistro,
        Total: Number(formCrear.Total) || 0,
        Estado: formCrear.Estado,
        MetodoPago: formCrear.MetodoPago,
        NombreRecibe: formCrear.MetodoPago === "contra_entrega" ? formCrear.NombreRecibe || null : null,
        TelefonoEntrega: formCrear.MetodoPago === "contra_entrega" ? formCrear.TelefonoEntrega || null : null,
        DireccionEntrega: formCrear.MetodoPago === "contra_entrega" ? formCrear.DireccionEntrega || null : null,
        TipoCliente: tipoClienteCrear,
        ClienteNombre: tipoClienteCrear === 'walkin' ? clienteWalkinCrear.Nombre || null : null,
        ClienteTelefono: tipoClienteCrear === 'walkin' ? clienteWalkinCrear.Telefono || null : null,
        ClienteCorreo: tipoClienteCrear === 'walkin' ? clienteWalkinCrear.Correo || null : null,
        detalle: detallesLimpios
      };

      const formData = new FormData();
      formData.append('pedido', JSON.stringify(pedidoCompleto));

      if (formCrear.MetodoPago === "transferencia" && voucherFileCrear) {
        formData.append('voucher', voucherFileCrear);
      }

      const response = await axios.post(`${API_URL}/api/pedidos-clientes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Pedido creado correctamente");
      goToList();

    } catch (err) {
      console.error('❌ Error:', err);
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (pedidoId) => {
    try {
      setUploading(true);

      const detallesLimpios = detallesCrear.map(d => {
        let precioLimpio = 0;
        if (d.Precio) {
          const precioStr = String(d.Precio).replace(/\./g, '').replace(',', '.');
          precioLimpio = parseFloat(precioStr) || 0;
        }

        return {
          DetallePedidoClienteId: d.DetallePedidoClienteId || null,
          ProductoId: d.ProductoId?.trim() || null,
          ServicioId: d.ServicioId?.trim() || null,
          Cantidad: Number(d.Cantidad) || 1,
          Descripcion: d.Descripcion || "",
          UrlImagen: d.UrlImagen || "",
          Precio: precioLimpio,
          ColorId: d.ColorId || null
        };
      });

      const pedidoActualizado = {
        ClienteId: tipoClienteCrear === 'registrado' ? formCrear.ClienteId?.trim() || null : null,
        FechaRegistro: formCrear.FechaRegistro,
        Total: Number(formCrear.Total) || 0,
        MetodoPago: formCrear.MetodoPago,
        NombreRecibe: formCrear.MetodoPago === "contra_entrega" ? formCrear.NombreRecibe || null : null,
        TelefonoEntrega: formCrear.MetodoPago === "contra_entrega" ? formCrear.TelefonoEntrega || null : null,
        DireccionEntrega: formCrear.MetodoPago === "contra_entrega" ? formCrear.DireccionEntrega || null : null,
        TipoCliente: tipoClienteCrear,
        ClienteNombre: tipoClienteCrear === 'walkin' ? clienteWalkinCrear.Nombre || null : null,
        ClienteTelefono: tipoClienteCrear === 'walkin' ? clienteWalkinCrear.Telefono || null : null,
        ClienteCorreo: tipoClienteCrear === 'walkin' ? clienteWalkinCrear.Correo || null : null,
        detalle: detallesLimpios
      };

      const response = await axios.put(
        `${API_URL}/api/pedidos-clientes/${pedidoId}`,
        pedidoActualizado,
        { headers: { 'Content-Type': 'application/json' } }
      );

      toast.success("Pedido actualizado correctamente");
      goToList();

    } catch (err) {
      console.error('❌ Error:', err);
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateEstado = async (estado, motivo = "") => {
    if (!selectedPedido) return;

    try {
      setUpdating(true);

      const payload = { Estado: estado };
      if (estado === 'cancelado' && motivo) {
        payload.motivo = motivo;
      }

      const response = await axios.put(
        `${API_URL}/api/pedidos-clientes/${selectedPedido.PedidoClienteId}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      setSelectedPedido(prev => ({
        ...prev,
        Estado: estado,
        MotivoCancelacion: estado === 'cancelado' ? motivo : prev.MotivoCancelacion
      }));

      toast.success(`Pedido ${estado === 'cancelado' ? 'cancelado' : 'actualizado'} correctamente`);
      await fetchPedidos(currentPage);

    } catch (err) {
      console.error('Error detallado:', err.response?.data || err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setUpdating(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPedidos(page);
  };

  const handleItemsPerPageChange = (newItems) => {
    setItemsPerPage(newItems);
    setCurrentPage(1);
    fetchPedidos(1);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltroCampo(campo);
    setFiltroText(valor);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Pedidos</h1>

        {viewMode === "list" && (
          <OrderList
            paginatedData={paginatedData}
            filtroText={filtroText}
            setFiltroText={(text) => handleFiltroChange(filtroCampo, text)}
            filtroCampo={filtroCampo}
            setFiltroCampo={(campo) => handleFiltroChange(campo, filtroText)}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            handlePageChange={handlePageChange}
            handleItemsPerPageChange={handleItemsPerPageChange}
            goToCreate={goToCreate}
            goToView={goToView}
            cargandoDatos={cargandoDatos} // Pasar estado de carga
          />
        )}

        {viewMode === "create" && (
          <OrderForm
            formCrear={formCrear}
            setFormCrear={setFormCrear}
            detallesCrear={detallesCrear}
            setDetallesCrear={setDetallesCrear}
            tipoClienteCrear={tipoClienteCrear}
            setTipoClienteCrear={setTipoClienteCrear}
            clienteWalkinCrear={clienteWalkinCrear}
            setClienteWalkinCrear={setClienteWalkinCrear}
            voucherFileCrear={voucherFileCrear}
            setVoucherFileCrear={setVoucherFileCrear}
            uploading={uploading}
            errores={errores}
            productos={productos}
            servicios={servicios}
            colores={colores}
            clientes={clientes}
            onBack={goToList}
            onCreate={handleCreate}
          />
        )}

        {viewMode === "edit" && selectedPedido && (
          <OrderEdit
            pedidoOriginal={selectedPedido}
            formCrear={formCrear}
            setFormCrear={setFormCrear}
            detallesCrear={detallesCrear}
            setDetallesCrear={setDetallesCrear}
            tipoClienteCrear={tipoClienteCrear}
            setTipoClienteCrear={setTipoClienteCrear}
            clienteWalkinCrear={clienteWalkinCrear}
            setClienteWalkinCrear={setClienteWalkinCrear}
            uploading={uploading}
            errores={errores}
            productos={productos}
            servicios={servicios}
            colores={colores}
            clientes={clientes}
            onBack={goToList}
            onUpdate={handleUpdate}
          />
        )}

        {viewMode === "view" && selectedPedido && (
          <OrderView
            selectedPedido={selectedPedido}
            productos={productos}
            servicios={servicios}
            colores={colores}
            onBack={goToList}
            onEdit={goToEdit}
            onUpdateEstado={handleUpdateEstado}
            userRole="admin"
          />
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};