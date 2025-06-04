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

export default function Settings() {
  const { user, toggle2FA } = useUser();
  const [isToggling, setIsToggling] = useState(false);
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

  return (
    <div className="flex flex-col justify-center items-center gap-6 w-[500px]">
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
                  Dvojna avtentikacija (2FA)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Povečajte varnost svojega računa z 2FA
                </p>
              </div>
              <Switch
                checked={user?.twoFactorEnabled || false}
                onCheckedChange={handle2FAToggle}
                disabled={isToggling}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
