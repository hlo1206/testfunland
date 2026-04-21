import { Link, useLocation } from "wouter";
import logo from "@assets/3d4c92e4-f308-42ed-a934-0d72e64b096c_1776768066816.jpg";
import { DiscordIcon } from "./Icons";

const DISCORD_URL = "https://discord.gg/gPSDTxqYWn";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/store", label: "Store" },
  { to: "/checkout", label: "Checkout" },
];

export function Header() {
  const [loc] = useLocation();

  return (
    <header className="mc-header">
      <div className="mc-header-inner">
        <Link href="/" className="mc-brand" data-testid="link-home">
          <img src={logo} alt="FunLand MC" className="mc-logo" />
          <div className="mc-brand-text">
            <span className="mc-brand-title">FunLand</span>
            <span className="mc-brand-sub">Minecraft Server</span>
          </div>
        </Link>

        <nav className="mc-nav">
          {NAV.map((n) => (
            <Link
              key={n.to}
              href={n.to}
              className={`mc-nav-link ${loc === n.to ? "is-active" : ""}`}
              data-testid={`nav-${n.label.toLowerCase()}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mc-header-actions">
          <a
            className="mc-btn mc-btn-discord"
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="link-discord"
          >
            <DiscordIcon width={16} height={16} />
            <span>Discord</span>
          </a>
        </div>
      </div>
    </header>
  );
}
