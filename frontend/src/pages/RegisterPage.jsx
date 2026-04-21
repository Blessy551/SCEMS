import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const routeFor = (role) => {
  if (role === 'Organiser') return '/organiser';
  if (role === 'HOD') return '/hod';
  return '/principal';
};

const RegisterPage = () => {
  const { roleType } = useParams();
  const role = roleType === 'hod' ? 'HOD' : 'Organiser';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({ name, email, department, password, role });
      navigate(routeFor(user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div>
          <h1>SCEMS</h1>
          <p>Create your {role} account</p>
          <small>Smart Campus Event Management System</small>
        </div>
        <form className="login-card" onSubmit={submit}>
          <h2>Register as {role}</h2>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Department</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          <Link to="/login">Back to login</Link>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;
