import Link from "next/link";

export default function HomePage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay}>
        <div style={styles.card}>
          <span style={styles.dot1}></span>
          <span style={styles.dot2}></span>
          <span style={styles.square1}></span>
          <span style={styles.square2}></span>

          <h1 style={styles.title}>HackMesa</h1>
          <p style={styles.text}>Choose one page:</p>

          <div style={styles.links}>
            <Link href="/register" style={styles.linkBtn}>
              Register
            </Link>
            <Link href="/login" style={styles.linkBtn}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundImage: "url('/hackmesa-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },

  overlay: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0, 0, 0, 0.08)",
  },

  card: {
    position: "relative",
    overflow: "hidden",
    width: "420px",
    padding: "48px 32px",
    borderRadius: "24px",
    textAlign: "center",
    color: "white",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 12px 40px rgba(45, 25, 80, 0.25)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",

    backgroundColor: "rgba(110, 100, 145, 0.32)",
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))
    `,
    backgroundSize: "36px 36px, 36px 36px, cover",
    backgroundPosition: "0 0, 0 0, center",
  },

  title: {
    fontSize: "56px",
    fontWeight: "800",
    margin: "0 0 24px 0",
    letterSpacing: "0.5px",
  },

  text: {
    fontSize: "20px",
    marginBottom: "28px",
    color: "rgba(255,255,255,0.92)",
  },

  links: {
    display: "flex",
    gap: "18px",
    justifyContent: "center",
  },

  linkBtn: {
    padding: "14px 28px",
    borderRadius: "14px",
    textDecoration: "none",
    color: "white",
    fontSize: "18px",
    fontWeight: "600",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  },

  dot1: {
    position: "absolute",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "rgba(255, 120, 120, 0.7)",
    top: "26px",
    left: "26px",
  },

  dot2: {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "rgba(255, 210, 120, 0.7)",
    bottom: "24px",
    right: "28px",
  },

  square1: {
    position: "absolute",
    width: "12px",
    height: "12px",
    background: "rgba(255, 235, 100, 0.8)",
    top: "28px",
    right: "30px",
  },

  square2: {
    position: "absolute",
    width: "14px",
    height: "14px",
    background: "rgba(255, 120, 120, 0.7)",
    bottom: "28px",
    left: "32px",
  },
};