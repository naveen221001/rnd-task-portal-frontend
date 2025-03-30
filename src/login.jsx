import React, { useState } from 'react';
import axios from 'axios';
import LoginWithSSO from "./LoginWithSSO";
import {
  Paper, TextField, Button, Typography, Alert, Box
} from '@mui/material';

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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: "url('https://source.unsplash.com/1600x900/?technology,abstract') no-repeat center center fixed",
        backgroundSize: 'cover',
        p: 2
      }}
    >
      <Paper
        elevation={10}
        sx={{ p: 5, width: 400, maxWidth: '90%', textAlign: 'center', borderRadius: 3 }}
      >
        <Typography variant="h4" color="primary" gutterBottom>
          R&D Task Portal
        </Typography>

        <Typography variant="h6" gutterBottom>
          Sign In
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          fullWidth
          margin="normal"
          type="password"
          label="Password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>

        <Typography variant="body2" sx={{ mt: 3, mb: 1 }}>
          OR
        </Typography>

        <LoginWithSSO setToken={setToken} setUser={setUser} />
      </Paper>
    </Box>
  );
};

export default Login;
