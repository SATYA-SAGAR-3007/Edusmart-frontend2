import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  Brain,
  ShieldCheck,
  Users,
  BookOpen,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  BarChart3,
  Award,
} from "lucide-react";
import styles from "./index.module.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("student");
  const [authData, setAuthData] = useState({ isAuthenticated: false, dashboardPath: "/student-dashboard" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const role = localStorage.getItem("role");
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem("user") || "null");
      } catch (e) {}

      let targetPath = "/student-dashboard";
      if (role === "admin") {
        targetPath = "/admin-dashboard";
      } else if (role === "teacher") {
        targetPath = "/teacher-dashboard";
      } else if (role === "student") {
        targetPath = user?.id ? `/student-dashboard/${user.id}` : "/student-dashboard";
      }
      setAuthData({ isAuthenticated: true, dashboardPath: targetPath });
    } else {
      setAuthData({ isAuthenticated: false, dashboardPath: "/login" });
    }
  }, []);

  const { isAuthenticated, dashboardPath } = authData;

  const portalContent = {
    student: {
      role: "Student",
      title: "Personalized Learning & Performance Forecaster",
      badge: "Student Hub",
      icon: <GraduationCap style={{ width: "24px", height: "24px", color: "#10b981" }} />,
      description:
        "Access real-time lecture attendance records, view AI score projections, track homework assignments, and receive early alerts on weak subject topics.",
      features: [
        "AI-predicted exam grades based on attendance & homework",
        "Subject-wise understanding ratings (Bad to Excellent)",
        "Daily attendance streak tracking & risk alerts",
        "Interactive progress charts and deadline calendar",
      ],
      ctaText: "Open Student Portal",
      ctaLink: "/login?role=student",
      demoCred: "student@edusmart.edu / student123",
      accent: "#10b981",
      previewItems: [
        { label: "Data Structures & Algorithms", badge: "Good", val: "88% Avg" },
        { label: "Database Management Systems", badge: "Better", val: "92% Avg" },
        { label: "Attendance Forecast", badge: "Safe", val: "94% Attendance" },
      ],
    },
    teacher: {
      role: "Faculty",
      title: "Class Orchestration & Subject Mastery Insights",
      badge: "Teacher Portal",
      icon: <BookOpen style={{ width: "24px", height: "24px", color: "#059669" }} />,
      description:
        "Manage allocated class subjects, grade assignments with automated aggregations, take digital attendance, and run AI predictive understanding assessments.",
      features: [
        "One-click batch attendance with automatic risk grouping",
        "Class subject understanding distribution (5-tier AI model)",
        "Assignment creator with score tracking & feedback",
        "Direct visibility into at-risk students needing intervention",
      ],
      ctaText: "Open Faculty Portal",
      ctaLink: "/login?role=teacher",
      demoCred: "faculty@edusmart.edu / faculty123",
      accent: "#059669",
      previewItems: [
        { label: "CS-Year2-A (DSA)", badge: "28 Students", val: "84% Avg Att" },
        { label: "At-Risk Flagged", badge: "2 Students", val: "Attendance < 65%" },
        { label: "Homework 3 Submissions", badge: "Active", val: "26 / 28 Graded" },
      ],
    },
    admin: {
      role: "Administration",
      title: "Institutional Governance & Curriculum Allocations",
      badge: "Administration Hub",
      icon: <ShieldCheck style={{ width: "24px", height: "24px", color: "#065f46" }} />,
      description:
        "Oversee the entire institution: assign and replace subject teachers, allocate classes, monitor cross-subject class performance, and manage academic departments.",
      features: [
        "Assign & replace teachers for class subjects with cascading enrollments",
        "Single-class student roster enforcement & seamless transfers",
        "Class 360° analytics across all subjects & teachers",
        "Full institutional KPIs, department & subject management",
      ],
      ctaText: "Open Administration Portal",
      ctaLink: "/login?role=admin",
      demoCred: "admin@edusmart.edu / admin123",
      accent: "#065f46",
      previewItems: [
        { label: "Institutional Enrollment", badge: "Active", val: "1,240 Enrolled" },
        { label: "Faculty Allocated", badge: "98% Taught", val: "48 Subjects" },
        { label: "Cascading Sync", badge: "Real-time", val: "MySQL Relational" },
      ],
    },
  };

  const activePortal = portalContent[activeTab];

  return (
    <div className={styles.wrapper}>
      {/* ================= NAVBAR ================= */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.brand}>
            <div className={styles.brandIconBox}>
              <GraduationCap style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
            <div>
              <span className={styles.brandTitle}>
                Edu<span className={styles.brandAccent}>Smart</span>
              </span>
              <span className={styles.brandBadge}>v2.0</span>
            </div>
          </Link>

          <div className={styles.navRightWrapper}>
            <div className={styles.navLinks}>
              <a href="#features" className={styles.navLink}>Platform Features</a>
              <a href="#portals" className={styles.navLink}>Portals</a>
              <a href="#ai-engine" className={styles.navLink}>AI Intelligence</a>
            </div>

            <div className={styles.navActions}>
              {isAuthenticated ? (
                <Link to={dashboardPath} className={styles.getStartedBtn}>
                  Go to Dashboard <ArrowRight style={{ width: "16px", height: "16px" }} />
                </Link>
              ) : (
                <>
                  <Link to="/login" className={styles.signInBtn}>Sign In</Link>
                  <Link to="/signup" className={styles.getStartedBtn}>
                    Get Started <ArrowRight style={{ width: "16px", height: "16px" }} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <header className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.badgeHero}>
            <Sparkles style={{ width: "16px", height: "16px", color: "#10b981" }} />
            AI-Powered Academic Intelligence & Early Intervention Platform
          </div>

          <h1 className={styles.heroTitle}>
            Next-Gen Academic Management with{" "}
            <span className={styles.heroGradientText}>Intelligent AI Forecasting</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Empowering students, faculty, and academic administrations with real-time attendance risk warnings, exam grade projections, and automated curriculum management.
          </p>

          <div className={styles.heroCtas}>
            {isAuthenticated ? (
              <Link to={dashboardPath} className={styles.primaryCta} style={{ minWidth: "220px", justifyContent: "center" }}>
                Go to Dashboard <ArrowRight style={{ width: "18px", height: "18px" }} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className={styles.primaryCta}>
                  Explore EduSmart Free <ArrowRight style={{ width: "18px", height: "18px" }} />
                </Link>
                <Link to="/login" className={styles.secondaryCta}>
                  Sign In to Your Portal
                </Link>
              </>
            )}
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>96.4%</span>
              <span className={styles.statLabel}>Risk Prediction Accuracy</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>5-Tier</span>
              <span className={styles.statLabel}>Subject Understanding Model</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>100%</span>
              <span className={styles.statLabel}>Cascading Sync</span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= PORTALS SECTION ================= */}
      <section id="portals" className={styles.portalsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Role-Based Ecosystem</span>
          <h2 className={styles.sectionTitle}>Tailored Portals for Every Stakeholder</h2>
          <p className={styles.sectionSubtitle}>
            Dedicated workspaces purpose-built for students, professors, and academic administrators.
          </p>
        </div>

        <div className={styles.tabsWrapper}>
          <div className={styles.tabList}>
            {Object.keys(portalContent).map((key) => {
              const item = portalContent[key];
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
                >
                  {item.icon}
                  {item.role} Portal
                </button>
              );
            })}
          </div>

          <div className={styles.tabContentCard}>
            <div className={styles.tabContentLeft}>
              <span
                className={styles.tabRoleBadge}
                style={{ backgroundColor: "#ecfdf5", color: activePortal.accent }}
              >
                {activePortal.badge}
              </span>
              <h3 className={styles.tabTitle}>{activePortal.title}</h3>
              <p className={styles.tabDesc}>{activePortal.description}</p>

              <ul className={styles.featuresList}>
                {activePortal.features.map((f, i) => (
                  <li key={i} className={styles.featureItem}>
                    <CheckCircle2 style={{ width: "18px", height: "18px", color: activePortal.accent, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={isAuthenticated ? dashboardPath : activePortal.ctaLink}
                className={styles.portalCtaBtn}
                style={{ backgroundColor: activePortal.accent }}
              >
                {isAuthenticated ? "Go to Dashboard" : activePortal.ctaText} <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>

              <div className={styles.demoCredsBox}>
                1-Click Demo: <span className={styles.codeBadge}>{activePortal.demoCred}</span>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <span className={styles.previewTitle}>Live Portal Snapshot</span>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#065f46" }}>
                  Active Engine
                </span>
              </div>

              {activePortal.previewItems.map((item, idx) => (
                <div key={idx} className={styles.previewItem}>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#1e293b", display: "block" }}>
                      {item.label}
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.val}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      backgroundColor: "#ecfdf5",
                      color: "#065f46",
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= AI SECTION ================= */}
      <section id="ai-engine" className={styles.aiSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Intelligent Core</span>
          <h2 className={styles.sectionTitle}>AI Machine Learning Engine</h2>
          <p className={styles.sectionSubtitle}>
            Trained on multi-dimensional academic participation to provide actionable early interventions.
          </p>
        </div>

        <div className={styles.aiCardsGrid}>
          <div className={styles.aiCard}>
            <div className={styles.aiCardIconBox}>
              <TrendingUp style={{ width: "24px", height: "24px", color: "#10b981" }} />
            </div>
            <h3 className={styles.aiCardTitle}>Attendance Risk Forecaster</h3>
            <p className={styles.aiCardDesc}>
              A classification tree model that anticipates risk probabilities and flags students before they fall below the institutional 75% threshold.
            </p>
            <div className={styles.aiCardOutput}>
              <span className={styles.aiOutputLabel}>Risk Classification</span>
              <span className={styles.aiOutputVal}>Safe • Moderate Risk • High Risk</span>
            </div>
          </div>

          <div className={styles.aiCard}>
            <div className={styles.aiCardIconBox}>
              <Brain style={{ width: "24px", height: "24px", color: "#059669" }} />
            </div>
            <h3 className={styles.aiCardTitle}>Performance Score Regressor</h3>
            <p className={styles.aiCardDesc}>
              Evaluates homework submission regularity and lecture attendance to project final examination marks and letter grades.
            </p>
            <div className={styles.aiCardOutput}>
              <span className={styles.aiOutputLabel}>Exam Grade Output</span>
              <span className={styles.aiOutputVal}>Predicted Marks (0-100) & Grade A-F</span>
            </div>
          </div>

          <div className={styles.aiCard}>
            <div className={styles.aiCardIconBox}>
              <BarChart3 style={{ width: "24px", height: "24px", color: "#047857" }} />
            </div>
            <h3 className={styles.aiCardTitle}>5-Tier Understanding Metric</h3>
            <p className={styles.aiCardDesc}>
              Categorizes class understanding for each subject into Bad, Average, Good, Better, and Excellent to guide faculty lesson planning.
            </p>
            <div className={styles.aiCardOutput}>
              <span className={styles.aiOutputLabel}>Mastery Tiers</span>
              <span className={styles.aiOutputVal}>Bad • Average • Good • Better • Excellent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerColBrand}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className={styles.brandIconBox} style={{ width: "32px", height: "32px" }}>
                <GraduationCap style={{ width: "18px", height: "18px", color: "#ffffff" }} />
              </div>
              <span className={styles.footerBrandTitle}>EduSmart</span>
            </div>
            <p className={styles.footerBrandDesc}>
              Next-generation academic orchestration platform combining machine learning diagnostics with relational institutional governance.
            </p>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Portals</h4>
            <ul className={styles.footerLinkList}>
              <li><Link to="/login?role=student" className={styles.footerLink}>Student Portal</Link></li>
              <li><Link to="/login?role=teacher" className={styles.footerLink}>Faculty Portal</Link></li>
              <li><Link to="/login?role=admin" className={styles.footerLink}>Administration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>AI Capabilities</h4>
            <ul className={styles.footerLinkList}>
              <li><span className={styles.footerLink}>Attendance Risk Classifier</span></li>
              <li><span className={styles.footerLink}>Performance Regressor</span></li>
              <li><span className={styles.footerLink}>Class Mastery Distributions</span></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Platform</h4>
            <ul className={styles.footerLinkList}>
              <li><Link to="/signup" className={styles.footerLink}>Register New User</Link></li>
              <li><Link to="/login" className={styles.footerLink}>Secure Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2026 EduSmart Academic Systems. White & Green Edition.</span>
          <span>Designed with Vite & React.</span>
        </div>
      </footer>
    </div>
  );
}
