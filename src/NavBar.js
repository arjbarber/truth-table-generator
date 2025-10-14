import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Left side: Logo / Home */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight hover:text-gray-300 transition-colors duration-200"
        >
          <span className="text-blue-400">{'<'}</span>
          COMP 283<span className="text-blue-400">/{'>'}</span>
        </Link>

        {/* Right side: Nav links */}
        <div className="space-x-6">
          <Link
            to="/"
            className="text-lg font-medium hover:text-blue-400 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/truth-table"
            className="text-lg font-medium hover:text-blue-400 transition-colors duration-200"
          >
            Truth Table Generator
          </Link>
          <Link
            to="/math-keyboard"
            className="text-lg font-medium hover:text-blue-400 transition-colors duration-200"
          >
            Math Keyboard
          </Link>
          <a href="https:github.com/arjbarber/truth-table-generator" target="_blank" rel="noopener noreferrer"
            className="text-lg font-medium hover:text-blue-400 transition-colors duration-200"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
