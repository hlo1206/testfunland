import { useState } from "react";
import { useLocation } from "wouter";
import type { Product } from "@/lib/supabase";
import {
  CoinIcon,
  ShieldIcon,
  ChestIcon,
  HeartIcon,
  DiscordIcon,
  UploadIcon,
  PickaxeIcon,
  BlockIcon,
  SwordIcon,
} from "./Icons";

const DISCORD_URL = "https://discord.gg/GNZZ968bUX";

function CategoryIcon({ category }: { category: string }) {
  const size = 36;
  if (category === "coins") return <CoinIcon width={size} height={size} />;
  if (category === "rank") return <ShieldIcon width={size} height={size} />;
  if (category === "hosting") return <PickaxeIcon width={size} height={size} />;
  if (category === "performance") return <BlockIcon width={size} height={size} />;
  if (category === "ryzen") return <SwordIcon width={size} height={size} />;
  return <HeartIcon width={size} height={size} />;
}

function HostingSpecs({ product }: { product: Product }) {
  if (
    product.cpuPercent == null &&
    product.ramGb == null &&
    product.storageGb == null
  ) {
    return null;
  }
  return (
    <ul className="mc-card-specs">
      {product.cpuPercent != null && (
        <li>
          <span>CPU</span>
          <strong>{product.cpuPercent}%</strong>
        </li>
      )}
      {product.ramGb != null && (
        <li>
          <span>RAM</span>
          <strong>{product.ramGb} GB</strong>
        </li>
      )}
      {product.storageGb != null && (
        <li>
          <span>Storage</span>
          <strong>{product.storageGb} GB SSD</strong>
        </li>
      )}
    </ul>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const accent = product.accent ?? "#fbbf24";
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  const close = () => setOpen(false);

  return (
    <>
      <article
        className="mc-card"
        style={{ ["--accent" as string]: accent }}
        data-testid={`card-product-${product.id}`}
      >
        <div className="mc-card-icon">
          <CategoryIcon category={product.category} />
        </div>
        <div className="mc-card-name" data-testid={`text-name-${product.id}`}>
          {product.name}
        </div>
        {product.tagline && <div className="mc-card-tag">{product.tagline}</div>}
        <HostingSpecs product={product} />
        <div className="mc-card-price" data-testid={`text-price-${product.id}`}>
          <span className="mc-price-currency">₹</span>
          {product.priceInr}
          {product.billingPeriod && (
            <span className="mc-price-period">/{product.billingPeriod}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mc-btn mc-btn-buy"
          data-testid={`button-buy-${product.id}`}
        >
          <ChestIcon width={16} height={16} />
          <span>Buy now</span>
        </button>
      </article>

      {open && (
        <div
          className="mc-modal-backdrop"
          onClick={close}
          data-testid={`modal-buy-${product.id}`}
        >
          <div
            className="mc-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={`Buy ${product.name}`}
          >
            <button
              className="mc-modal-close"
              onClick={close}
              aria-label="Close"
              data-testid={`modal-close-${product.id}`}
            >
              ×
            </button>
            <div className="mc-modal-head">
              <div className="mc-modal-icon">
                <CategoryIcon category={product.category} />
              </div>
              <div>
                <div className="mc-modal-title">{product.name}</div>
                <div className="mc-modal-price">
                  ₹{product.priceInr}
                  {product.billingPeriod && `/${product.billingPeriod}`}
                </div>
              </div>
            </div>
            <div className="mc-modal-sub">How would you like to pay?</div>
            <div className="mc-modal-options">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
                className="mc-method"
                data-testid={`modal-discord-${product.id}`}
                onClick={close}
              >
                <DiscordIcon width={28} height={28} />
                <div>
                  <div className="mc-method-name">Discord ticket</div>
                  <div className="mc-method-sub">
                    Instant — open a ticket and our staff delivers immediately.
                  </div>
                </div>
              </a>
              <button
                type="button"
                className="mc-method"
                data-testid={`modal-website-${product.id}`}
                onClick={() => {
                  close();
                  navigate(`/checkout?product=${product.id}`);
                }}
              >
                <UploadIcon width={28} height={28} />
                <div>
                  <div className="mc-method-name">Pay on website (UPI)</div>
                  <div className="mc-method-sub">
                    Upload payment screenshot — verified within 30 min to 1
                    working day.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
