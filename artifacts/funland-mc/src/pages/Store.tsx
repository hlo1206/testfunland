import { useMemo, useState } from "react";
import { useListProducts, useListSpecialOffers, type SpecialOffer } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import {
  CoinIcon,
  ShieldIcon,
  HeartIcon,
  PickaxeIcon,
  BlockIcon,
} from "@/components/Icons";

type TabId = "coins" | "rank" | "unban" | "hosting" | "performance";

const TABS: { id: TabId; label: string; Icon: typeof CoinIcon }[] = [
  { id: "rank", label: "Ranks", Icon: ShieldIcon },
  { id: "coins", label: "Coin Packs", Icon: CoinIcon },
  { id: "unban", label: "Unban", Icon: HeartIcon },
  { id: "hosting", label: "Hosting", Icon: PickaxeIcon },
  { id: "performance", label: "Performance", Icon: BlockIcon },
];

function OfferBanner({ offer }: { offer: SpecialOffer }) {
  const isExpired =
    offer.expiresAt != null && new Date(offer.expiresAt) < new Date();
  if (isExpired) return null;

  return (
    <div
      className="mc-offer-banner"
      style={{ ["--offer-accent" as string]: offer.accent }}
    >
      <span className="mc-offer-badge">{offer.badgeLabel}</span>
      <div className="mc-offer-body">
        <div className="mc-offer-title">{offer.title}</div>
        <div className="mc-offer-desc">{offer.description}</div>
      </div>
      <div className="mc-offer-discount">{offer.discountText}</div>
    </div>
  );
}

export function StorePage() {
  const { data, isLoading } = useListProducts();
  const { data: offers } = useListSpecialOffers({ activeOnly: true });
  const [tab, setTab] = useState<TabId>("rank");

  const filtered = useMemo(
    () =>
      (data ?? [])
        .filter((p) => p.category === tab)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [data, tab],
  );

  const activeOffers = (offers ?? []).filter((o) => {
    if (!o.active) return false;
    if (o.expiresAt && new Date(o.expiresAt) < new Date()) return false;
    return true;
  });

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

        {activeOffers.length > 0 && (
          <div className="mc-offers-list">
            {activeOffers.map((o) => (
              <OfferBanner key={o.id} offer={o} />
            ))}
          </div>
        )}

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
