// File created/updated with help from chatgpt
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =======================
  // LOGIN
  // =======================
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setMessage("Please enter email and password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      navigate("/dashboard");

    } catch {
      setMessage("Login failed (server error)");
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // SIGNUP (Adopter Only)
  // =======================
  const handleSignup = async () => {
    if (!form.fname || !form.lname || !form.email || !form.password) {
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fname: form.fname,
          lname: form.lname,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Signup failed");
        return;
      }

      setMessage("Account created! You can now log in.");
      setIsLogin(true);

    } catch {
      setMessage("Signup failed (server error)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* APP TITLE */}
        <h1 style={styles.appTitle}>Animal Shelter Manager</h1>

        {/* SUBTITLE */}
        <p style={styles.subtitle}>
          {isLogin
            ? "Login to access your dashboard"
            : "Create an adopter account"}
        </p>

        {/* FORM TITLE */}
        <h2 style={styles.title}>
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {/* SIGNUP ONLY */}
        {!isLogin && (
          <div style={styles.nameRow}>
            <input
              name="fname"
              placeholder="First Name"
              value={form.fname}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              name="lname"
              placeholder="Last Name"
              value={form.lname}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        )}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
        />

        {!isLogin && (
          <p style={styles.note}>
            Public registration creates adopter accounts only.
          </p>
        )}

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
          onClick={isLogin ? handleLogin : handleSignup}
        >
          {loading
            ? "Please wait..."
            : isLogin
            ? "Login"
            : "Create Account"}
        </button>

        {message && (
          <p
            style={{
              ...styles.message,
              ...(message.toLowerCase().includes("created") ||
              message.toLowerCase().includes("login successful")
                ? styles.success
                : {}),
            }}
          >
            {message}
          </p>
        )}

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
          }}
          style={styles.toggle}
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </button>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  container: {
    width: "380px",
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  appTitle: {
    margin: 0,
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a202c",
  },

  subtitle: {
    margin: 0,
    textAlign: "center",
    fontSize: "14px",
    color: "#718096",
  },

  title: {
    margin: "8px 0 4px 0",
    textAlign: "center",
    fontSize: "22px",
    color: "#1a202c",
  },

  nameRow: {
    display: "flex",
    gap: "10px",
  },

  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "white",
    fontWeight: "700",
    fontSize: "14px",
  },

  note: {
    margin: 0,
    fontSize: "12px",
    color: "#718096",
    textAlign: "center",
  },

  message: {
    margin: 0,
    textAlign: "center",
    fontSize: "13px",
    color: "#ef4444",
  },

  success: {
    color: "#10b981",
  },

  toggle: {
    marginTop: "4px",
    border: "none",
    background: "none",
    color: "#3b82f6",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
};