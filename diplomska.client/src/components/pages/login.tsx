import { LoginForm } from "../login-form";

export default function Login() {
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
    <>
      <LoginForm
        formOnSubmit={handleSubmit}
      />
    </>
  );
}
