import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../../../components/modals/modal.jsx';

const shortenId = (id) => {
  if (!id) return "—";
  const strId = String(id);
  return strId.length > 3 ? strId.slice(-3) : strId.padStart(3, '0');
};

export const ModalRechazar = ({ open, onClose, onConfirm, venta, motivo, setMotivo }) => {
  if (!venta) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
        <div className="mb-4 flex justify-center"><div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center"><AlertCircle size={32} className="text-orange-600" /></div></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">¿Rechazar esta venta?</h3>
        <p className="text-gray-600 mb-4">Estás a punto de rechazar la venta <span className="font-semibold">#{shortenId(venta.VentaId)}</span></p>
        <div className="mb-4 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del rechazo *</label>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Ej: Voucher inválido, comprobante ilegible, falta de pago..." required />
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6 text-sm text-left">
          <p className="font-medium text-orange-800 mb-1">Esta acción no se puede deshacer</p>
          <p className="text-orange-700">La venta quedará como <strong>rechazada</strong> en el historial y se notificará al cliente.</p>
        </div>
        <div className="flex gap-3">
          <button className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${!motivo?.trim() ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'}`} onClick={() => onConfirm(venta.VentaId, motivo)} disabled={!motivo?.trim()}>
            Sí, rechazar venta
          </button>
          <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </Modal>
  );
};