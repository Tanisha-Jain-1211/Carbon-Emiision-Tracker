import React, { useState } from 'react';

const Register = () => {
  const [form, setForm] = useState({ name: '', username: '', password: '', mobile: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMessage('Registration successful. Please log in.');
    } else {
      setMessage('Failed to register.');
    }
  };

  return (
    <div className="page">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label htmlFor="username">Username</label>
        <input name="username" value={form.username} onChange={handleChange} required />

        <label htmlFor="password">Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />

        <label htmlFor="mobile">Mobile Number</label>
        <input name="mobile" value={form.mobile} onChange={handleChange} required />

        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
