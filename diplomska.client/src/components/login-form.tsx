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
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const data = {
      email: form.email.value,
      password: form.password.value,
    };

    // disable submit button
    const submitButton = form.querySelector("button[type=submit]");
    submitButton?.setAttribute("disabled", "true");

    // send login request
    try {
      const response = await fetch("/login?useCookies=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.log(response.status + " " + response.statusText);
        throw new Error("Login failed");
      }

      // redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      // show error message
      console.error(error);
    }
  };
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
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="p@primer.si"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Geslo</Label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Prijava
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
