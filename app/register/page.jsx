"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      setMessage("Register successful. You are logged in now.");
    } else {
      setMessage("Register successful. Please check your email.");
    }

    setLoading(false);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <p style={styles.brand}>HACKMESA</p>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>
          Join the platform to explore greener areas and smarter city data.
        </p>

        <form onSubmit={handleRegister} style={styles.form}>
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.loginText}>
          Already have an account?{" "}
          <Link href="/login" style={styles.loginLink}>
            Go to Login
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
    backgroundImage: "url('/city-bg.png')",
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
  loginText: {
    marginTop: "22px",
    fontSize: "15px",
    color: "#60756a",
  },
  loginLink: {
    color: "#2f7d4f",
    fontWeight: "700",
    textDecoration: "none",
  },
};