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
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "driver" | "parent",
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = "user";
const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "https://z2ws6c1n-3000.usw3.devtunnels.ms";

const getErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  try {
    const body = await response.json();
    if (typeof body?.message === "string" && body.message.trim().length > 0) {
      return body.message;
    }
  } catch {
    // Ignore JSON parse errors and return fallback
  }

  return fallback;
};

const normalizeRole = (role: unknown): User["role"] => {
  const normalized = String(role ?? "")
    .trim()
    .toLowerCase();
  return normalized === "driver" ? "driver" : "parent";
};

const toAppUser = (value: unknown): User | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;

  if (!raw.id || !raw.email || !raw.name || !raw.token) {
    return null;
  }

  return {
    id: String(raw.id),
    email: String(raw.email),
    name: String(raw.name),
    role: normalizeRole(raw.role),
    token: String(raw.token),
    phone: raw.phone ? String(raw.phone) : "",
    avatar: raw.avatar ? String(raw.avatar) : undefined,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_USER_KEY);
        if (!storedUser) {
          return;
        }

        const parsedUser = toAppUser(JSON.parse(storedUser));
        if (!parsedUser) {
          await AsyncStorage.removeItem(STORAGE_USER_KEY);
          return;
        }

        setUser(parsedUser);
      } catch {
        await AsyncStorage.removeItem(STORAGE_USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // 🔐 LOGIN
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const loginUrl = `${API_URL}/api/auth/login`;
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!response.ok) {
        const message = await getErrorMessage(response, "Error en el login");
        console.error("LOGIN_HTTP_ERROR", {
          url: loginUrl,
          status: response.status,
          message,
        });
        return { success: false, error: message };
      }

      const data = await response.json();
      const parsedUser = toAppUser(data?.user);

      if (!parsedUser) {
        return {
          success: false,
          error: "Respuesta inválida del servidor",
        };
      }

      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(parsedUser));
      setUser(parsedUser);

      return { success: true };
    } catch (error) {
      console.error("LOGIN_NETWORK_ERROR", error);
      return {
        success: false,
        error: "Error de conexión con el servidor",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🚪 LOGOUT
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_USER_KEY);
    } catch {}

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
        const payload = {
          name,
          fullName: name,
          email: email.trim().toLowerCase(),
          password,
          role,
        };

        const registerUrls = [
          `${API_URL}/api/auth/register`,
          `${API_URL}/api/auth`,
        ];

        let lastError = "Error al registrar";
        const attemptedStatuses: { url: string; status: number }[] = [];
        let data: unknown = null;
        let succeeded = false;

        for (const registerUrl of registerUrls) {
          const response = await fetch(registerUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            data = await response.json();
            succeeded = true;
            break;
          }

          const message = await getErrorMessage(response, "Error al registrar");
          lastError = message;
          attemptedStatuses.push({ url: registerUrl, status: response.status });

          if (response.status === 404) {
            console.warn("REGISTER_FALLBACK_404", {
              url: registerUrl,
              message,
            });
          } else {
            console.warn("REGISTER_HTTP_WARNING", {
              url: registerUrl,
              status: response.status,
              message,
            });
          }

          if (response.status !== 404) {
            break;
          }
        }

        if (!succeeded) {
          console.warn("REGISTER_FAILED_ALL_ENDPOINTS", {
            attemptedStatuses,
            lastError,
          });
          return {
            success: false,
            error: lastError,
          };
        }

        const parsedUser = toAppUser((data as { user?: unknown })?.user);
        if (!parsedUser) {
          return {
            success: false,
            error: "Respuesta inválida del servidor",
          };
        }

        await AsyncStorage.setItem(
          STORAGE_USER_KEY,
          JSON.stringify(parsedUser),
        );
        setUser(parsedUser);

        return { success: true };
      } catch (error) {
        console.error("REGISTER_NETWORK_ERROR", error);
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
