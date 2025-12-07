import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import Modal from "../../components/modals/modal";

export const Ventas = () => {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEditar, setOpenEditar] = useState(false);
    const [openVer, setOpenVer] = useState(false);
    const [openEliminar, setOpenEliminar] = useState(false);

    // Datos de ejemplo
    const ventas = [
        {
            id: 1,
            cedula: "1001",
            nombre: "Litografía Central",
            fecha: "2025-09-01",
            metodo: "Efectivo",
            total: 250,
            estado: "Activo",
            detalle: [
                {
                    id: "P001",
                    nombre: "Tarjetas de presentación",
                    tipo: "Producto",
                    descripcion: "Impresas full color",
                    cantidad: 100,
                    alto: "9 cm",
                    ancho: "5 cm",
                    descuento: "0%",
                    url: "/public/img/tarjetas.png"
                },
                {
                    id: "P002",
                    nombre: "Afiches A3",
                    tipo: "Producto",
                    descripcion: "Papel couché brillante",
                    cantidad: 50,
                    alto: "42 cm",
                    ancho: "29.7 cm",
                    descuento: "5%",
                    url: "/public/img/afiche.png"
                }
            ]
        }
    ];

    const renderModalForm = (type = "create") => {
        const isReadOnly = type === "ver";
        const buttonLabel = type === "create" ? "Crear" : type === "editar" ? "Editar" : "Cerrar";

        return (
            <form className="flex flex-col gap-6 p-4 bg-white rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                    <div className="flex flex-col gap-2"><label className="font-medium">Venta ID</label><input type="text" placeholder="1" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Cedula ID</label><input type="text" placeholder="1001" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Nombre</label><input type="text" placeholder="Litografía Central" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2"><label className="font-medium">Fecha de registro venta</label><input type="date" placeholder="2025-09-01" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Método de pago</label><input type="text" placeholder="Efectivo" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>

                <div className="flex justify-end"><Link className="inline-flex h-10 items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"><Plus size={15} /> Añadir item</Link></div>

                <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                    <div className="flex flex-col gap-2"><label className="font-medium">ID</label><input type="text" placeholder="Ingrese el id" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Nombre</label><input type="text" placeholder="Ingrese el nombre" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Tipo</label><input type="text" placeholder="Ingrese el tipo" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Descripción</label><input type="text" placeholder="Ingrese la descripcion" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Cantidad</label><input type="text" placeholder="Ingrese la cantidad" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Alto</label><input type="text" placeholder="Ingrese el alto" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Ancho</label><input type="text" placeholder="Ingrese el ancho" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex flex-col gap-2"><label className="font-medium">Descuento</label><input type="text" placeholder="5%" readOnly={isReadOnly} className="w-full h-10 px-3 border border-gray-300 rounded bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-4 items-center">
                    {type !== "ver" && <button className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors">{buttonLabel}</button>}
                    <button type="button" className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors" onClick={() => { if (type === "create") setOpenCreate(false); else if (type === "editar") setOpenEditar(false); else if (type === "ver") setOpenVer(false); }}>{type === "ver" ? "Cerrar" : "Cancelar"}</button>
                    <h1 className="font-bold text-lg">Total: 30000</h1>
                </div>
            </form>

        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de ventas</h1>

                {/* Barra de acciones */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Link
                        onClick={() => setOpenCreate(true)}
                        className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                        <Plus size={18} /> Nueva venta
                    </Link>

                    <select className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[180px]">
                        <option value="">Filtrar por campo</option>
                        <option value="id">VentaID</option>
                        <option value="cedula">Cedula ID</option>
                        <option value="nombre">Nombre</option>
                        <option value="fecha">Fecha de registro venta</option>
                        <option value="metodo">Metodo de pago</option>
                        <option value="total">Total</option>
                        <option value="estado">Estado</option>
                    </select>

                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar venta"
                            className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
                        />
                        <img
                            src="/public/multimedia/lupa.png"
                            alt="Buscar"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        />
                    </div>
                </div>

                {/* Modales */}
                <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
                    <div className="w-[750px] p-6 mx-auto text-center">
                        <h3 className="text-lg font-black text-gray-800 mb-6">Nueva venta</h3>
                        {renderModalForm("create")}
                    </div>
                </Modal>

                <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
                    <div className="w-[750px] p-6 mx-auto text-center">
                        <h3 className="text-lg font-black text-gray-800 mb-6">Editar venta</h3>
                        {renderModalForm("editar")}
                    </div>
                </Modal>

                <Modal open={openVer} onClose={() => setOpenVer(false)}>
                    <div className="w-[750px] p-6 mx-auto text-center">
                        <h3 className="text-lg font-black text-gray-800 mb-6">Ver venta</h3>
                        {renderModalForm("ver")}
                    </div>
                </Modal>

                <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
                    <div className="w-[400px] p-6 mx-auto text-center">
                        <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar venta</h3>
                        <p className="mb-6">¿Está seguro de eliminar esta venta?</p>
                        <div className="flex gap-4">
                            <button className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors">Eliminar</button>
                            <button
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors"
                                onClick={() => setOpenEliminar(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Tabla principal con scroll vertical y horizontal */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto max-h-[600px]">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                            <tr>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">VentaID</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">Cedula ID</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">Nombre</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">Fecha</th>
                                <th className="py-4 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider">Metodo</th>
                                <th className="py-4 px-6 text-center text-sm font-semibold text-white uppercase tracking-wider">Total</th>
                                <th className="py-4 px-6 text-center text-sm font-semibold text-white uppercase tracking-wider">Estado</th>
                                <th className="py-4 px-6 text-center text-sm font-semibold text-white uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ventas.map((venta) => (
                                <React.Fragment key={venta.id}>
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{venta.id}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{venta.cedula}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{venta.nombre}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{venta.fecha}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{venta.metodo}</td>
                                        <td className="py-4 px-6 text-center text-sm font-medium text-slate-900">${venta.total.toFixed(2)}</td>
                                        <td className="py-4 px-6 text-center text-sm font-medium text-slate-900">{venta.estado}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                <Link onClick={() => setOpenEliminar(true)}>
                                                    <Trash2 size={16} className="text-red-600 hover:text-red-800" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Detalle */}
                                    {venta.detalle.map((item, idx) => (
                                        <tr key={idx} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <td colSpan="8" className="py-3 px-6">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full border border-gray-200 rounded-lg">
                                                        <thead className="bg-gray-200">
                                                            <tr>
                                                                <th className="py-2 px-4 text-left">Producto/Servicio</th>
                                                                <th className="py-2 px-4 text-left">Nombre</th>
                                                                <th className="py-2 px-4 text-left">Tipo</th>
                                                                <th className="py-2 px-4 text-left">Descripción</th>
                                                                <th className="py-2 px-4 text-left">Cantidad</th>
                                                                <th className="py-2 px-4 text-left">Alto</th>
                                                                <th className="py-2 px-4 text-left">Ancho</th>
                                                                <th className="py-2 px-4 text-left">Descuento</th>
                                                                <th className="py-2 px-4 text-left">URL</th>
                                                                <th className="py-2 px-4 text-left">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr className="hover:bg-gray-100">
                                                                <td className="py-2 px-4">{item.id}</td>
                                                                <td className="py-2 px-4">{item.nombre}</td>
                                                                <td className="py-2 px-4">{item.tipo}</td>
                                                                <td className="py-2 px-4">{item.descripcion}</td>
                                                                <td className="py-2 px-4">{item.cantidad}</td>
                                                                <td className="py-2 px-4">{item.alto}</td>
                                                                <td className="py-2 px-4">{item.ancho}</td>
                                                                <td className="py-2 px-4">{item.descuento}</td>
                                                                <td className="py-2 px-4">{item.url}</td>
                                                                <td className="py-2 px-4">
                                                                    <div className="flex gap-2">
                                                                        <Link>
                                                                            <Edit size={14} className="text-blue-600 hover:text-blue-800" />
                                                                        </Link>
                                                                        <Link>
                                                                            <Eye size={14} className="text-emerald-600 hover:text-emerald-800" />
                                                                        </Link>
                                                                        <Link>
                                                                            <Trash2 size={14} className="text-red-600 hover:text-red-800" />
                                                                        </Link>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
