import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    tenantSubdomain: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      
      // Store token
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      login(res.data.data.token, res.data.data.user);
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
         
          <h2>Welcome back</h2>
          <p className="muted">Sign in to your workspace</p>
        </div>
        
        {error && <div className="alert alert-error">❌ {error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>📧 Email</label>
            <input
              placeholder="you@company.com"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>🔒 Password</label>
            <div className="password-input-wrapper">
              <input
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>🌐 Tenant Subdomain</label>
            <input
              placeholder="acme"
              required
              value={form.tenantSubdomain}
              onChange={(e) => setForm({ ...form, tenantSubdomain: e.target.value.toLowerCase() })}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button className="btn btn-primary btn-large" type="submit" disabled={loading}>
            {loading ? (
              <span>⏳ Signing in...</span>
            ) : (
              <span>🚀 Sign in</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="muted small">
            New organization? <a href="/register" className="link-primary">Create account →</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
