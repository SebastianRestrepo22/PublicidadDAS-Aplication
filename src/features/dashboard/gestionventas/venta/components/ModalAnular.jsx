import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../../../components/modals/modal.jsx';

const shortenId = (id) => {
  if (!id) return "—";
  const strId = String(id);
  return strId.length > 3 ? strId.slice(-3) : strId.padStart(3, '0');
};

export const ModalAnular = ({ open, onClose, onConfirm, venta, motivo, setMotivo }) => {
  if (!venta) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
        <div className="mb-4 flex justify-center"><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"><AlertCircle size={32} className="text-red-600" /></div></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">¿Anular esta venta?</h3>
        <p className="text-gray-600 mb-4">Estás a punto de anular la venta <span className="font-semibold">#{shortenId(venta.VentaId)}</span></p>
        <div className="mb-4 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de anulación *</label>
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500" placeholder="Describa brevemente el motivo..." required />
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-left">
          <p className="font-medium text-yellow-800 mb-1">Esta acción no se puede deshacer</p>
          <p className="text-yellow-700">La venta quedará como <strong>anulada</strong> en el historial.</p>
        </div>
        <div className="flex gap-3">
          <button className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${!motivo?.trim() ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`} onClick={() => onConfirm(venta.VentaId, motivo)} disabled={!motivo?.trim()}>
            Sí, anular venta
          </button>
          <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </Modal>
  );
};