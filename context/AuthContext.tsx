import type { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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

const API_URL = "https://z2ws6c1n-3000.usw3.devtunnels.ms";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storeUser = await AsyncStorage.getItem("user");
        if (storeUser) {
          setUser(JSON.parse(storeUser));
        }
      } catch (err) {
        console.log("Error cargado usuario:", err);
      }
    };
    loadUser();
  }, []);

  // 🔐 LOGIN
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      if (!response.ok) {
        let message = "Error en el login";

        try {
          const err = await response.json();
          message = err.message;
        } catch {}

        return { success: false, error: message };
      }

      const data = await response.json();

      if (!data || !data.user) {
        return {
          success: false,
          error: "Respuesta inválida del servidor",
        };
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
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
  }, []);

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
    ) => {
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
