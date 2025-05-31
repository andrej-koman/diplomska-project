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
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  login: (userData: UserData) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
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
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }
    } catch (e: any) {
      console.error("Error fetching user data:", e);
      setError(e.message || "Failed to load user data.");
      setUser(null);
    } finally {
      setIsLoading(false);
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
      value={{ user, isLoading, error, login, logout, fetchUser }}
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
