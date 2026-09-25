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
  Building,
  Calendar,
  Hash,
  CheckCircle,
  Briefcase,
  Layers,
} from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./index.module.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const initialRole = searchParams.get("role") || "student";
  const [role, setRole] = useState(initialRole);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    department: "Computer Science & Engineering",
    year: "1",
    roll_number: "",
    designation: "Assistant Professor",
    adminRole: "super_admin",
    orgMode: "new", // "new" or "existing"
    organization_name: "",
    organization_code: "",
    organization_id: "",
  });

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect to dashboard immediately if token is already in browser storage
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

  useEffect(() => {
    if (role === "admin") {
      fetchOrganizations();
    }
  }, [role]);

  const fetchOrganizations = async () => {
    try {
      const res = await API.get("/admin/organizations");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setOrganizations(res.data);
      }
    } catch (e) {
      console.warn("Could not fetch organizations:", e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "orgMode") {
      setForm((prev) => ({
        ...prev,
        orgMode: value,
        // Automatically assign superior role (super_admin) when creating a new institute
        adminRole: value === "new" ? "super_admin" : "admin",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.name || !form.email || !form.password) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    if (role === "admin" && form.orgMode === "new" && !form.organization_name.trim()) {
      setErrorMsg("Please provide an Institution/Organization name for your 1-to-1 administrative link.");
      return;
    }

    setLoading(true);

    try {
      let res;
      if (role === "student") {
        res = await API.post("/auth/student-signup", {
          name: form.name,
          email: form.email,
          password: form.password,
          department: form.department,
          year: form.year,
          roll_number: form.roll_number || `STU-${Date.now().toString().slice(-4)}`,
        });
        const { token, student } = res.data;
        if (token) {
          login(token, student || { name: form.name, email: form.email }, "student");
          setSuccessMsg("Account created! Navigating to your dashboard...");
          setTimeout(() => {
            navigate(student?.id ? `/student-dashboard/${student.id}` : "/student-dashboard", { replace: true });
          }, 400);
          return;
        }
      } else if (role === "teacher") {
        res = await API.post("/auth/teacher-signup", {
          name: form.name,
          email: form.email,
          username: form.username || form.email.split("@")[0],
          password: form.password,
          department: form.department,
          designation: form.designation,
        });
        const { token, teacher } = res.data;
        if (token) {
          login(token, teacher || { name: form.name, email: form.email }, "teacher");
          setSuccessMsg("Account created! Navigating to your faculty dashboard...");
          setTimeout(() => {
            navigate("/teacher-dashboard", { replace: true });
          }, 400);
          return;
        }
      } else {
        // Admin Signup with 1-to-1 Organization Link and Role
        res = await API.post("/admin/signup", {
          name: form.name,
          email: form.email,
          username: form.username || form.email.split("@")[0],
          password: form.password,
          role: form.orgMode === "new" ? "super_admin" : (form.adminRole || "admin"),
          organization_name: form.orgMode === "new" ? form.organization_name : undefined,
          organization_code: form.orgMode === "new" ? form.organization_code : undefined,
          organization_id: form.orgMode === "existing" ? form.organization_id : undefined,
        });
        const { token, admin } = res.data;
        if (token) {
          login(token, admin || { name: form.name, email: form.email }, "admin");
          setSuccessMsg("Account created! Navigating to your administration dashboard...");
          setTimeout(() => {
            navigate("/admin-dashboard", { replace: true });
          }, 400);
          return;
        }
      }

      setSuccessMsg("Account registered successfully! Redirecting...");
      setTimeout(() => {
        navigate(role === "admin" ? "/admin-dashboard" : role === "teacher" ? "/teacher-dashboard" : "/student-dashboard", { replace: true });
      }, 500);
    } catch (err) {
      console.error("Signup failed:", err);
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please check your information."
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
            <h2 className={styles.title}>Create Account</h2>
            <p className={styles.subtitle}>Join the EduSmart Academic Ecosystem</p>
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

          {errorMsg && (
            <div className={styles.alertError}>
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className={styles.alertSuccess}>
              <CheckCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Dr. John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@edusmart.edu"
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            {role !== "student" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Username</label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                  <input
                    type="text"
                    name="username"
                    placeholder="e.g. jdoe_admin"
                    value={form.username}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Student Specific Fields */}
            {role === "student" && (
              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Roll / Reg Number</label>
                  <div className={styles.inputWrapper}>
                    <Hash className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                    <input
                      type="text"
                      name="roll_number"
                      placeholder="e.g. 21CS042"
                      value={form.roll_number}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Academic Year</label>
                  <div className={styles.inputWrapper}>
                    <Calendar className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                    <select
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Faculty Specific Fields */}
            {role === "teacher" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Academic Designation</label>
                <div className={styles.inputWrapper}>
                  <Briefcase className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                  <select
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Head of Department">Head of Department (HOD)</option>
                    <option value="Lecturer">Lecturer / Adjunct Faculty</option>
                  </select>
                </div>
              </div>
            )}

            {/* Department field for Students & Faculty */}
            {role !== "admin" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Department</label>
                <div className={styles.inputWrapper}>
                  <Building className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
              </div>
            )}

            {/* ================= ADMIN SPECIFIC FIELDS (1:1 Organization & Role) ================= */}
            {role === "admin" && (
              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "14px", marginTop: "6px" }}>
                {/* 1. 1-to-1 Organization Linking Mode */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Institution / Organization (Strict 1-to-1 Link)
                  </label>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: "700", color: form.orgMode === "new" ? "#065f46" : "#475569", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="orgMode"
                        value="new"
                        checked={form.orgMode === "new"}
                        onChange={handleChange}
                      />
                      Register New Institution (Superior Role)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: "600", color: form.orgMode === "existing" ? "#065f46" : "#475569", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="orgMode"
                        value="existing"
                        checked={form.orgMode === "existing"}
                        onChange={handleChange}
                      />
                      Link Existing Organization
                    </label>
                  </div>

                  {form.orgMode === "new" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                      <input
                        type="text"
                        name="organization_name"
                        placeholder="e.g. Imperial Institute of Technology"
                        value={form.organization_name}
                        onChange={handleChange}
                        className={styles.input}
                        required={role === "admin" && form.orgMode === "new"}
                      />
                      <input
                        type="text"
                        name="organization_code"
                        placeholder="Code (e.g. IIT)"
                        value={form.organization_code}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                  ) : (
                    <div className={styles.inputWrapper}>
                      <Building className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                      <select
                        name="organization_id"
                        value={form.organization_id}
                        onChange={handleChange}
                        className={styles.select}
                        required={role === "admin" && form.orgMode === "existing"}
                      >
                        <option value="">-- Choose an Organization --</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            #{org.id} {org.name} {org.admin_name ? `(Managed by: ${org.admin_name})` : "(Unassigned)"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 2. Admin Role (Superior Role auto-granted for New Institution) */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Administrative Designation / Role
                  </label>

                  {form.orgMode === "new" ? (
                    <div>
                      <div className={styles.inputWrapper} style={{ backgroundColor: "#f0fdf4", borderColor: "#86efac" }}>
                        <ShieldCheck className={styles.inputIcon} style={{ width: "18px", height: "18px", color: "#16a34a" }} />
                        <input
                          type="text"
                          readOnly
                          value="System Super Administrator / Chancellor (Superior Role)"
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            fontSize: "0.82rem",
                            fontWeight: "700",
                            color: "#166534",
                            cursor: "default",
                            outline: "none",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#15803d", marginTop: "4px", display: "block", fontWeight: "600" }}>
                        👑 Superior Role Granted: As the founder of a new institution, you are automatically designated as Super Administrator / Chancellor.
                      </span>
                    </div>
                  ) : (
                    <div className={styles.inputWrapper}>
                      <ShieldCheck className={styles.inputIcon} style={{ width: "18px", height: "18px" }} />
                      <select
                        name="adminRole"
                        value={form.adminRole}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        <option value="admin">Academic Administrator / Registrar</option>
                        <option value="principal">Campus Principal / Director</option>
                        <option value="dean">Academic Dean</option>
                        <option value="super_admin">System Super Administrator / Chancellor</option>
                      </select>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "4px", display: "block" }}>
                  {form.orgMode === "new"
                    ? "Creating a new institution will establish an exclusive 1-to-1 administrative governance link."
                    : "Note: Each organization strictly accepts only one designated administrator."}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Register as {role === "admin" ? "Administrator" : role === "teacher" ? "Faculty" : "Student"}
                  <ArrowRight style={{ width: "18px", height: "18px" }} />
                </>
              )}
            </button>
          </form>

          <p className={styles.footerNote}>
            Already registered?
            <Link to={`/login?role=${role}`} className={styles.loginLink}>
              Sign In here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
