import { Link } from "wouter";
import { useListProducts } from "@/lib/supabase";
import { ServerStatusCard } from "@/components/ServerStatusCard";
import { ProductCard } from "@/components/ProductCard";
import {
  CoinIcon,
  ShieldIcon,
  HeartIcon,
  SwordIcon,
  PickaxeIcon,
  ChestIcon,
  DiscordIcon,
  StarIcon,
} from "@/components/Icons";
import logo from "@assets/3d4c92e4-f308-42ed-a934-0d72e64b096c_1776768066816.jpg";

const DISCORD_URL = "https://discord.gg/GNZZ968bUX";

const FEATURES = [
  {
    icon: SwordIcon,
    title: "Lifesteal SMP",
    body: "Steal hearts. Lose hearts. Build bases. Wage war. The classic Indian Lifesteal experience, refined.",
  },
  {
    icon: HeartIcon,
    title: "Duels Arena",
    body: "Settle scores in 1v1 lobbies, custom kits, ranked ladders, and tournaments with prize pools.",
  },
  {
    icon: PickaxeIcon,
    title: "Survival + Events",
    body: "Weekly events, custom enchantments, treasure hunts, and a thriving player-run economy.",
  },
];

export function HomePage() {
  const { data: products } = useListProducts();
  const featured = (products ?? [])
    .filter((p) => p.category === "rank")
    .slice(0, 4);

  return (
    <main className="mc-page">
      <section className="mc-hero">
        <div className="mc-hero-bg" />
        <div className="mc-hero-inner">
          <div className="mc-hero-text">
            <span className="mc-eyebrow">
              <StarIcon width={14} height={14} /> Season 1 is live!
            </span>
            <h1 className="mc-h1">
              Step into <span className="mc-h1-gold">FunLand</span>
            </h1>
            <p className="mc-hero-sub">
              India&apos;s wildest Minecraft server. Lifesteal SMP, Duels, ranks
              that actually mean something, and a community that never sleeps.
            </p>
            <div className="mc-hero-actions">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
                className="mc-btn mc-btn-discord mc-btn-lg"
                data-testid="link-hero-discord"
              >
                <DiscordIcon width={18} height={18} />
                <span>Join Discord</span>
              </a>
              <Link
                href="/store"
                className="mc-btn mc-btn-gold mc-btn-lg"
                data-testid="link-hero-store"
              >
                <ChestIcon width={18} height={18} />
                <span>Visit the Store</span>
              </Link>
            </div>
            <ServerStatusCard />
          </div>
          <div className="mc-hero-art">
            <img src={logo} alt="FunLand MC" className="mc-hero-logo" />
          </div>
        </div>
      </section>

      <section className="mc-section">
        <header className="mc-section-head">
          <h2 className="mc-h2">What&apos;s on the server</h2>
          <p className="mc-section-sub">
            Every game mode is custom-built. No half-baked plugins, no pay-to-win.
          </p>
        </header>
        <div className="mc-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="mc-feature">
              <div className="mc-feature-ico">
                <f.icon width={36} height={36} />
              </div>
              <h3 className="mc-feature-title">{f.title}</h3>
              <p className="mc-feature-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mc-section mc-section-dark">
        <header className="mc-section-head">
          <h2 className="mc-h2">Pick your kingdom</h2>
          <p className="mc-section-sub">
            Ranks unlock kits, command perks, exclusive cosmetics, and bragging
            rights.
          </p>
        </header>
        <div className="mc-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mc-section-foot">
          <Link href="/store" className="mc-btn mc-btn-outline">
            See all products
          </Link>
        </div>
      </section>

      <section className="mc-section">
        <div className="mc-cta">
          <div className="mc-cta-icons">
            <CoinIcon width={28} height={28} />
            <ShieldIcon width={28} height={28} />
            <HeartIcon width={28} height={28} />
          </div>
          <h2 className="mc-h2">Coins, ranks, and second chances</h2>
          <p className="mc-section-sub">
            Buy with UPI through our website (verified within a working day) or
            grab it instantly through a Discord ticket.
          </p>
          <div className="mc-hero-actions">
            <Link
              href="/store"
              className="mc-btn mc-btn-gold mc-btn-lg"
              data-testid="link-cta-store"
            >
              <ChestIcon width={18} height={18} />
              <span>Open the Store</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
