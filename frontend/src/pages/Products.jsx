import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function Products() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    category_id: '',
    min_price: '',
    max_price: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    sku: '',
  };
  const [form, setForm] = useState(emptyForm);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      // Remove empty params
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === null || params[k] === undefined) {
          delete params[k];
        }
      });
      const result = await productService.getAll(params);
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      sku: product.sku || '',
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category_id: parseInt(form.category_id, 10),
      };
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await productService.create(payload);
        toast.success('Produto criado com sucesso!');
      }
      closeModal();
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await productService.delete(deleteTarget.id);
      toast.success('Produto excluído com sucesso!');
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  const formatCurrency = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Produtos</h2>
          <p>Gerencie o catálogo de produtos da loja</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search />
          <input
            className="form-input"
            placeholder="Buscar por nome ou descrição..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <select
          className="form-select filter-select"
          value={filters.category_id}
          onChange={(e) => handleFilterChange('category_id', e.target.value)}
        >
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="form-select filter-select"
          value={`${filters.sort_by}-${filters.sort_order}`}
          onChange={(e) => {
            const [sort_by, sort_order] = e.target.value.split('-');
            setFilters((prev) => ({ ...prev, sort_by, sort_order, page: 1 }));
          }}
        >
          <option value="created_at-desc">Mais recentes</option>
          <option value="created_at-asc">Mais antigos</option>
          <option value="name-asc">Nome A-Z</option>
          <option value="name-desc">Nome Z-A</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>

      <div className="glass-card">
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package />
            <p>Nenhum produto encontrado.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>SKU</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="cell-muted">#{p.id}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td className="cell-muted">{p.sku || '—'}</td>
                      <td>
                        <span className="badge badge-confirmed">
                          {p.category_name}
                        </span>
                      </td>
                      <td className="cell-price">{formatCurrency(p.price)}</td>
                      <td>
                        <span
                          style={{
                            color:
                              p.stock <= 5
                                ? 'var(--color-danger)'
                                : p.stock <= 20
                                ? 'var(--color-warning)'
                                : 'var(--color-success)',
                            fontWeight: 600,
                          }}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button
                            className="btn-icon"
                            title="Editar"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn-icon danger"
                            title="Excluir"
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 size={16} />
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Produto' : 'Novo Produto'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome *</label>
            <input
              className="form-input"
              placeholder="Nome do produto"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
              maxLength={255}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Preço *</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Estoque *</label>
              <input
                className="form-input"
                type="number"
                min="0"
                placeholder="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Categoria *</label>
              <select
                className="form-select"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input
                className="form-input"
                placeholder="Ex: SMRT-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                maxLength={100}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea
              className="form-textarea"
              placeholder="Descrição do produto (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={2000}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir Produto"
      >
        <ConfirmDialog
          message={`Tem certeza que deseja excluir o produto "${deleteTarget?.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      </Modal>
    </div>
  );
}
