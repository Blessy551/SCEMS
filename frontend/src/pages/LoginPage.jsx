import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const routeFor = (role) => {
  if (role === 'Organiser') return '/organiser';
  if (role === 'HOD') return '/hod';
  return '/principal';
};

const LoginPage = () => {
  const [step, setStep] = useState(1);
  const [chosenRole, setChosenRole] = useState(null);
  const [email, setEmail] = useState('blessy@vnrvjiet.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setChosenRole(role);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setChosenRole(null);
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // Redirect based on the actual user role from the backend
      navigate(routeFor(user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div>
          <h1>SCEMS</h1>
          <p>Smart Campus Event Management System</p>
          <small>VNRVJIET</small>
        </div>

        {step === 1 ? (
          <div className="login-card role-selection">
            <h2>Welcome to SCEMS</h2>
            <p className="selection-hint">Please choose your role to continue</p>
            <div className="role-buttons">
              <button className="btn btn-primary role-btn" onClick={() => handleRoleSelect('Organiser')}>
                Login as Organiser
              </button>
              <button className="btn btn-secondary role-btn" onClick={() => handleRoleSelect('HOD')}>
                Login as HOD
              </button>
            </div>
          </div>
        ) : (
          <form className="login-card" onSubmit={submit}>
            <button type="button" className="back-link" onClick={handleBack}>
              ← Back
            </button>
            <h2>{chosenRole} Login</h2>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
            <div className="login-register-links">
              <p>
                Don't have an account?{' '}
                <Link to={`/register/${chosenRole.toLowerCase()}`}>Register</Link>
              </p>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};

export default LoginPage;
