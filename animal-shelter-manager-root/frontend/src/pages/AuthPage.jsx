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
    role: "adopter",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
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
        headers: { "Content-Type": "application/json" },
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
  // SIGNUP
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Signup failed");
        return;
      }

      setMessage("Signup successful! You can now log in.");
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
        <h2 style={styles.title}>
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {/* ✅ SIGNUP-ONLY FIELDS */}
        {!isLogin ? (
          <div style={{ display: "flex", gap: "10px" }}>
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
        ) : null}

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
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="adopter">Adopter</option>
            <option value="staff">Staff</option>
            <option value="volunteer">Volunteer</option>
          </select>
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
            : "Sign Up"}
        </button>

        {message && (
          <p
            style={{
              ...styles.message,
              ...(message.toLowerCase().includes("successful")
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
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "320px",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },

  title: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#1a202c",
  },

  input: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    width: "100%",
  },

  select: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
  },

  button: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "white",
    fontWeight: "600",
  },

  message: {
    textAlign: "center",
    fontSize: "13px",
    color: "#ef4444",
  },

  success: {
    color: "#10b981",
  },

  toggle: {
    marginTop: "10px",
    fontSize: "12px",
    textAlign: "center",
    color: "#3b82f6",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};
