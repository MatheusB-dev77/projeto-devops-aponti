import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  ShoppingCart,
  Search,
  Eye,
  ArrowRight,
  Trash2,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
} from 'lucide-react';
import orderService from '../services/orderService';
import customerService from '../services/customerService';
import productService from '../services/productService';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

const STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_BUTTON_CONFIG = {
  CONFIRMED: { label: 'Confirmar', icon: CheckCircle, className: 'btn btn-sm btn-success' },
  SHIPPED: { label: 'Enviar', icon: Truck, className: 'btn btn-sm btn-primary' },
  DELIVERED: { label: 'Entregar', icon: PackageCheck, className: 'btn btn-sm btn-success' },
  CANCELLED: { label: 'Cancelar', icon: XCircle, className: 'btn btn-sm btn-danger' },
};

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    customer_id: '',
  });

  // Create form state
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderForm, setOrderForm] = useState({
    customer_id: '',
    notes: '',
    items: [{ product_id: '', quantity: 1 }],
  });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === null) delete params[k];
      });
      const result = await orderService.getAll(params);
      setOrders(result.data);
      setPagination(result.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Load options for create form
  async function loadFormOptions() {
    try {
      const [custResult, prodResult] = await Promise.all([
        customerService.getAll({ limit: 100 }),
        productService.getAll({ limit: 100 }),
      ]);
      setCustomers(custResult.data);
      setProducts(prodResult.data);
    } catch (err) {
      toast.error('Erro ao carregar dados para o formulário');
    }
  }

  function openCreate() {
    setOrderForm({
      customer_id: '',
      notes: '',
      items: [{ product_id: '', quantity: 1 }],
    });
    loadFormOptions();
    setCreateModalOpen(true);
  }

  async function openDetail(orderId) {
    try {
      setDetailLoading(true);
      setDetailModal({});
      const data = await orderService.getById(orderId);
      setDetailModal(data);
    } catch (err) {
      toast.error(err.message);
      setDetailModal(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function addItem() {
    setOrderForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1 }],
    }));
  }

  function removeItem(index) {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function updateItem(index, key, value) {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        customer_id: parseInt(orderForm.customer_id, 10),
        notes: orderForm.notes || undefined,
        items: orderForm.items.map((item) => ({
          product_id: parseInt(item.product_id, 10),
          quantity: parseInt(item.quantity, 10),
        })),
      };
      await orderService.create(payload);
      toast.success('Pedido criado com sucesso!');
      setCreateModalOpen(false);
      loadOrders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate(orderId, newStatus) {
    try {
      setUpdatingStatus(true);
      const updated = await orderService.updateStatus(orderId, newStatus);
      toast.success(`Status atualizado para ${newStatus}`);
      // Update detail if open
      if (detailModal && detailModal.id === orderId) {
        setDetailModal((prev) => ({ ...prev, status: updated.status }));
      }
      loadOrders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  const formatCurrency = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Pedidos</h2>
          <p>Gerencie os pedidos do e-commerce</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Novo Pedido
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select
          className="form-select filter-select"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
        >
          <option value="">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      <div className="glass-card">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart />
            <p>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Data</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="cell-price">{formatCurrency(order.total)}</td>
                      <td className="cell-muted">{formatDate(order.created_at)}</td>
                      <td>
                        <div className="cell-actions">
                          <button
                            className="btn-icon"
                            title="Ver detalhes"
                            onClick={() => openDetail(order.id)}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              pagination={pagination}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Novo Pedido"
        large
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Cliente *</label>
            <select
              className="form-select"
              value={orderForm.customer_id}
              onChange={(e) =>
                setOrderForm((prev) => ({ ...prev, customer_id: e.target.value }))
              }
              required
            >
              <option value="">Selecione um cliente...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.email}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '4px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            Itens do Pedido
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={addItem}
            >
              <Plus size={14} /> Adicionar Item
            </button>
          </div>

          {orderForm.items.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 80px 36px',
                gap: '12px',
                alignItems: 'end',
              }}
            >
              <div className="form-group">
                <label>Produto *</label>
                <select
                  className="form-select"
                  value={item.product_id}
                  onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)} (Estoque: {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Qtd *</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  required
                />
              </div>
              {orderForm.items.length > 1 && (
                <button
                  type="button"
                  className="btn-icon danger"
                  style={{ marginBottom: '2px' }}
                  onClick={() => removeItem(index)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          <div className="form-group">
            <label>Observações</label>
            <textarea
              className="form-textarea"
              placeholder="Observações do pedido (opcional)"
              value={orderForm.notes}
              onChange={(e) =>
                setOrderForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              maxLength={500}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Criando...' : 'Criar Pedido'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal ? `Pedido #${detailModal.id || '...'}` : 'Detalhes'}
        large
      >
        {detailLoading ? (
          <LoadingSpinner text="Carregando detalhes..." />
        ) : detailModal?.id ? (
          <>
            <div className="order-detail-header">
              <StatusBadge status={detailModal.status} />
              <span className="cell-muted" style={{ fontSize: '0.85rem' }}>
                {formatDate(detailModal.created_at)}
              </span>
            </div>

            <div className="order-detail-meta">
              <div className="order-meta-item">
                <span className="order-meta-label">Cliente</span>
                <span className="order-meta-value">{detailModal.customer_name}</span>
              </div>
              <div className="order-meta-item">
                <span className="order-meta-label">Email</span>
                <span className="order-meta-value">{detailModal.customer_email}</span>
              </div>
              {detailModal.notes && (
                <div className="order-meta-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="order-meta-label">Observações</span>
                  <span className="order-meta-value">{detailModal.notes}</span>
                </div>
              )}
            </div>

            <div className="order-items-title">Itens do Pedido</div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Preço Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detailModal.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td className="cell-price">{formatCurrency(item.unit_price)}</td>
                      <td className="cell-price">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="order-total">
              <span style={{ marginRight: '12px' }}>Total:</span>
              <span>{formatCurrency(detailModal.total)}</span>
            </div>

            {/* Status transitions */}
            {STATUS_TRANSITIONS[detailModal.status]?.length > 0 && (
              <div className="status-actions">
                {STATUS_TRANSITIONS[detailModal.status].map((nextStatus) => {
                  const config = STATUS_BUTTON_CONFIG[nextStatus];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <button
                      key={nextStatus}
                      className={config.className}
                      disabled={updatingStatus}
                      onClick={() => handleStatusUpdate(detailModal.id, nextStatus)}
                    >
                      <Icon size={15} /> {config.label}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </Modal>
    </div>
  );
}
