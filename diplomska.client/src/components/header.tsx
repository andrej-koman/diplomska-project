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
import { useUser } from "@/contexts/UserContext";

export default function Header() {
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const {
    user,
    isLoading: isLoadingUserData,
    error: fetchUserDataError,
    logout: contextLogout,
    fetchUser,
  } = useUser();

  useEffect(() => {
    if ((!user && !fetchUserDataError) || fetchUserDataError) {
      if (fetchUser) {
        fetchUser();
      }
    }
    if (!isLoadingUserData && !user && !fetchUserDataError) {
      if (window.location.pathname !== "/login") {
      }
    }
  }, [user, isLoadingUserData, fetchUserDataError, fetchUser]);

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

      window.location.href = "/login";
      contextLogout();
    } catch (error) {
      console.error(error);
      setLogoutError("Odjava ni uspela. Poskusite ponovno.");
    }
  };

  const handleSettings = () => {
    console.log("Settings clicked");
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
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white text-black"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user.userName || user.email || "Uporabnik"}
                  </p>
                  {user.userName && user.email && (
                    <p className="text-xs leading-none text-gray-500">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onClick={handleSettings}
                className="hover:bg-gray-100 p-2 cursor-pointer"
              >
                Nastavitve
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="hover:bg-gray-100 p-2 cursor-pointer"
              >
                Odjava
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => (window.location.href = "/login")}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            Prijava
          </Button>
        )}
        {logoutError && (
          <p className="text-red-500 text-sm mt-1 fixed right-4 bottom-4">
            {logoutError}
          </p>
        )}
      </div>
    </header>
  );
}
