const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

export const ProveedorView = ({ proveedor, onClose }) => {
  if (!proveedor) return null;

  return (
    <div className="w-[95vw] max-w-[600px] p-4 mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
        Detalles del proveedor
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600">ID</label>
            <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700 font-mono">
              {getShortId(proveedor.ProveedorId)}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600">NIT Proveedor</label>
            <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
              {proveedor.Nit || '-'}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Teléfono</label>
            <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
              {proveedor.Telefono}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600">Nombre del proveedor</label>
            <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
              {proveedor.NombreProveedor}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600">Correo electrónico</label>
            <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700 truncate">
              {proveedor.Correo}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-600">Dirección</label>
            <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
              {proveedor.Direccion}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 text-sm font-medium text-gray-600">Estado</label>
          <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
              Number(proveedor.Estado) === 1
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {Number(proveedor.Estado) === 1 ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t pt-4 mt-4">
        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ProveedorView;