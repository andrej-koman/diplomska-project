import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Header from "../header";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user, toggle2FA, toggleEmailTwoFactor } = useUser();
  const [isToggling, setIsToggling] = useState(false);
  const [isTogglingEmail, setIsTogglingEmail] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const { toast } = useToast();

  const handle2FAToggle = async () => {
    if (!user) return;

    setIsToggling(true);

    const newState = !user.twoFactorEnabled;
    const success = await toggle2FA(newState);

    if (success) {
      toast({
        title: `2FA ${newState ? "omogočena" : "onemogočena"} uspešno.`,
        description: `Vaša nastavitev dvojne avtentikacije je bila ${
          newState ? "omogočena" : "onemogočena"
        }.`,
        duration: 5000,
        variant: "default",
      });
    } else {
      toast({
        title: "Napaka",
        description: `Dvojna avtentikacija ni uspela.`,
        duration: 5000,
        variant: "destructive",
      });
    }

    setIsToggling(false);
  };

  const handleEmailTwoFactorToggle = async () => {
    if (!user) return;

    setIsTogglingEmail(true);

    const newState = !user.emailTwoFactorEnabled;
    const success = await toggleEmailTwoFactor(newState);

    if (success) {
      toast({
        title: `Email 2FA ${newState ? "omogočena" : "onemogočena"} uspešno.`,
        description: `Vaša nastavitev email dvojne avtentikacije je bila ${
          newState ? "omogočena" : "onemogočena"
        }.`,
        duration: 5000,
        variant: "default",
      });
    } else {
      toast({
        title: "Napaka",
        description: `Email dvojna avtentikacija ni uspela.`,
        duration: 5000,
        variant: "destructive",
      });
    }

    setIsTogglingEmail(false);
  };

  const testEmail = async () => {
    if (!user) return;

    setIsTestingEmail(true);

    try {
      const response = await fetch("/api/Auth/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Test email poslan!",
          description: `Test email je bil poslan na ${data.email}. Preverite svojo e-pošto.`,
          duration: 5000,
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Napaka",
          description: errorData.message || "Pošiljanje test emaila ni uspelo.",
          duration: 5000,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Napaka",
        description: "Napaka pri pošiljanju test emaila.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-[500px] min-h-screen pt-20">
      <Header />
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Nastavitve</CardTitle>
            <CardDescription>
              Upravljajte svoje varnostne nastavitve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">
                  Večfaktorska avtentikacija (MFA)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Povečajte varnost svojega računa
                </p>
              </div>
              <Switch
                checked={user?.twoFactorEnabled || false}
                onCheckedChange={handle2FAToggle}
                disabled={isToggling}
              />
            </div>

            {/* 2FA Methods - only show when 2FA is enabled */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                user?.twoFactorEnabled
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Email</h4>
                    <p className="text-xs text-muted-foreground">
                      Prejemajte kode preko e-pošte
                    </p>
                  </div>
                  <Switch
                    checked={user?.emailTwoFactorEnabled || false}
                    onCheckedChange={handleEmailTwoFactorToggle}
                    disabled={isTogglingEmail}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">
                      Aplikacija za avtentikacijo
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Uporabite aplikacijo za generiranje kod <br />
                      (Google Auth, Microsoft Auth)
                    </p>
                  </div>
                  <Switch
                    checked={false} // TODO: Connect to actual state
                    onCheckedChange={() => {}} // TODO: Add logic
                    disabled={false}
                  />
                </div>

                {/* Test Email Button - only show when email 2FA is enabled */}
                {user?.emailTwoFactorEnabled && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <h4 className="text-sm font-medium">Test Email</h4>
                      <p className="text-xs text-muted-foreground">
                        Pošljite test email za preveritev
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testEmail}
                      disabled={isTestingEmail}
                    >
                      {isTestingEmail ? "Pošiljam..." : "Test"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
