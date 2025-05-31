import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  email?: string;
}

export default function Header() {
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true);
  const [fetchUserDataError, setFetchUserDataError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUserData(true);
      setFetchUserDataError(null);
      try {
        const response = await fetch("/api/Auth/userdata");
        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized, redirect to login
            window.location.href = "/login";
            return;
          }
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        const data: UserData = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setFetchUserDataError("Napaka pri nalaganju podatkov uporabnika.");
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      const response = await fetch("/api/Auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      setLogoutError("Odjava ni uspela. Poskusite ponovno.");
    }
  };

  const handleSettings = () => {
    console.log("Settings clicked");
    // window.location.href = "/settings";
  };

  const getInitials = (email?: string) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 w-full z-50">
      <h1 className="text-xl font-bold">Diplomska</h1>
      <div>
        {isLoadingUserData ? (
          <p>Nalaganje...</p>
        ) : fetchUserDataError ? (
          <p className="text-red-500 text-sm">{fetchUserDataError}</p>
        ) : userData ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10">
                  {/* <AvatarImage src={userData.avatarUrl} alt={userData.userName || "User"} /> */}
                  <AvatarFallback>{getInitials(userData.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white text-black" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {userData.email || "Brez e-pošte"}
                  </p>
                  <p className="text-xs leading-none text-gray-500">
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200"/>
              <DropdownMenuItem onClick={handleSettings} className="hover:bg-gray-100 p-2 cursor-pointer">
                Nastavitve
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200"/>
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-100 p-2 cursor-pointer">
                Odjava
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Fallback if user data is null and not loading/error (e.g. if redirected before 401)
          <Button onClick={() => window.location.href = "/login"} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            Prijava
          </Button>
        )}
        {logoutError && <p className="text-red-500 text-sm mt-1 fixed right-4 bottom-4">{logoutError}</p>}
      </div>
    </header>
  );
}
