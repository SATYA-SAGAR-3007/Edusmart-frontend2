import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./index.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const initialRole = searchParams.get("role") || "student";
  const [role, setRole] = useState(initialRole);

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const storedRole = localStorage.getItem("role");
      let storedUser = null;
      try {
        storedUser = JSON.parse(localStorage.getItem("user") || "null");
      } catch (e) {}

      if (storedRole === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (storedRole === "teacher") {
        navigate("/teacher-dashboard", { replace: true });
      } else if (storedRole === "student") {
        const sId = storedUser?.id;
        navigate(sId ? `/student-dashboard/${sId}` : "/student-dashboard", { replace: true });
      } else {
        navigate("/student-dashboard", { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    const qRole = searchParams.get("role");
    if (qRole && ["student", "teacher", "admin"].includes(qRole)) {
      setRole(qRole);
    }
  }, [searchParams]);

  const fillDemo = (demoRole) => {
    setRole(demoRole);
    setErrorMsg("");
    if (demoRole === "admin") {
      setUsernameOrEmail("admin@edusmart.edu");
      setPassword("admin123");
    } else if (demoRole === "teacher") {
      setUsernameOrEmail("faculty@edusmart.edu");
      setPassword("faculty123");
    } else {
      setUsernameOrEmail("student@edusmart.edu");
      setPassword("student123");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!usernameOrEmail || !password) {
      setErrorMsg("Please enter your credentials.");
      return;
    }

    setLoading(true);

    try {
      let endpoint = "";
      let payload = {};

      if (role === "admin") {
        endpoint = "/admin/login";
        payload = { username: usernameOrEmail, password };
      } else if (role === "teacher") {
        endpoint = "/auth/teacher-login";
        payload = { username: usernameOrEmail, password };
      } else {
        endpoint = "/auth/student-login";
        payload = { email: usernameOrEmail, password };
      }

      const res = await API.post(endpoint, payload);
      const { token, admin, teacher, student } = res.data;
      const userData = admin || teacher || student || { role };

      login(token, userData, role);

      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        const studentId = student?.id || userData?.id || 1;
        navigate(`/student-dashboard/${studentId}`);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid login credentials. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.backgroundGlow}></div>

      {/* Top Header */}
      <header className={styles.topNav}>
        <Link to="/" className={styles.brand}>
          <div className={styles.brandIconBox}>
            <GraduationCap style={{ width: "20px", height: "20px", color: "#ffffff" }} />
          </div>
          <span className={styles.brandTitle}>
            Edu<span className={styles.brandAccent}>Smart</span>
          </span>
        </Link>
        <Link to="/" className={styles.backHomeLink}>
          Back to Home
        </Link>
      </header>

      {/* Card Wrapper */}
      <main className={styles.cardWrapper}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Welcome Back</h2>
            <p className={styles.subtitle}>Select your portal to sign in to EduSmart</p>
          </div>

          {/* Role Tabs */}
          <div className={styles.roleSelector}>
            <button
              type="button"
              onClick={() => {
                setRole("student");
                setErrorMsg("");
              }}
              className={`${styles.roleBtn} ${role === "student" ? styles.roleBtnActive : ""}`}
            >
              <GraduationCap style={{ width: "16px", height: "16px" }} />
              Student
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("teacher");
                setErrorMsg("");
              }}
              className={`${styles.roleBtn} ${role === "teacher" ? styles.roleBtnActive : ""}`}
            >
              <BookOpen style={{ width: "16px", height: "16px" }} />
              Faculty
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setErrorMsg("");
              }}
              className={`${styles.roleBtn} ${role === "admin" ? styles.roleBtnActive : ""}`}
            >
              <ShieldCheck style={{ width: "16px", height: "16px" }} />
              Admin
            </button>
          </div>

          {/* Quick Demo Fill Box */}
          <div className={styles.demoFillBox}>
            <span className={styles.demoFillText}>
              Need test access for <strong>{role === "admin" ? "Admin" : role === "teacher" ? "Faculty" : "Student"}</strong>?
            </span>
            <button
              type="button"
              onClick={() => fillDemo(role)}
              className={styles.demoFillBtn}
            >
              <Sparkles style={{ width: "12px", height: "12px" }} />
              Fill Demo
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className={styles.errorAlert}>
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {role === "student" ? "Institutional Email" : "Username or Email"}
              </label>
              <div className={styles.inputWrapper}>
                {role === "student" ? (
                  <Mail className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                ) : (
                  <User className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                )}
                <input
                  type={role === "student" ? "email" : "text"}
                  required
                  placeholder={
                    role === "student"
                      ? "student@edusmart.edu"
                      : role === "teacher"
                      ? "faculty@edusmart.edu"
                      : "admin@edusmart.edu"
                  }
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  Sign In to {role === "admin" ? "Admin" : role === "teacher" ? "Faculty" : "Student"}
                  <ArrowRight style={{ width: "18px", height: "18px" }} />
                </>
              )}
            </button>
          </form>

          <p className={styles.footerNote}>
            Don't have an account?
            <Link to={`/signup?role=${role}`} className={styles.signupLink}>
              Create one now
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
