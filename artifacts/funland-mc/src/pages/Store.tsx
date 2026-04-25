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
  StarIcon,
} from "@/components/Icons";

function SpecialOfferCard({ offer }: { offer: SpecialOffer }) {
  const isExpired =
    offer.expiresAt && new Date(offer.expiresAt) < new Date();
  if (isExpired) return null;
  return (
    <article
      className="mc-card"
      style={{ ["--accent" as string]: "#f5a623" }}
    >
      <div className="mc-card-icon">
        <StarIcon width={36} height={36} />
      </div>
      <div className="mc-card-name">{offer.title}</div>
      <div className="mc-card-tag">{offer.description}</div>
      {offer.expiresAt && (
        <div
          style={{
            fontSize: 12,
            color: "#9ca3af",
            marginTop: 6,
            textAlign: "center",
          }}
        >
          Expires {new Date(offer.expiresAt).toLocaleDateString()}
        </div>
      )}
    </article>
  );
}

type ProductTabId = "coins" | "rank" | "unban" | "hosting" | "performance" | "ryzen";
type TabId = ProductTabId | "offers";

const PRODUCT_TABS: { id: ProductTabId; label: string; Icon: typeof CoinIcon }[] = [
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

  const activeOffers = useMemo(
    () =>
      (offers ?? []).filter(
        (o) => !o.expiresAt || new Date(o.expiresAt) >= new Date(),
      ),
    [offers],
  );

  const filtered = useMemo(
    () =>
      tab === "offers"
        ? []
        : (data ?? [])
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
          {activeOffers.length > 0 && (
            <button
              role="tab"
              aria-selected={tab === "offers"}
              onClick={() => setTab("offers")}
              className={`mc-tab mc-tab-offers ${tab === "offers" ? "is-active" : ""}`}
              data-testid="tab-offers"
            >
              <StarIcon width={18} height={18} />
              <span>Special Offers</span>
              <span className="mc-tab-badge">{activeOffers.length}</span>
            </button>
          )}
          {PRODUCT_TABS.map((t) => (
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

        {tab === "offers" ? (
          activeOffers.length === 0 ? (
            <div className="mc-empty">No active offers right now.</div>
          ) : (
            <div className="mc-grid">
              {activeOffers.map((o) => (
                <SpecialOfferCard key={o.id} offer={o} />
              ))}
            </div>
          )
        ) : isLoading ? (
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
