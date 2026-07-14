import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
}

/**
 * Custom error thrown by login()/register() so callers can distinguish
 * "wrong credentials" from "email not verified" without depending on
 * Axios-specific error shapes (we use fetch here, not Axios).
 */
export class AuthError extends Error {
  emailNotVerified: boolean;

  constructor(message: string, emailNotVerified = false) {
    super(message);
    this.name = "AuthError";
    this.emailNotVerified = emailNotVerified;
  }
}

export interface RegisterResult {
  emailNotVerified: boolean;
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<RegisterResult>;

  logout: () => void;

  refreshUser: () => Promise<void>;

  /**
   * Directly sets auth state + localStorage from a token/user pair
   * already obtained elsewhere (e.g. email verification, OAuth callback).
   * Use this instead of manually touching localStorage.
   */
  loginWithToken: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || storedToken === "undefined") {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    refreshUser(storedToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUser = async (authToken?: string) => {
    const jwt = authToken || token;

    if (!jwt) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const data = await response.json();

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error(error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Preserve the emailNotVerified flag instead of discarding it
      throw new AuthError(
        data.message || "Login failed",
        Boolean(data.emailNotVerified)
      );
    }

    setToken(data.token);
    setUser(data.user);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<RegisterResult> => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthError(
        data.message || "Registration failed",
        Boolean(data.emailNotVerified)
      );
    }

    // Our backend never returns a token on register (email verification
    // is required first) — but if that ever changes, handle it safely.
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return {
      emailNotVerified: Boolean(data.emailNotVerified),
      message: data.message || "Registration successful.",
    };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const loginWithToken = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser: () => refreshUser(),
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};