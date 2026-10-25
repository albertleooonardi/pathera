import { useState } from "react";
import AuthLayout from "./layout/AuthLayout";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import LoadingButton from "./components/ui/loading-button";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { BASE_URL } from "./config/settings";
import FormAlert from "./components/FormAlert";

type LoginError = {
  email?: string;
  password?: string;
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginError>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, fetchUser, loading] = useUser();
  const routeState = location.state as
    | { from?: string; registered?: boolean }
    | null;
  const redirectTo = routeState?.from || "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError({});
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await axios.post(
        `${BASE_URL}/login`,
        {
          email: email,
          password: password,
        },
        { withCredentials: true }
      );
      if (result.status === 200) {
        localStorage.setItem("token", result.data.token);
        // Wait for the user so protected pages don't bounce back to login.
        await fetchUser();
        navigate(redirectTo, { replace: true });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ errors?: LoginError }>;
        const fieldErrors = axiosError.response?.data?.errors;
        if (fieldErrors) {
          setError(fieldErrors);
        } else {
          setFormError(
            axiosError.response
              ? "Something went wrong. Please try again."
              : "Can't reach the server. Check your connection and try again."
          );
        }
      } else {
        console.error("An unexpected error occurred", err);
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user && !submitting) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <AuthLayout
      title="Sign in"
      description={
        redirectTo !== "/"
          ? "Sign in to continue to the page you were opening."
          : "Welcome back. Enter your details to sign in to your account."
      }
      footer={
        <>
          Don’t have an account?{" "}
          <Link
            to="/register"
            state={location.state}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {routeState?.registered && !formError && (
          <FormAlert tone="success" message="Account created. Sign in to get started." />
        )}
        {formError && <FormAlert message={formError} />}
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="text"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!error.email}
            aria-describedby={error.email ? "email-error" : undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error.email && (
            <p id="email-error" className="mt-2 text-sm text-destructive">
              {error.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!error.password}
            aria-describedby={error.password ? "password-error" : undefined}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error.password && (
            <p id="password-error" className="mt-2 text-sm text-destructive">
              {error.password}
            </p>
          )}
        </div>
        {submitting ? (
          <LoadingButton size="lg" className="mt-1 w-full" text="Signing in..." />
        ) : (
          <Button type="submit" size="lg" className="mt-1 w-full">
            Sign in
          </Button>
        )}
      </form>
    </AuthLayout>
  );
}

export default Login;
