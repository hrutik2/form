import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { login as loginRequest, register as registerRequest } from "../api/forms";

type AuthUser = { email: string; name: string; id?: string };

const persistSession = (accessToken: string, user: AuthUser) => {
  localStorage.setItem("builder_token", accessToken);
  localStorage.setItem("builder_user", JSON.stringify(user));
};

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("builder_token");
    const savedUser = localStorage.getItem("builder_user");
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    persistSession(data.access_token, data.user);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await registerRequest(name, email, password);
    persistSession(data.access_token, data.user);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("builder_token");
    localStorage.removeItem("builder_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
};
