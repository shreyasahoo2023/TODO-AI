import { createContext, useContext, useState, useEffect } from "react";
import { googleLogout } from "@react-oauth/google";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for cached user + token
    const cachedUser = localStorage.getItem("auth_user");
    const cachedToken = localStorage.getItem("auth_token");
    
    if (cachedUser && cachedToken) {
      setUser(JSON.parse(cachedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_token", token);
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
