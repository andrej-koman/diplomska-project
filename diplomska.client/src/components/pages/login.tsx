import { LoginForm } from "../login-form";
import { useState } from "react";

export default function Login() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const data = {
      email: form.email.value,
      password: form.password.value,
    };

    const submitButton = form.querySelector("button[type=submit]");
    submitButton?.setAttribute("disabled", "true");

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

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      setError("Prijava ni uspela. Poskusite ponovno.");
      submitButton?.removeAttribute("disabled");
    }
  };
  return (
    <>
      <LoginForm formOnSubmit={handleSubmit} error={error} />
    </>
  );
}
