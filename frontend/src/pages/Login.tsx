import { useState, type FormEvent } from "react";
import { login } from "../services/auth";

interface LoginProps {
  onLogin: () => Promise<void>;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.isSignedIn) {
        await onLogin();
        return;
      }

      setError(`Additional sign-in step required: ${result.nextStep.signInStep}`);
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
      </div>

      <main className="login-container">
        <section className="brand-panel">

          <div>
            <p className="eyebrow">CLOUD OPERATIONS</p>
            <h1>Nubora</h1>

            <p className="brand-description">
              A secure cloud-native workspace for managing IT operations,
              support tickets, and organizational assets.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature">
              <span>01</span>
              <div>
                <strong>Centralized operations</strong>
                <p>Tickets and assets in one workspace.</p>
              </div>
            </div>

            <div className="feature">
              <span>02</span>
              <div>
                <strong>Secure by design</strong>
                <p>Cognito authentication and role-based access.</p>
              </div>
            </div>

            <div className="feature">
              <span>03</span>
              <div>
                <strong>Built on AWS</strong>
                <p>Serverless infrastructure designed for the cloud.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-card">
            <div className="login-card-header">
              <div className="mobile-logo">
                
                <span>Nubora</span>
              </div>

              <p className="eyebrow">WELCOME BACK</p>
              <h2>Sign in to Nubora</h2>
              <p>Enter your account credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              {error && <div className="login-error">{error}</div>}

              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="security-note">
              <span className="status-dot" />
              Protected by Amazon Cognito
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}