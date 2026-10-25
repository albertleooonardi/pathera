import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="mt-6 flex flex-col items-center justify-between gap-2 px-1 text-xs text-mariner-950/60 sm:flex-row">
      <p>&copy; 2024 PathEra. All rights reserved.</p>
      <div className="flex items-center gap-4">
        <Link to="/" className="hover:text-mariner-950">
          Home
        </Link>
        <Link to="/jobs" className="hover:text-mariner-950">
          Jobs
        </Link>
        <Link to="/interview" className="hover:text-mariner-950">
          Interview Simulation
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
