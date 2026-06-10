import { useMemo, useState, type FormEvent } from "react";
import { BarChart3, LockKeyhole, LogIn, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoSrc from "../../../assets/logo.png";
import { useAuth } from "../../../shared/auth/AuthContext";
import { Button, Input } from "../../../shared/ui";
import { ApiError } from "../../../infrastructure/api/api-error";
import { AuthPasswordField } from "../components/AuthPasswordField";
import { useLogin } from "../hooks/useLogin";
import { isAdminSession } from "../utils/auth-claims";
import "./AdminLoginPage.css";

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateLogin(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const session = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (!isAdminSession(session)) {
        setErrors({
          form: "This account is not authorized for the admin portal.",
        });
        return;
      }

      login(session);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrors({
        form:
          error instanceof ApiError || error instanceof Error
            ? error.message
            : "Unable to sign in. Please try again.",
      });
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand" aria-label="Finexa Admin">
        <div className="admin-login-brand__inner">
          <div className="admin-login-logo">
            <img src={logoSrc} alt="" className="admin-login-logo__mark" />
            <div>
              <p className="admin-login-logo__name">Finexa</p>
              <p className="admin-login-logo__label">Admin Portal</p>
            </div>
          </div>

          <div className="admin-login-copy">
            <h1>Welcome back</h1>
            <p>
              Sign in to access the Finexa Admin Panel and manage your financial data
              with power and clarity.
            </p>
          </div>

          <div className="admin-login-accent" aria-hidden="true" />

          <div className="admin-login-benefits">
            <article className="admin-login-benefit">
              <span className="admin-login-benefit__icon">
                <ShieldCheck size={25} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Enterprise Security</h2>
                <p>Industry-grade security keeps admin access protected.</p>
              </div>
            </article>

            <article className="admin-login-benefit">
              <span className="admin-login-benefit__icon">
                <BarChart3 size={25} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Real-Time Insights</h2>
                <p>Powerful operational reporting at your fingertips.</p>
              </div>
            </article>

            <article className="admin-login-benefit">
              <span className="admin-login-benefit__icon">
                <UserRound size={25} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Full Control</h2>
                <p>Manage users, categories, bills, and more with ease.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="admin-login-form-section" aria-label="Admin login form">
        <div className="admin-login-panel">
          <div className="admin-login-panel__header">
            <div className="admin-login-panel__icon" aria-hidden="true">
              <ShieldCheck size={54} strokeWidth={1.8} />
            </div>
            <h2>Admin Login</h2>
            <p>Enter your credentials to continue</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <p className="admin-login-alert" role="alert">
                {errors.form}
              </p>
            )}

            <div className="admin-login-field">
              <div className="admin-login-input-shell">
                <Mail size={21} strokeWidth={1.8} aria-hidden="true" />
                <Input
                  id="admin-login-email"
                  name="email"
                  type="email"
                  label="Email Address"
                  value={email}
                  placeholder="admin@finexa.com"
                  autoComplete="email"
                  disabled={loginMutation.isPending}
                  error={errors.email}
                  inputClassName="admin-login-input"
                  onChange={(event) => {
                    setEmail(event.currentTarget.value);
                    setErrors((current) => ({ ...current, email: undefined, form: undefined }));
                  }}
                />
              </div>
            </div>

            <div className="admin-login-field">
              <div className="admin-login-input-shell">
                <LockKeyhole size={21} strokeWidth={1.8} aria-hidden="true" />
                <AuthPasswordField
                  id="admin-login-password"
                  name="password"
                  label="Password"
                  value={password}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loginMutation.isPending}
                  error={errors.password}
                  onChange={(event) => {
                    setPassword(event.currentTarget.value);
                    setErrors((current) => ({ ...current, password: undefined, form: undefined }));
                  }}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loginMutation.isPending}
              className="admin-login-submit"
            >
              <LogIn size={20} strokeWidth={2} />
              Sign In
            </Button>
          </form>

          <p className="admin-login-footer">© {currentYear} Finexa. All rights reserved.</p>
        </div>
      </section>
    </main>
  );
}
