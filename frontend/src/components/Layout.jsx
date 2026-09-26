import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Users,
  ShoppingCart,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/categories', icon: FolderTree, label: 'Categorias' },
  { to: '/products', icon: Package, label: 'Produtos' },
  { to: '/customers', icon: Users, label: 'Clientes' },
  { to: '/orders', icon: ShoppingCart, label: 'Pedidos' },
];

export default function Layout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Zap size={22} color="white" />
          </div>
          <div>
            <h1>ShopAdmin</h1>
            <span>E-Commerce</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">API v1.0 &middot; REST</p>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
