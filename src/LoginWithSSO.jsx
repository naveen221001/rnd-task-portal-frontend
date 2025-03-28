import React from "react";
import { useMsal } from "@azure/msal-react";
import Button from "@mui/material/Button";

const LoginWithSSO = ({ setToken, setUser }) => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ["openid", "profile", "email"] // change this
      });
      
      const userEmail = loginResponse.account.username;
      const token = loginResponse.idToken;
  
      setUser(userEmail);
      setToken(token);
      localStorage.setItem('token', token);
      setToken(token);
  
      // 🔁 Force re-render after login
      window.location.reload();
    } catch (error) {
      console.error("❌ Microsoft SSO login failed:", error);
    }
  };
  
  return (
    <Button variant="contained" color="primary" onClick={handleLogin}>
      Login with Microsoft SSO
    </Button>
  );
};

export default LoginWithSSO;
