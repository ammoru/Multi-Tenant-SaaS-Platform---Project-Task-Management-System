import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/tenants/${user.tenantId}/users`);
      setUsers(res.data.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!form.email || !form.fullName || !form.password) return;
    setSaving(true);
    try {
      await api.post(`/tenants/${user.tenantId}/users`, form);
      setForm({ email: '', fullName: '', password: '', role: 'user' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  useEffect(() => {
    if (user?.role === 'tenant_admin') {
      loadUsers();
    }
  }, []);

  if (user?.role !== 'tenant_admin') {
    return <div className="page"><div className="alert alert-error">Unauthorized</div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted small">Team</p>
          <h1>Users</h1>
        </div>
        <div className="inline-form">
          <input
            className="input"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>
          <button className="btn btn-primary" onClick={addUser} disabled={saving}>
            {saving ? 'Saving...' : 'Add user'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="card">Loading users...</div>
      ) : (
        <div className="card table-card">
          {users.length === 0 ? (
            <p className="muted">No users yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td><span className="badge">{u.role}</span></td>
                    <td className="table-actions">
                      {u.role !== 'tenant_admin' && (
                        <button className="btn btn-ghost" onClick={() => deleteUser(u._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
