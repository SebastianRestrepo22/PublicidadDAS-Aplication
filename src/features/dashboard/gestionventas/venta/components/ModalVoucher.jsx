import React from 'react';
import { X, FileText, Download } from 'lucide-react';
import Modal from '../../../components/modals/modal.jsx';

export const ModalVoucher = ({ open, onClose, voucherUrl }) => {
  if (!open || !voucherUrl) return null;

  const getVoucherType = (url) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    return 'other';
  };

  const voucherType = getVoucherType(voucherUrl);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[900px] max-h-[90vh] overflow-hidden p-4 mx-auto bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={20} /> Comprobante de Pago
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          {voucherType === 'image' ? (
            <div className="flex flex-col items-center">
              <img src={voucherUrl} alt="Comprobante de pago" className="max-w-full rounded-lg shadow-lg" />
            </div>
          ) : voucherType === 'pdf' ? (
            <iframe src={`${voucherUrl}#toolbar=0&navpanes=0`} className="w-full h-[70vh] rounded-lg border border-gray-200" title="Comprobante PDF" />
          ) : (
            <div className="text-center py-12">
              <FileText size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No se puede previsualizar este tipo de archivo</p>
              <a href={voucherUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download size={18} /> Descargar archivo
              </a>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t flex justify-end gap-3">
          <a href={voucherUrl} download className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
            <Download size={16} /> Descargar
          </a>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};