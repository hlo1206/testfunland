import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  useListProducts,
  useCreateOrder,
  uploadPaymentProof,
  type Product,
} from "@/lib/supabase";
import { ChestIcon, UploadIcon, CoinIcon } from "@/components/Icons";

const UPI_ID = "9155174642@pthdfc";

function getQueryProductId(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("product");
}

export function CheckoutPage() {
  const { data: products } = useListProducts();
  const [, navigate] = useLocation();

  const [productId] = useState<string>(() => getQueryProductId() ?? "");
  const [username, setUsername] = useState("");
  const [contact, setContact] = useState("");
  const [referral, setReferral] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofName, setProofName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);

  useEffect(() => {
    if (products && products.length > 0 && !productId) {
      navigate("/store");
    }
  }, [products, productId, navigate]);

  const product: Product | undefined = useMemo(
    () => products?.find((p) => p.id === productId),
    [productId, products],
  );

  const createOrder = useCreateOrder();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProofName(f.name);
    setProofUrl(null);
    setUploading(true);
    try {
      const r = await uploadPaymentProof(f);
      setProofUrl(r.publicUrl);
    } catch (err) {
      alert(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!username.trim()) {
      alert("Please enter your Minecraft username.");
      return;
    }
    if (!proofUrl) {
      alert("Please upload a screenshot of the UPI payment.");
      return;
    }

    try {
      const res = await createOrder.mutateAsync({
        productId: product.id,
        minecraftUsername: username.trim(),
        contact: contact.trim() || null,
        referral: referral.trim() || null,
        paymentMethod: "website",
        paymentProofPath: proofUrl,
        transactionRef: transactionRef.trim() || null,
        notes: notes.trim() || null,
      });
      setSubmitted({ id: res.id });
    } catch (err) {
      alert(`Order failed: ${(err as Error).message}`);
    }
  };

  if (submitted) {
    return (
      <main className="mc-page">
        <section className="mc-section">
          <div className="mc-success">
            <ChestIcon width={48} height={48} />
            <h1 className="mc-h2">Order received</h1>
            <p>
              Order ID <code data-testid="text-order-id">{submitted.id}</code>
            </p>
            <p>
              We&apos;ll verify your payment and deliver within 30 minutes to 1
              working day.
            </p>
            <div className="mc-hero-actions">
              <button
                className="mc-btn mc-btn-gold"
                onClick={() => {
                  setSubmitted(null);
                  setProofUrl(null);
                  setProofName(null);
                  setTransactionRef("");
                  navigate("/store");
                }}
                data-testid="button-back-store"
              >
                Back to store
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mc-page">
      <section className="mc-section">
        <header className="mc-section-head">
          <h1 className="mc-h1 mc-h1-sm">Checkout</h1>
          <p className="mc-section-sub">
            Pay via UPI, upload your payment screenshot, and we&apos;ll deliver
            within 30 minutes to 1 working day.
          </p>
        </header>

        <form className="mc-checkout" onSubmit={submit}>
          <div className="mc-checkout-main">
            <div className="mc-card-form">
              {product ? (
                <div className="mc-selected-product">
                  <div className="mc-label">You are buying</div>
                  <div className="mc-selected-product-name">{product.name}</div>
                  <div className="mc-selected-product-price">
                    ₹{product.priceInr}
                    {product.billingPeriod && `/${product.billingPeriod}`}
                  </div>
                  <button
                    type="button"
                    className="mc-btn mc-btn-ghost"
                    style={{ fontSize: 12, padding: "4px 12px", marginTop: 4 }}
                    onClick={() => navigate("/store")}
                  >
                    ← Change product
                  </button>
                </div>
              ) : (
                <div className="mc-help">Loading product…</div>
              )}

              <label className="mc-label">Minecraft username</label>
              <input
                className="mc-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. SteveBuilder"
                required
                data-testid="input-username"
              />

              <label className="mc-label">Contact (email or phone)</label>
              <input
                className="mc-input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="optional"
                data-testid="input-contact"
              />

              <label className="mc-label">Referral (optional)</label>
              <input
                className="mc-input"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                placeholder="Who sent you?"
                data-testid="input-referral"
              />
            </div>

            <div className="mc-card-form">
              <div className="mc-method-title">UPI Payment</div>
              <div className="mc-upi">
                <div className="mc-upi-row">
                  <span className="mc-label">Pay to UPI ID</span>
                  <code className="mc-upi-id" data-testid="text-upi-id">
                    {UPI_ID}
                  </code>
                </div>
                <p className="mc-help">
                  Send <strong>₹{product?.priceInr ?? "—"}</strong> to the UPI
                  ID above, then upload a clear screenshot of the confirmation.
                </p>

                <label className="mc-label">Transaction reference</label>
                <input
                  className="mc-input"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="UPI transaction ID (optional)"
                  data-testid="input-txn-ref"
                />

                <label className="mc-label">Payment screenshot</label>
                <label className="mc-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    data-testid="input-proof"
                  />
                  <UploadIcon width={20} height={20} />
                  <span>
                    {uploading
                      ? "Uploading…"
                      : proofUrl
                        ? `Uploaded: ${proofName}`
                        : proofName
                          ? proofName
                          : "Choose screenshot"}
                  </span>
                </label>
              </div>

              <label className="mc-label">Notes for the team</label>
              <textarea
                className="mc-input mc-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="optional"
                data-testid="input-notes"
              />
            </div>
          </div>

          <aside className="mc-summary">
            <div className="mc-summary-title">Order summary</div>
            {product ? (
              <>
                <div className="mc-summary-row">
                  <CoinIcon width={20} height={20} />
                  <div>
                    <div className="mc-summary-name">{product.name}</div>
                    {product.tagline && (
                      <div className="mc-summary-sub">{product.tagline}</div>
                    )}
                  </div>
                </div>
                <div className="mc-summary-divider" />
                <div className="mc-summary-row mc-summary-total">
                  <span>Total</span>
                  <span data-testid="text-total">₹{product.priceInr}</span>
                </div>
              </>
            ) : (
              <div className="mc-help">Loading…</div>
            )}
            <button
              type="submit"
              className="mc-btn mc-btn-gold mc-btn-lg mc-btn-block"
              disabled={
                createOrder.isPending || uploading || !product || !proofUrl
              }
              data-testid="button-submit"
            >
              <ChestIcon width={18} height={18} />
              <span>
                {createOrder.isPending ? "Submitting…" : "Place order"}
              </span>
            </button>
            <div className="mc-help mc-help-center">
              By placing the order you agree to abide by the FunLand server
              rules.
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}
