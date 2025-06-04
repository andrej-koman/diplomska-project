import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

export interface UserData {
  userId?: string;
  userName?: string;
  email?: string;
  emailConfirmed?: boolean;
  phoneNumber?: string;
  twoFactorEnabled?: boolean;
  emailTwoFactorEnabled?: boolean;
  authenticatorTwoFactorEnabled?: boolean;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  login: (userData: UserData) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  toggle2FA: (enable: boolean) => Promise<boolean>;
  toggleEmailTwoFactor: (enable: boolean) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/Auth/userdata");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 401) {
        setUser(null);
      } else {
        const errorData = await response.text();
        console.error("Failed to fetch user data:", response.status, errorData);
        throw new Error(
          `Napaka pri pridobivanju uporabniških podatkov: ${response.statusText}`
        );
      }
    } catch (e: unknown) {
      console.error("Error fetching user data:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Napaka pri nalaganju uporabniških podatkov.");
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggle2FA = async (enable: boolean): Promise<boolean> => {
    try {
      const response = await fetch("/api/Auth/toggle-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enable }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser((prev) =>
          prev ? { ...prev, twoFactorEnabled: data.twoFactorEnabled } : null
        );
        return true;
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to toggle 2FA:",
          response.status,
          response.statusText,
          errorText
        );
        return false;
      }
    } catch (e: unknown) {
      console.error("Error toggling 2FA:", e);
      return false;
    }
  };

  const toggleEmailTwoFactor = async (enable: boolean): Promise<boolean> => {
    try {
      const response = await fetch("/api/Auth/toggle-email-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enable }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser((prev) =>
          prev ? { ...prev, emailTwoFactorEnabled: data.emailTwoFactorEnabled } : null
        );
        return true;
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to toggle email 2FA:",
          response.status,
          response.statusText,
          errorText
        );
        return false;
      }
    } catch (e: unknown) {
      console.error("Error toggling email 2FA:", e);
      return false;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData: UserData) => {
    setUser(userData);
    setError(null);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{ user, isLoading, error, login, logout, fetchUser, toggle2FA, toggleEmailTwoFactor }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
