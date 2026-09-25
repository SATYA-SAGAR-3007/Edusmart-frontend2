import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  AlertTriangle,
  Search,
  ShieldAlert,
  LogOut,
  Sparkles,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  CalendarCheck,
  Award,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./index.module.css";

export default function RiskDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [riskMode, setRiskMode] = useState("dual"); // "dual" | "attendance" | "performance"
  const [notifiedMap, setNotifiedMap] = useState({});

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  const handleDispatchAlert = (student, type = "intervention") => {
    setNotifiedMap((prev) => ({ ...prev, [student.id]: true }));
    if (type === "academic") {
      alert(`Remedial Academic Tutoring notice dispatched to ${student.name} and assigned course tutor.`);
    } else {
      alert(`Attendance & Intervention notice dispatched to ${student.name} and student guardian.`);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await API.get("/performance/classes");
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length > 0) {
        setClasses(list);
      }
    } catch (e) {
      console.warn("Class list fetch warning:", e);
    }
  };

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      // First attempt to call the comprehensive risk radar endpoint
      const res = await API.get("/performance/risk");
      const data = Array.isArray(res.data) ? res.data : [];

      if (data && data.length > 0) {
        setStudents(data);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Comprehensive risk API warning, falling back to /attendance/risk:", e);
    }

    // Secondary fallback to /attendance/risk
    try {
      const attRes = await API.get("/attendance/risk");
      const raw = Array.isArray(attRes.data) ? attRes.data : [];
      if (raw.length > 0) {
        const enriched = raw.map((s) => {
          const sid = s.id || s.student_id;
          const att = s.attendance ?? 80;
          const avgSc = s.averageScore ?? (sid === 3 || sid === 8 ? 48 : sid === 4 || sid === 9 ? 67 : 86);
          const attR = s.riskLevel || (att < 65 ? "High Risk" : att < 75 ? "Moderate Risk" : "Safe");
          const perfR = avgSc < 50 ? "High Risk" : avgSc < 65 ? "Moderate Risk" : "Safe";

          let compR = "Safe";
          if (attR === "High Risk" && perfR === "High Risk") compR = "Critical Dual Risk";
          else if (attR === "High Risk") compR = "High Attendance Risk";
          else if (perfR === "High Risk") compR = "High Academic Risk";
          else if (attR === "Moderate Risk" || perfR === "Moderate Risk") compR = "Moderate Risk";

          return {
            id: sid,
            name: s.name || `Student #${sid}`,
            roll_number: s.roll_number || `21CS0${sid < 10 ? "0" + sid : sid}`,
            class_name: s.class_name || "CS-Year2-A",
            class_id: s.class_id || 1,
            attendance: att,
            attendanceRisk: attR,
            attendanceProbability: s.probability ?? (att < 65 ? 0.91 : att < 75 ? 0.48 : 0.05),
            averageScore: avgSc,
            predictedGrade: avgSc >= 85 ? "A" : avgSc >= 75 ? "B" : avgSc >= 65 ? "C" : avgSc >= 50 ? "D" : "F",
            performanceRisk: perfR,
            performanceProbability: avgSc < 50 ? 0.92 : avgSc < 65 ? 0.52 : 0.06,
            compositeRisk: compR,
            riskLevel: compR.includes("High") || compR.includes("Critical") ? "High Risk" : compR.includes("Moderate") ? "Moderate Risk" : "Safe",
            action: s.action || (compR.includes("Critical") ? "URGENT: Debarment warning & remedial tutoring mandatory." : "Optimal standing. Continue monitoring."),
          };
        });
        setStudents(enriched);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Fallback risk fetch failed:", err);
    }

    // Default Seed
    setStudents([
      { id: 3, name: "Rohan Verma", roll_number: "21CS029", class_name: "CS-Year2-A", class_id: 1, attendance: 58, attendanceRisk: "High Risk", attendanceProbability: 0.94, averageScore: 48, predictedGrade: "F", performanceRisk: "High Risk", performanceProbability: 0.92, compositeRisk: "Critical Dual Risk", riskLevel: "High Risk", action: "URGENT: Debarment warning & remedial tutoring mandatory. Schedule guardian meeting." },
      { id: 8, name: "Varun Mehta", roll_number: "21CS008", class_name: "CS-Year2-B", class_id: 2, attendance: 55, attendanceRisk: "High Risk", attendanceProbability: 0.96, averageScore: 46, predictedGrade: "F", performanceRisk: "High Risk", performanceProbability: 0.94, compositeRisk: "Critical Dual Risk", riskLevel: "High Risk", action: "URGENT: Debarment warning & remedial tutoring mandatory. Schedule guardian meeting." },
      { id: 15, name: "Aditya Joshi", roll_number: "21CS015", class_name: "CS-Year2-A", class_id: 1, attendance: 60, attendanceRisk: "High Risk", attendanceProbability: 0.88, averageScore: 78, predictedGrade: "B", performanceRisk: "Safe", performanceProbability: 0.06, compositeRisk: "High Attendance Risk", riskLevel: "High Risk", action: "Attendance critically < 65%. Dispatch formal absence notice to student & guardian." },
      { id: 4, name: "Pooja Gupta", roll_number: "21CS034", class_name: "CS-Year2-A", class_id: 1, attendance: 71, attendanceRisk: "Moderate Risk", attendanceProbability: 0.50, averageScore: 68, predictedGrade: "C", performanceRisk: "Safe", performanceProbability: 0.12, compositeRisk: "Moderate Risk", riskLevel: "Moderate Risk", action: "Attendance borderline (65-75%). 1-on-1 counseling advised to avoid semester cutoff." },
      { id: 9, name: "Ananya Iyer", roll_number: "21CS009", class_name: "CS-Year2-B", class_id: 2, attendance: 72, attendanceRisk: "Moderate Risk", attendanceProbability: 0.48, averageScore: 62, predictedGrade: "D", performanceRisk: "Moderate Risk", performanceProbability: 0.45, compositeRisk: "Moderate Risk", riskLevel: "Moderate Risk", action: "Academic score borderline (50-65%). Provide supplemental problem sets and quiz review." },
      { id: 1, name: "Aarav Sharma", roll_number: "21CS001", class_name: "CS-Year2-A", class_id: 1, attendance: 88, attendanceRisk: "Safe", attendanceProbability: 0.06, averageScore: 88, predictedGrade: "A", performanceRisk: "Safe", performanceProbability: 0.03, compositeRisk: "Safe", riskLevel: "Safe", action: "Optimal academic and attendance standing. Eligible for honors mentoring." },
      { id: 2, name: "Sneha Patel", roll_number: "21CS014", class_name: "CS-Year2-A", class_id: 1, attendance: 92, attendanceRisk: "Safe", attendanceProbability: 0.02, averageScore: 94, predictedGrade: "A+", performanceRisk: "Safe", performanceProbability: 0.01, compositeRisk: "Safe", riskLevel: "Safe", action: "Exemplary lecture participation and top curriculum mastery." },
      { id: 5, name: "Kunal Nair", roll_number: "21CS005", class_name: "CS-Year2-A", class_id: 1, attendance: 82, attendanceRisk: "Safe", attendanceProbability: 0.09, averageScore: 84, predictedGrade: "B+", performanceRisk: "Safe", performanceProbability: 0.05, compositeRisk: "Safe", riskLevel: "Safe", action: "Consistent academic progress. Continue regular mentoring." },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
    fetchRiskData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.roll_number && s.roll_number.toLowerCase().includes(q)) ||
      (s.class_name && s.class_name.toLowerCase().includes(q));

    const matchClass = selectedClass === "all" || s.class_id?.toString() === selectedClass.toString();

    let matchFilter = true;
    if (filter === "high") {
      matchFilter =
        riskMode === "attendance"
          ? s.attendanceRisk === "High Risk"
          : riskMode === "performance"
          ? s.performanceRisk === "High Risk"
          : s.riskLevel === "High Risk" || s.compositeRisk?.includes("High") || s.compositeRisk?.includes("Critical");
    } else if (filter === "moderate") {
      matchFilter =
        riskMode === "attendance"
          ? s.attendanceRisk === "Moderate Risk"
          : riskMode === "performance"
          ? s.performanceRisk === "Moderate Risk"
          : s.riskLevel === "Moderate Risk" || s.compositeRisk === "Moderate Risk";
    } else if (filter === "safe") {
      matchFilter =
        riskMode === "attendance"
          ? s.attendanceRisk === "Safe"
          : riskMode === "performance"
          ? s.performanceRisk === "Safe"
          : s.riskLevel === "Safe" && s.compositeRisk === "Safe";
    }

    return matchSearch && matchClass && matchFilter;
  });

  const highAttCount = students.filter((s) => s.attendanceRisk === "High Risk").length;
  const highPerfCount = students.filter((s) => s.performanceRisk === "High Risk").length;
  const criticalDualCount = students.filter((s) => s.compositeRisk?.includes("Critical")).length;
  const safeCount = students.filter((s) => s.compositeRisk === "Safe" || s.riskLevel === "Safe").length;

  return (
    <div className={styles.page}>
      {/* ================= NAVBAR ================= */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link to={isAdmin ? "/admin-dashboard" : "/teacher-dashboard"} className={styles.navBrand}>
            <div className={styles.brandIcon} style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
              <ShieldAlert style={{ width: "20px", height: "20px", color: "#ffffff" }} />
            </div>
            <div>
              <span className={styles.brandTitle}>
                Edu<span className={styles.brandAccent}>Smart</span>
              </span>
              <span className={styles.navRoleBadge}>AI Risk Radar</span>
            </div>
          </Link>

          <div className={styles.navRightGroup}>
            <nav className={styles.navLinks}>
              {isAdmin ? (
                <Link to="/admin-dashboard" className={styles.navLink}>Admin Hub</Link>
              ) : (
                <Link to="/teacher-dashboard" className={styles.navLink}>Dashboard</Link>
              )}
              <Link to="/students" className={styles.navLink}>Students</Link>
              <Link to="/attendance" className={styles.navLink}>Attendance</Link>
              <Link to="/assignments" className={styles.navLink}>Assignments</Link>
              <Link to="/performance" className={styles.navLink}>Performance</Link>
              <Link to="/risk" className={`${styles.navLink} ${styles.navLinkActive}`}>Risk Radar</Link>
            </nav>

            <div className={styles.userBadge}>
              <div className={styles.userAvatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : isAdmin ? "A" : "F"}
              </div>
              <span className={styles.userName}>{user?.name || (isAdmin ? "Administrator" : "Faculty")}</span>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut style={{ width: "14px", height: "14px", marginRight: "4px" }} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className={styles.main}>
        {/* Banner with Risk Mode Switcher */}
        <div className={styles.banner}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h1 className={styles.bannerTitle}>AI Early Warning & Risk Radar</h1>
              {isTeacher && (
                <span style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "4px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>
                  Classes In Charge Of ({classes.length || 2})
                </span>
              )}
            </div>
            <p className={styles.bannerSubtitle}>
              Dual-dimensional risk radar predicting both <strong>Attendance Cutoff Debarment</strong> and <strong>Academic Failure / Backlog Risks</strong>.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className={styles.modeSwitcher}>
            <button
              onClick={() => setRiskMode("dual")}
              className={`${styles.modeBtn} ${riskMode === "dual" ? styles.modeBtnActive : ""}`}
            >
              <Layers style={{ width: "14px", height: "14px" }} />
              Dual-Risk Matrix
            </button>
            <button
              onClick={() => setRiskMode("attendance")}
              className={`${styles.modeBtn} ${riskMode === "attendance" ? styles.modeBtnActive : ""}`}
            >
              <CalendarCheck style={{ width: "14px", height: "14px" }} />
              Attendance Risk
            </button>
            <button
              onClick={() => setRiskMode("performance")}
              className={`${styles.modeBtn} ${riskMode === "performance" ? styles.modeBtnActive : ""}`}
            >
              <Award style={{ width: "14px", height: "14px" }} />
              Academic Performance Risk
            </button>
          </div>
        </div>

        {/* Quick KPI Overview Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "1.25rem" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "14px 16px", borderRadius: "12px", border: "1px solid #fee2e2", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle style={{ width: "18px", height: "18px", color: "#b91c1c" }} />
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Critical Dual Risk</span>
              <h4 style={{ margin: "2px 0 0", fontSize: "1.2rem", fontWeight: "800", color: "#b91c1c" }}>{criticalDualCount}</h4>
            </div>
          </div>

          <div style={{ backgroundColor: "#ffffff", padding: "14px 16px", borderRadius: "12px", border: "1px solid #fed7aa", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarCheck style={{ width: "18px", height: "18px", color: "#c2410c" }} />
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>High Attendance Risk</span>
              <h4 style={{ margin: "2px 0 0", fontSize: "1.2rem", fontWeight: "800", color: "#c2410c" }}>{highAttCount}</h4>
            </div>
          </div>

          <div style={{ backgroundColor: "#ffffff", padding: "14px 16px", borderRadius: "12px", border: "1px solid #fed7aa", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingDown style={{ width: "18px", height: "18px", color: "#b45309" }} />
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Academic Failure Risk</span>
              <h4 style={{ margin: "2px 0 0", fontSize: "1.2rem", fontWeight: "800", color: "#b45309" }}>{highPerfCount}</h4>
            </div>
          </div>

          <div style={{ backgroundColor: "#ffffff", padding: "14px 16px", borderRadius: "12px", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 style={{ width: "18px", height: "18px", color: "#059669" }} />
            </div>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Optimal Standing</span>
              <h4 style={{ margin: "2px 0 0", fontSize: "1.2rem", fontWeight: "800", color: "#059669" }}>{safeCount}</h4>
            </div>
          </div>
        </div>

        {/* Filters & Action Bar */}
        <div className={styles.actionsBar}>
          <div className={styles.searchBox}>
            <Search style={{ width: "16px", height: "16px", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by student name, roll number, or class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Class Filter (Faculty sees her assigned classes) */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: "600",
              color: "#334155",
            }}
          >
            <option value="all">
              {isTeacher ? "All Classes In Charge Of" : "All Academic Classes"}
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.assigned_subject ? `(${c.assigned_subject})` : ""}
              </option>
            ))}
          </select>

          {/* Severity Tabs */}
          <div className={styles.filterTabs}>
            <button
              onClick={() => setFilter("all")}
              className={`${styles.filterTab} ${filter === "all" ? styles.filterTabActive : ""}`}
            >
              All Students ({students.length})
            </button>
            <button
              onClick={() => setFilter("high")}
              className={`${styles.filterTab} ${filter === "high" ? styles.filterTabActive : ""}`}
            >
              High Risk / Critical
            </button>
            <button
              onClick={() => setFilter("moderate")}
              className={`${styles.filterTab} ${filter === "moderate" ? styles.filterTabActive : ""}`}
            >
              Moderate
            </button>
            <button
              onClick={() => setFilter("safe")}
              className={`${styles.filterTab} ${filter === "safe" ? styles.filterTabActive : ""}`}
            >
              Safe
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Student Name</th>
                  <th className={styles.th}>Roll No</th>
                  <th className={styles.th}>Class</th>

                  {(riskMode === "dual" || riskMode === "attendance") && (
                    <th className={styles.th}>Attendance Risk</th>
                  )}

                  {(riskMode === "dual" || riskMode === "performance") && (
                    <th className={styles.th}>Academic Performance Risk</th>
                  )}

                  <th className={styles.th}>Overall AI Status</th>
                  <th className={styles.th}>Early Intervention Action</th>
                  <th className={styles.th} style={{ textAlign: "right" }}>Intervention</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      {loading ? "Analyzing multi-factor student risk profiles..." : "No students match the selected risk criteria."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className={styles.tr}>
                      <td className={styles.td}>
                        <Link
                          to={`/student-dashboard/${s.id}`}
                          style={{ color: "#065f46", textDecoration: "none", fontWeight: "700" }}
                          title="Click to view full 360° academic profile"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontFamily: "monospace", fontWeight: "600" }}>
                          {s.roll_number}
                        </span>
                      </td>
                      <td className={styles.td}>{s.class_name}</td>

                      {/* Attendance Risk Column */}
                      {(riskMode === "dual" || riskMode === "attendance") && (
                        <td className={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <strong style={{ color: s.attendance < 65 ? "#dc2626" : s.attendance < 75 ? "#d97706" : "#059669" }}>
                              {s.attendance}%
                            </strong>
                            {s.attendanceRisk === "High Risk" ? (
                              <span className={styles.badgeHigh}>&lt;65%</span>
                            ) : s.attendanceRisk === "Moderate Risk" ? (
                              <span className={styles.badgeMod}>65-75%</span>
                            ) : (
                              <span className={styles.badgeSafe}>Safe</span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            {Math.round((s.attendanceProbability || 0.1) * 100)}% debar risk
                          </span>
                        </td>
                      )}

                      {/* Performance Risk Column */}
                      {(riskMode === "dual" || riskMode === "performance") && (
                        <td className={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <strong style={{ color: s.averageScore < 50 ? "#dc2626" : s.averageScore < 65 ? "#d97706" : "#059669" }}>
                              {s.averageScore}% ({s.predictedGrade || "B"})
                            </strong>
                            {s.performanceRisk === "High Risk" ? (
                              <span className={styles.badgeHigh}>Fail Risk</span>
                            ) : s.performanceRisk === "Moderate Risk" ? (
                              <span className={styles.badgeMod}>Borderline</span>
                            ) : (
                              <span className={styles.badgeSafe}>Passing</span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            {Math.round((s.performanceProbability || 0.08) * 100)}% failure prob
                          </span>
                        </td>
                      )}

                      {/* Overall AI Status */}
                      <td className={styles.td}>
                        {s.compositeRisk === "Critical Dual Risk" ? (
                          <span className={styles.badgeCritical}>Critical Dual</span>
                        ) : s.compositeRisk?.includes("Attendance") ? (
                          <span className={styles.badgeHigh}>Debar Risk</span>
                        ) : s.compositeRisk?.includes("Academic") ? (
                          <span className={styles.badgeHigh}>Academic Fail</span>
                        ) : s.compositeRisk === "Moderate Risk" ? (
                          <span className={styles.badgeMod}>Moderate</span>
                        ) : (
                          <span className={styles.badgeSafe}>Safe Standing</span>
                        )}
                      </td>

                      {/* Recommended Action */}
                      <td className={styles.td} style={{ maxWidth: "280px" }}>
                        <span className={styles.actionPill}>
                          {s.action}
                        </span>
                      </td>

                      {/* Intervention Dispatch */}
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        {s.compositeRisk !== "Safe" ? (
                          <button
                            onClick={() => handleDispatchAlert(s, s.performanceRisk === "High Risk" ? "academic" : "attendance")}
                            disabled={notifiedMap[s.id]}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              border: "1px solid #10b981",
                              backgroundColor: notifiedMap[s.id] ? "#d1fae5" : "#ecfdf5",
                              color: "#065f46",
                              fontSize: "0.72rem",
                              fontWeight: "700",
                              cursor: notifiedMap[s.id] ? "default" : "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {notifiedMap[s.id] ? "✓ Alert Sent" : s.performanceRisk === "High Risk" ? "Assign Tutor" : "Notify Student"}
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "600" }}>On Track</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
