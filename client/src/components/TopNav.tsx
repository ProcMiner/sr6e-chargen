import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface Tab {
  label: string;
  to: string;
  match: (path: string) => boolean;
}

const TABS: Tab[] = [
  {
    label: "Character Vault",
    to: "/characters",
    match: (path) => path.startsWith("/characters") && !path.endsWith("/live"),
  },
  {
    label: "In Play",
    to: "/in-play",
    match: (path) => path === "/in-play" || path.endsWith("/live"),
  },
  {
    label: "GM's Bar",
    to: "/play",
    match: (path) => path.startsWith("/play"),
  },
];

export function TopNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-tabs">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className={tab.match(pathname) ? "top-nav-tab active" : "top-nav-tab"}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="top-nav-links">
          <a href="/sre6-chargen/release-notes.html" target="_blank" rel="noopener noreferrer">
            Release Notes
          </a>
          <a
            href={`mailto:dungeonmanager@gmail.com?subject=${encodeURIComponent(
              "SR6e CharGen Feature Request or Bug"
            )}&body=${encodeURIComponent("Please include a screenshot and a brief description of the problem or request.")}`}
          >
            Feature Request/Bug
          </a>
        </div>
        <div className="top-nav-user">
          <span>{user?.username}</span>
          <button onClick={() => logout()}>Log out</button>
        </div>
      </div>
      <div className="top-nav-secondary">
        <div className="top-nav-secondary-inner">
          <a href="/sre6-chargen/user-guide.html" target="_blank" rel="noopener noreferrer">
            Character Generator User Guide
          </a>
        </div>
      </div>
    </nav>
  );
}
