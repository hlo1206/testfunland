import { useMemo, useState } from "react";
import { useListProducts } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import { CoinIcon, ShieldIcon, HeartIcon } from "@/components/Icons";

const TABS = [
  { id: "coins" as const, label: "Coin Packs", Icon: CoinIcon },
  { id: "rank" as const, label: "Ranks", Icon: ShieldIcon },
  { id: "unban" as const, label: "Unban", Icon: HeartIcon },
];

export function StorePage() {
  const { data, isLoading } = useListProducts();
  const [tab, setTab] = useState<"coins" | "rank" | "unban">("rank");

  const filtered = useMemo(
    () =>
      (data ?? [])
        .filter((p) => p.category === tab)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [data, tab],
  );

  return (
    <main className="mc-page">
      <section className="mc-section">
        <header className="mc-section-head">
          <h1 className="mc-h1 mc-h1-sm">The FunLand Store</h1>
          <p className="mc-section-sub">
            All prices in INR. Pay via UPI on this site or instantly through a
            Discord ticket — your choice.
          </p>
        </header>

        <div className="mc-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`mc-tab ${tab === t.id ? "is-active" : ""}`}
              data-testid={`tab-${t.id}`}
            >
              <t.Icon width={18} height={18} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mc-empty">Loading products…</div>
        ) : filtered.length === 0 ? (
          <div className="mc-empty">No products in this category yet.</div>
        ) : (
          <div className="mc-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
