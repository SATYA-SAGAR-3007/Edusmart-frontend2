import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Modern White & Green Pages (Modular Folder Architecture)
import LandingPage from "./pages/LandingPage/index.jsx";
import LoginPage from "./pages/LoginPage/index.jsx";
import SignupPage from "./pages/SignupPage/index.jsx";
import AdminDashboard from "./pages/AdminDashboard/index.jsx";
import TeacherDashboard from "./pages/TeacherDashboard/index.jsx";
import StudentDashboard from "./pages/StudentDashboard/index.jsx";

// Operational Academic Routes
import StudentsPage from "./pages/StudentsPage/index.jsx";
import AttendancePage from "./pages/AttendancePage/index.jsx";
import AssignmentsPage from "./pages/AssignmentsPage/index.jsx";
import PerformancePage from "./pages/PerformancePage/index.jsx";
import RiskDashboard from "./pages/RiskDashboard/index.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Marketing */}
        <Route path="/" element={<LandingPage />} />

        {/* Unified Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Legacy / Convenience Auth Aliases */}
        <Route path="/teacher-login" element={<Navigate to="/login?role=teacher" replace />} />
        <Route path="/student-login" element={<Navigate to="/login?role=student" replace />} />
        <Route path="/admin-login" element={<Navigate to="/login?role=admin" replace />} />
        <Route path="/teacher-signup" element={<Navigate to="/signup?role=teacher" replace />} />
        <Route path="/student-signup" element={<Navigate to="/signup?role=student" replace />} />

        {/* Dashboards */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/dashboard" element={<TeacherDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-dashboard/:id" element={<StudentDashboard />} />

        {/* Operational Academic Modules */}
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/risk" element={<RiskDashboard />} />

        {/* Student Deep-Link Aliases */}
        <Route path="/student-performance/:id" element={<StudentDashboard />} />
        <Route path="/student-tasks/:id" element={<StudentDashboard />} />
        <Route path="/student-insights/:id" element={<StudentDashboard />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
