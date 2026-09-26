const statusConfig = {
  PENDING: { label: 'Pendente', className: 'badge-pending' },
  CONFIRMED: { label: 'Confirmado', className: 'badge-confirmed' },
  SHIPPED: { label: 'Enviado', className: 'badge-shipped' },
  DELIVERED: { label: 'Entregue', className: 'badge-delivered' },
  CANCELLED: { label: 'Cancelado', className: 'badge-cancelled' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: '' };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
