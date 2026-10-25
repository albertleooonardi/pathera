import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "./layout/AuthLayout";
import FormAlert from "./components/FormAlert";
import LoadingButton from "./components/ui/loading-button";
import { BASE_URL } from "./config/settings";

type ErrorRegister = {
  name?: string;
  email?: string;
  password?: string;
  cpassword?: string;
};

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");
  const [error, setError] = useState<ErrorRegister>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await axios.post(`${BASE_URL}/register`, {
        name: name,
        email: email,
        password: password,
        confirm_password: cpassword,
      });
      if (result.status === 201) {
        navigate("/login", {
          state: { ...(location.state as object | null), registered: true },
        });
      }
    } catch (error: unknown) {
      const fieldErrors =
        axios.isAxiosError(error) && error.response?.data?.errors;
      if (fieldErrors) {
        setError(fieldErrors);
      } else {
        console.error("An unexpected error occurred", error);
        setFormError(
          axios.isAxiosError(error) && !error.response
            ? "Can't reach the server. Check your connection and try again."
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Register"
      description="Create your account to start matching with roles and practicing interviews."
      footer={
        <>
          Been here before?{" "}
          <Link to="/login" state={location.state} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {formError && <FormAlert message={formError} />}
        <div>
          <label htmlFor="name" className="field-label">
            Name
          </label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Jane Doe"
            onChange={(e) => setName(e.target.value)}
          />
          {error.name && (
            <p className="mt-2 text-sm text-destructive">{error.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <Input
            id="email"
            type="text"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          {error.email && (
            <p className="mt-2 text-sm text-destructive">{error.email}</p>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
          <div>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cpassword" className="field-label">
              Confirm
            </label>
            <Input
              id="cpassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              onChange={(e) => setCpassword(e.target.value)}
            />
          </div>
        </div>
        {(error.password || error.cpassword) && (
          <div className="-mt-2 flex flex-col gap-1">
            {error.password && (
              <p className="text-sm text-destructive">{error.password}</p>
            )}
            {error.cpassword && (
              <p className="text-sm text-destructive">{error.cpassword}</p>
            )}
          </div>
        )}
        {submitting ? (
          <LoadingButton size="lg" className="mt-1 w-full" text="Creating account..." />
        ) : (
          <Button type="submit" size="lg" className="mt-1 w-full">
            Create account
          </Button>
        )}
      </form>
    </AuthLayout>
  );
}

export default Register;
