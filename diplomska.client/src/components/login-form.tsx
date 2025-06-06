import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  formOnSubmit,
  error,
  className,
  ...props
}: {
  formOnSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  error: string | null;
} & React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-6 w-[350px]", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Prijavni obrazec</CardTitle>
          <CardDescription className="text-xs">
            Vpišite vaše podatke za prijavo v sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formOnSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="p@primer.si"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Geslo</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required 
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Zapomni si me
                </Label>
              </div>
              <Button type="submit" className="w-full">
                Prijava
              </Button>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
