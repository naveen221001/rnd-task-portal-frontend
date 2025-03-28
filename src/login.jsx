import React, { useState } from 'react';
import axios from 'axios';
import LoginWithSSO from "./LoginWithSSO";

// In JSX

const Login = ({ setToken, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', username);

      setToken(res.data.token);
      setUser(username);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br /><br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <LoginWithSSO setToken={setToken} setUser={setUser} />

    </div>
  );
};

export default Login;
