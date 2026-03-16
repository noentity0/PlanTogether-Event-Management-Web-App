import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      const destination = location.state?.from?.pathname || "/profile";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <div className="glass-panel rounded-[2rem] p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-accent-light">Welcome back</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Sign in to PlanTogether</h1>
        <p className="mt-3 text-sm leading-6 text-textmuted">Access your dashboard, create events, and manage everything you host.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input-base"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="input-base"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-light">
              {error}
            </div>
          )}

          <button type="submit" className="button-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-textmuted">
          New here?{" "}
          <Link to="/register" className="font-semibold text-accent-light">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
