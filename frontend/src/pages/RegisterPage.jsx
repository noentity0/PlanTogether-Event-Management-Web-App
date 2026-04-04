import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setShowLoginHint(false);
    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/profile", { replace: true });
    } catch (requestError) {
      const status = requestError.response?.status;
      const detail = requestError.response?.data?.detail;

      if (status === 409) {
        setError(detail || "This email is already registered.");
        setShowLoginHint(true);
      } else if (!requestError.response) {
        setError(
          `Can't reach the backend right now. Make sure the API server is running on ${
            import.meta.env.VITE_BACKEND_URL || "http://localhost:8001"
          }.`
        );
      } else {
        setError(detail || "Unable to create your account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <div className="glass-panel rounded-[2rem] p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-accent-light">Join PlanTogether</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-textmuted">Add your name, sign up once, and start hosting or joining events in a few minutes.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-textmain" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              minLength="2"
              maxLength="80"
              required
              className="input-base"
              placeholder="Your full name"
            />
          </div>

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
              required
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
              minLength="6"
              value={form.password}
              onChange={handleChange}
              required
              className="input-base"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-light">
              {error}
              {showLoginHint && (
                <div className="mt-3">
                  <Link to="/login" className="font-semibold text-white underline underline-offset-4">
                    Already have an account? Sign in
                  </Link>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="button-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-textmuted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent-light">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
