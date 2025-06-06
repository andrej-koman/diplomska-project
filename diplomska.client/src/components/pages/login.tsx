import { LoginForm } from "../login-form";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const data = {
      email: form.email.value,
      password: form.password.value,
      rememberMe: form.rememberMe?.checked || false,
    };

    const submitButton = form.querySelector("button[type=submit]");
    submitButton?.setAttribute("disabled", "true");
    setError(null);

    try {
      const response = await fetch("/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Login failed");
      }

      // Check if email 2FA is required
      if (responseData.requiresEmailTwoFactor) {
        // Redirect to 2FA page with email and rememberMe state
        navigate("/email-2fa", {
          state: {
            email: responseData.email,
            rememberMe: data.rememberMe,
          },
        });
        return;
      }

      // Normal login success - redirect to home
      if (responseData.success) {
        window.location.href = "/";
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Prijava ni uspela. Poskusite ponovno.";
      setError(errorMessage);
      submitButton?.removeAttribute("disabled");
    }
  };

  return (
    <>
      <LoginForm formOnSubmit={handleSubmit} error={error} />
    </>
  );
}
