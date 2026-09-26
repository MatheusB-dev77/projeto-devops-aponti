import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="confirm-dialog">
      <div className="confirm-dialog-icon">
        <AlertTriangle size={28} />
      </div>
      <h3>Confirmar ação</h3>
      <p>{message}</p>
      <div className="confirm-dialog-actions">
        <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Excluindo...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
}
