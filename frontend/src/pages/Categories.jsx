import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import categoryService from '../services/categoryService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function Categories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '' });
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
      if (editing) {
        await categoryService.update(editing.id, form);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoryService.create(form);
        toast.success('Categoria criada com sucesso!');
      }
      closeModal();
      loadCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await categoryService.delete(deleteTarget.id);
      toast.success('Categoria excluída com sucesso!');
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Categorias</h2>
          <p>Gerencie as categorias dos seus produtos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <LoadingSpinner />
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <FolderTree />
            <p>Nenhuma categoria cadastrada.</p>
            <button className="btn btn-primary btn-sm" onClick={openCreate}>
              <Plus size={16} /> Criar primeira categoria
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Criado em</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="cell-muted">#{cat.id}</td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td className="cell-muted">{cat.description || '—'}</td>
                    <td className="cell-muted">{formatDate(cat.created_at)}</td>
                    <td>
                      <div className="cell-actions">
                        <button
                          className="btn-icon"
                          title="Editar"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Excluir"
                          onClick={() => setDeleteTarget(cat)}
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
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome *</label>
            <input
              className="form-input"
              placeholder="Nome da categoria"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea
              className="form-textarea"
              placeholder="Descrição da categoria (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={500}
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
        title="Excluir Categoria"
      >
        <ConfirmDialog
          message={`Tem certeza que deseja excluir a categoria "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      </Modal>
    </div>
  );
}
