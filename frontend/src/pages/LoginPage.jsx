import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const routeFor = (role) => {
  if (role === 'Organiser') return '/organiser';
  if (role === 'HOD') return '/hod';
  return '/principal';
};

const LoginPage = () => {
  const [email, setEmail] = useState('blessy@vnrvjiet.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(routeFor(user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
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
        <form className="login-card" onSubmit={submit}>
          <h2>Sign in</h2>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="btn btn-primary" type="submit">Login</button>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
