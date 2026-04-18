"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Login successful.");
    console.log("session:", data.session);
    setLoading(false);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <p style={styles.brand}>HACKMESA</p>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>
          Log in to continue exploring greener areas and smarter city data.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.registerText}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={styles.registerLink}>
            Go to Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    backgroundImage: "url('/login-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    padding: "42px 38px",
    borderRadius: "28px",
    background: "#ffffff",
    boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
  },
  brand: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#5aa173",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "54px",
    lineHeight: "1.02",
    fontWeight: "800",
    color: "#1f563d",
  },
  subtitle: {
    margin: "0 0 28px 0",
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#60756a",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#28533f",
  },
  input: {
    padding: "16px 18px",
    borderRadius: "18px",
    border: "1px solid #d5e5da",
    fontSize: "16px",
    outline: "none",
    background: "#ffffff",
    color: "#234534",
  },
  button: {
    marginTop: "8px",
    padding: "17px",
    borderRadius: "18px",
    border: "none",
    background: "linear-gradient(135deg, #56b374 0%, #2f7d4f 100%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(47, 125, 79, 0.28)",
  },
  message: {
    marginTop: "18px",
    fontSize: "14px",
    color: "#24523d",
  },
  registerText: {
    marginTop: "22px",
    fontSize: "15px",
    color: "#60756a",
  },
  registerLink: {
    color: "#2f7d4f",
    fontWeight: "700",
    textDecoration: "none",
  },
};