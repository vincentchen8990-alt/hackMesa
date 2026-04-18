import Link from "next/link";

export default function HomePage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1>HackMesa</h1>
        <p>Choose one page:</p>
        <div style={styles.links}>
          <Link href="/register">Register</Link>
          <Link href="/login">Login</Link>
        </div>
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
    background: "#f5f5f5",
  },
  card: {
    padding: "24px",
    borderRadius: "12px",
    background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  links: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    marginTop: "12px",
  },
};