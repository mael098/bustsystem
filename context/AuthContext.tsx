import type { User } from "@/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    role: "driver" | "parent",
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ URL CORRECTA (SIN espacios y sin duplicar rutas)
const API_URL = "https://z2ws6c1n-3000.usw3.devtunnels.ms";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔐 LOGIN
  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.toLowerCase(), password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setIsLoading(false);
          return {
            success: false,
            error: data.message || "Credenciales inválidas",
          };
        }

        setUser(data.user);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: "Error de conexión con el servidor",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 🚪 LOGOUT
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // 🆕 REGISTER
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: "driver" | "parent",
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.message || "Error al registrar",
          };
        }

        // 👉 Guardamos el usuario que viene del backend
        setUser(data.user);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: "Error de conexión con el servidor",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🧠 Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
