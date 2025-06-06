import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import Header from "../header";

export default function Email2FA() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const { toast } = useToast();

  // Get email from location state (passed from login page)
  const email = location.state?.email;
  const rememberMe = location.state?.rememberMe || false;

  useEffect(() => {
    // Redirect to login if no email is provided
    if (!email) {
      navigate("/login");
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Napaka",
        description: "Prosimo vnesite 6-mestno kodo.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/Auth/verify-email-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: otp,
          rememberMe,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update user context with logged-in user data
        login(data.user);
        
        toast({
          title: "Uspešna prijava!",
          description: "Dobrodošli nazaj.",
          variant: "default",
        });

        // Redirect to home page
        navigate("/");
      } else {
        const errorData = await response.json();
        toast({
          title: "Napaka",
          description: errorData.message || "Neveljavna 2FA koda.",
          variant: "destructive",
        });
        setOtp(""); // Clear OTP input
      }
    } catch (error) {
      console.error("2FA verification error:", error);
      toast({
        title: "Napaka",
        description: "Napaka pri preverjanju 2FA kode.",
        variant: "destructive",
      });
      setOtp(""); // Clear OTP input
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      const response = await fetch("/api/Auth/resend-email-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (response.ok) {
        toast({
          title: "Koda poslana!",
          description: "Nova 2FA koda je bila poslana na vaš email.",
          variant: "default",
        });
        
        // Reset timer
        setTimeLeft(300);
        setOtp(""); // Clear current OTP
      } else {
        const errorData = await response.json();
        toast({
          title: "Napaka",
          description: errorData.message || "Pošiljanje kode ni uspelo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast({
        title: "Napaka",
        description: "Napaka pri pošiljanju kode.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    navigate("/login");
  };

  // Handle OTP completion automatically
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-6 w-[500px] min-h-screen pt-20">
      <Header />
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Email 2FA Verifikacija</CardTitle>
            <CardDescription>
              Vnesite 6-mestno kodo, ki ste jo prejeli na email{" "}
              <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Koda poteče čez: {" "}
                <span className="font-mono font-medium">
                  {formatTime(timeLeft)}
                </span>
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || otp.length !== 6}
                  className="w-full"
                >
                  {isVerifying ? "Preverjam..." : "Potrdi"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={isResending || timeLeft > 240} // Allow resend after 1 minute
                  className="w-full"
                >
                  {isResending ? "Pošiljam..." : "Pošlji novo kodo"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="w-full"
                >
                  Nazaj na prijavo
                </Button>
              </div>
            </div>

            {timeLeft === 0 && (
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm text-destructive">
                  Koda je potekla. Prosimo zahtevajte novo kodo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
