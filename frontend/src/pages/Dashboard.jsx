import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Package,
  Users,
  ShoppingCart,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import customerService from '../services/customerService';
import orderService from '../services/orderService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ categories: 0, products: 0, customers: 0, orders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [cats, prods, custs, ords] = await Promise.all([
        categoryService.getAll(),
        productService.getAll({ limit: 1 }),
        customerService.getAll({ limit: 1 }),
        orderService.getAll({ limit: 5, sort_by: 'created_at', sort_order: 'desc' }),
      ]);

      setStats({
        categories: Array.isArray(cats) ? cats.length : 0,
        products: prods.pagination?.total || 0,
        customers: custs.pagination?.total || 0,
        orders: ords.pagination?.total || 0,
      });

      setRecentOrders(ords.data || []);
    } catch {
      // silent – dashboard is best-effort
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner text="Carregando dashboard..." />;

  const statCards = [
    { label: 'Categorias', value: stats.categories, icon: FolderTree, color: 'purple' },
    { label: 'Produtos', value: stats.products, icon: Package, color: 'blue' },
    { label: 'Clientes', value: stats.customers, icon: Users, color: 'green' },
    { label: 'Pedidos', value: stats.orders, icon: ShoppingCart, color: 'orange' },
  ];

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
          <h2>Dashboard</h2>
          <p>Visão geral do seu e-commerce</p>
        </div>
      </div>

      <div className="stats-grid stagger">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`glass-card stat-card ${color}`}>
            <div className="stat-card-content">
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
              <div className={`stat-icon ${color}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Orders */}
        <div className="glass-card animate-fade-in-up">
          <div className="section-title">
            <TrendingUp size={20} /> Pedidos Recentes
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Nenhum pedido encontrado.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/orders')}
                    >
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="cell-price">{formatCurrency(order.total)}</td>
                      <td className="cell-muted">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card animate-fade-in-up">
          <div className="section-title">
            <Zap size={20} /> Ações Rápidas
          </div>
          <div className="quick-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="quick-action-btn" onClick={() => navigate('/categories')}>
              <Plus size={18} /> Nova Categoria
              <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/products')}>
              <Plus size={18} /> Novo Produto
              <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/customers')}>
              <Plus size={18} /> Novo Cliente
              <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/orders')}>
              <Plus size={18} /> Novo Pedido
              <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Zap(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
