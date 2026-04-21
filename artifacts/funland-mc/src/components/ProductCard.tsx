import { Link } from "wouter";
import type { Product } from "@workspace/api-client-react";
import { CoinIcon, ShieldIcon, ChestIcon, HeartIcon } from "./Icons";

function CategoryIcon({ category }: { category: string }) {
  const size = 36;
  if (category === "coins")
    return <CoinIcon width={size} height={size} />;
  if (category === "rank")
    return <ShieldIcon width={size} height={size} />;
  return <HeartIcon width={size} height={size} />;
}

export function ProductCard({ product }: { product: Product }) {
  const accent = product.accent ?? "#fbbf24";
  return (
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
      {product.tagline && (
        <div className="mc-card-tag">{product.tagline}</div>
      )}
      <div className="mc-card-price" data-testid={`text-price-${product.id}`}>
        <span className="mc-price-currency">₹</span>
        {product.priceInr}
      </div>
      <Link
        href={`/checkout?product=${product.id}`}
        className="mc-btn mc-btn-buy"
        data-testid={`button-buy-${product.id}`}
      >
        <ChestIcon width={16} height={16} />
        <span>Buy now</span>
      </Link>
    </article>
  );
}
