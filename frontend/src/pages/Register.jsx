import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenantName: '',
    subdomain: '',
    adminEmail: '',
    adminFullName: '',
    adminPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // Organization Name validation
    if (!form.tenantName.trim()) {
      errors.tenantName = 'Organization name is required';
    }

    // Subdomain validation
    if (!form.subdomain.trim()) {
      errors.subdomain = 'Subdomain is required';
    } else if (!/^[a-z0-9-]+$/.test(form.subdomain)) {
      errors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    } else if (form.subdomain.length < 3) {
      errors.subdomain = 'Subdomain must be at least 3 characters';
    }

    // Admin Full Name validation
    if (!form.adminFullName.trim()) {
      errors.adminFullName = 'Admin full name is required';
    }

    // Email validation
    if (!form.adminEmail.trim()) {
      errors.adminEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) {
      errors.adminEmail = 'Please enter a valid email address';
    }

    // Password validation
    if (!form.adminPassword) {
      errors.adminPassword = 'Password is required';
    } else if (form.adminPassword.length < 8) {
      errors.adminPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.adminPassword)) {
      errors.adminPassword = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm Password validation
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.adminPassword !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms & Conditions validation
    if (!acceptedTerms) {
      errors.terms = 'You must accept the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = form;
      await api.post('/auth/register-tenant', registerData);
      setMessage('Tenant registered successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-register">
        <div className="auth-header">
        
          <h2>Create your organization</h2>
          <p className="muted">Set up your workspace in minutes</p>
        </div>
        {error && <div className="alert alert-error">❌ {error}</div>}
        {message && <div className="alert alert-success">✅ {message}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>🏢 Organization Name</label>
            <input
              placeholder="Acme Inc"
              required
              value={form.tenantName}
              onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
              className={validationErrors.tenantName ? 'input-error' : ''}
            />
            {validationErrors.tenantName && (
              <span className="error-text">⚠️ {validationErrors.tenantName}</span>
            )}
          </div>

          <div className="form-group">
            <label>🌐 Subdomain</label>
            <div className="subdomain-input-group">
              <input
                placeholder="acme"
                required
                value={form.subdomain}
                onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase() })}
                className={validationErrors.subdomain ? 'input-error' : ''}
              />
             
            </div>
            {form.subdomain && !validationErrors.subdomain && (
              <span className="subdomain-preview">✓ Your URL: <strong>{form.subdomain}.yourapp.com</strong></span>
            )}
            {validationErrors.subdomain && (
              <span className="error-text">⚠️ {validationErrors.subdomain}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>👤 Admin Full Name</label>
              <input
                placeholder="Jane Doe"
                required
                value={form.adminFullName}
                onChange={(e) => setForm({ ...form, adminFullName: e.target.value })}
                className={validationErrors.adminFullName ? 'input-error' : ''}
              />
              {validationErrors.adminFullName && (
                <span className="error-text">⚠️ {validationErrors.adminFullName}</span>
              )}
            </div>

            <div className="form-group">
              <label>📧 Admin Email</label>
              <input
                placeholder="admin@acme.com"
                type="email"
                required
                value={form.adminEmail}
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                className={validationErrors.adminEmail ? 'input-error' : ''}
              />
              {validationErrors.adminEmail && (
                <span className="error-text">⚠️ {validationErrors.adminEmail}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>🔒 Password</label>
              <div className="password-input-wrapper">
                <input
                  placeholder="Min. 8 characters"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.adminPassword}
                  onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                  className={validationErrors.adminPassword ? 'input-error' : ''}
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
              {validationErrors.adminPassword && (
                <span className="error-text">⚠️ {validationErrors.adminPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label>🔐 Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  placeholder="Re-enter password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={validationErrors.confirmPassword ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <span className="error-text">⚠️ {validationErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
              </span>
            </label>
            {validationErrors.terms && (
              <span className="error-text">⚠️ {validationErrors.terms}</span>
            )}
          </div>

          <button className="btn btn-primary btn-large" type="submit" disabled={loading}>
            {loading ? (
              <span>⏳ Creating your workspace...</span>
            ) : (
              <span>🚀 Create Organization</span>
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p className="muted small">
            Already have an account? <a href="/login" className="link-primary">Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
