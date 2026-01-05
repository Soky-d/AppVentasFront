import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// ✅ PROVIDER
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("loggedInUser");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem("loggedInUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    setUser(null);
  };

  //const isAuthenticated = !!user;
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ HOOK (ESTO FALTABA O ESTABA MAL)
export const useAuth = () => {
  return useContext(AuthContext);
};