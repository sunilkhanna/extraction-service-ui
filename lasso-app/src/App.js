import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import CanvasContainer from "./components/CanvasContainer_be";
import TableExtraction from "./components/TableExtraction";
import Classification from "./components/Classification";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          {/* Logo pill separated */}
          <div className="logo-pill">
            <img src="/2.png" alt="DocIntel Logo" className="app-logo" />

          </div>

          {/* Tabs aligned right */}
          <nav className="tab-list" aria-label="Main navigation">
            <NavLink
              to="/key-value"
              className={({ isActive }) => (isActive ? "tab active" : "tab")}
            >
              KV Extraction
            </NavLink>
            <NavLink
              to="/table-extraction"
              className={({ isActive }) => (isActive ? "tab active" : "tab")}
            >
              Table Extraction
            </NavLink>
            <NavLink
              to="/classification"
              className={({ isActive }) => (isActive ? "tab active" : "tab")}
            >
              Classification
            </NavLink>
          </nav>
        </header>

        <main className="top-section">
          <Routes>
            <Route path="/key-value" element={<CanvasContainer />} />
            <Route path="/table-extraction" element={<TableExtraction />} />
            <Route path="/classification" element={<Classification />} />
            <Route path="*" element={<CanvasContainer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
