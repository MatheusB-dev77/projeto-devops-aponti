import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Users, Search, Mail, Phone } from 'lucide-react';
import customerService from '../services/customerService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function Customers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
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
  });

  const emptyForm = {
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
    },
  };
  const [form, setForm] = useState(emptyForm);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === null) delete params[k];
      });
      const result = await customerService.getAll(params);
      setCustomers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(customer) {
    setEditing(customer);
    setForm({
      name: customer.name,
      email: customer.email,
      cpf: customer.cpf,
      phone: customer.phone || '',
      address: customer.address || emptyForm.address,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  function updateAddress(key, value) {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form };
      // Remove empty address fields
      const addr = payload.address;
      const hasAddress = Object.values(addr).some((v) => v && v.trim());
      if (!hasAddress) {
        delete payload.address;
      }
      if (editing) {
        // CPF is not updatable
        const { cpf, ...updatePayload } = payload;
        await customerService.update(editing.id, updatePayload);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await customerService.create(payload);
        toast.success('Cliente criado com sucesso!');
      }
      closeModal();
      loadCustomers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await customerService.delete(deleteTarget.id);
      toast.success('Cliente excluído com sucesso!');
      setDeleteTarget(null);
      loadCustomers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function formatCPF(cpf) {
    if (!cpf) return '—';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return cpf;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Clientes</h2>
          <p>Gerencie os clientes cadastrados</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search />
          <input
            className="form-input"
            placeholder="Buscar por nome ou email..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <LoadingSpinner />
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <Users />
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Cidade</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="cell-muted">#{c.id}</td>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} color="var(--text-muted)" />
                          {c.email}
                        </span>
                      </td>
                      <td className="cell-muted">{formatCPF(c.cpf)}</td>
                      <td className="cell-muted">
                        {c.phone ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} />
                            {c.phone}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="cell-muted">
                        {c.address?.city
                          ? `${c.address.city}/${c.address.state}`
                          : '—'}
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button
                            className="btn-icon"
                            title="Editar"
                            onClick={() => openEdit(c)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn-icon danger"
                            title="Excluir"
                            onClick={() => setDeleteTarget(c)}
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
        title={editing ? 'Editar Cliente' : 'Novo Cliente'}
        large
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome *</label>
            <input
              className="form-input"
              placeholder="Nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
              maxLength={255}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                className="form-input"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>CPF *</label>
              <input
                className="form-input"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                required={!editing}
                disabled={!!editing}
                style={editing ? { opacity: 0.5 } : {}}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input
              className="form-input"
              placeholder="11999990001"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              maxLength={20}
            />
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            Endereço (opcional)
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rua</label>
              <input
                className="form-input"
                placeholder="Rua das Flores"
                value={form.address.street}
                onChange={(e) => updateAddress('street', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Número</label>
              <input
                className="form-input"
                placeholder="100"
                value={form.address.number}
                onChange={(e) => updateAddress('number', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Complemento</label>
              <input
                className="form-input"
                placeholder="Apto 42"
                value={form.address.complement}
                onChange={(e) => updateAddress('complement', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Bairro</label>
              <input
                className="form-input"
                placeholder="Centro"
                value={form.address.neighborhood}
                onChange={(e) => updateAddress('neighborhood', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cidade</label>
              <input
                className="form-input"
                placeholder="São Paulo"
                value={form.address.city}
                onChange={(e) => updateAddress('city', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>UF</label>
                <input
                  className="form-input"
                  placeholder="SP"
                  maxLength={2}
                  value={form.address.state}
                  onChange={(e) => updateAddress('state', e.target.value.toUpperCase())}
                />
              </div>
              <div className="form-group">
                <label>CEP</label>
                <input
                  className="form-input"
                  placeholder="01001-000"
                  value={form.address.zip_code}
                  onChange={(e) => updateAddress('zip_code', e.target.value)}
                />
              </div>
            </div>
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
        title="Excluir Cliente"
      >
        <ConfirmDialog
          message={`Tem certeza que deseja excluir o cliente "${deleteTarget?.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      </Modal>
    </div>
  );
}
