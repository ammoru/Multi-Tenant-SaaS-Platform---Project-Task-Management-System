import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const Dashboard = () => {
  const { logout } = useAuth();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setMe(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) return <div className="page"><div className="card">Loading...</div></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="muted small">Welcome back</p>
          <h1>Dashboard</h1>
        </div>
        <button className="btn btn-ghost" onClick={logout}>Logout</button>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <p className="muted small">Name</p>
          <h3>{me.fullName}</h3>
          <p className="muted">{me.email}</p>
        </div>
        <div className="card">
          <p className="muted small">Role</p>
          <h3 className="badge badge-soft">{me.role}</h3>
          <p className="muted">Tenant access</p>
        </div>
        <div className="card">
          <p className="muted small">Plan</p>
          <h3>{me.tenant?.subscriptionPlan || 'N/A'}</h3>
          <p className="muted">{me.tenant?.name || 'No tenant'}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
