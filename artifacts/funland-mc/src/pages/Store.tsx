import { useMemo, useState } from "react";
import { useListProducts, useListSpecialOffers, type SpecialOffer } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import {
  CoinIcon,
  ShieldIcon,
  HeartIcon,
  PickaxeIcon,
  BlockIcon,
  SwordIcon,
} from "@/components/Icons";

function SpecialOfferBanner({ offer }: { offer: SpecialOffer }) {
  const isExpired =
    offer.expiresAt && new Date(offer.expiresAt) < new Date();
  if (isExpired) return null;
  return (
    <div className="mc-offer-banner">
      {offer.badgeText && (
        <span className="mc-offer-badge">{offer.badgeText}</span>
      )}
      <div className="mc-offer-content">
        <div className="mc-offer-title">{offer.title}</div>
        <div className="mc-offer-desc">{offer.description}</div>
      </div>
      {offer.discountPercent && (
        <div className="mc-offer-discount">{offer.discountPercent}% OFF</div>
      )}
      {offer.expiresAt && (
        <div className="mc-offer-expires">
          Expires {new Date(offer.expiresAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

type TabId = "coins" | "rank" | "unban" | "hosting" | "performance" | "ryzen";

const TABS: { id: TabId; label: string; Icon: typeof CoinIcon }[] = [
  { id: "rank", label: "Ranks", Icon: ShieldIcon },
  { id: "coins", label: "Coin Packs", Icon: CoinIcon },
  { id: "unban", label: "Unban", Icon: HeartIcon },
  { id: "hosting", label: "Hosting", Icon: PickaxeIcon },
  { id: "performance", label: "Performance", Icon: BlockIcon },
  { id: "ryzen", label: "Ryzen", Icon: SwordIcon },
];

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

        {offers && offers.length > 0 && (
          <div className="mc-offers-list">
            {offers.map((offer) => (
              <SpecialOfferBanner key={offer.id} offer={offer} />
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
