import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  useListProducts,
  useCreateOrder,
  type Product,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import {
  ChestIcon,
  DiscordIcon,
  UploadIcon,
  CoinIcon,
} from "@/components/Icons";

const DISCORD_URL = "https://discord.gg/gPSDTxqYWn";
const UPI_ID = "9155174642@pthdfc";

function getQueryProductId(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("product");
}

export function CheckoutPage() {
  const { data: products } = useListProducts();
  const [, navigate] = useLocation();

  const [productId, setProductId] = useState<string>("");
  const [method, setMethod] = useState<"discord" | "website">("website");
  const [username, setUsername] = useState("");
  const [contact, setContact] = useState("");
  const [referral, setReferral] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [proofPath, setProofPath] = useState<string | null>(null);
  const [proofName, setProofName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    id: string;
    method: "discord" | "website";
  } | null>(null);

  useEffect(() => {
    const fromQuery = getQueryProductId();
    if (fromQuery) setProductId(fromQuery);
  }, []);

  useEffect(() => {
    if (!productId && products && products.length > 0) {
      setProductId(products[0]!.id);
    }
  }, [productId, products]);

  const product: Product | undefined = useMemo(
    () => products?.find((p) => p.id === productId),
    [productId, products],
  );

  const upload = useUpload({
    onSuccess: (r) => {
      setProofPath(r.objectPath);
    },
    onError: (e) => {
      alert(`Upload failed: ${e.message}`);
    },
  });

  const createOrder = useCreateOrder();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProofName(f.name);
    setProofPath(null);
    await upload.uploadFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!username.trim()) {
      alert("Please enter your Minecraft username.");
      return;
    }
    if (method === "website" && !proofPath) {
      alert("Please upload a screenshot of the UPI payment.");
      return;
    }

    const res = await createOrder.mutateAsync({
      data: {
        productId: product.id,
        minecraftUsername: username.trim(),
        contact: contact.trim() || null,
        referral: referral.trim() || null,
        paymentMethod: method,
        paymentProofPath: method === "website" ? proofPath : null,
        transactionRef:
          method === "website" ? transactionRef.trim() || null : null,
        notes: notes.trim() || null,
      },
    });
    setSubmitted({ id: res.id, method: res.paymentMethod });
    if (method === "discord") {
      window.open(DISCORD_URL, "_blank");
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
            {submitted.method === "discord" ? (
              <p>
                Open a ticket in our Discord — quote your order ID and complete
                the payment with the team for instant delivery.
              </p>
            ) : (
              <p>
                We&apos;ll verify your payment and deliver within 30 minutes to
                1 working day. Track updates on Discord.
              </p>
            )}
            <div className="mc-hero-actions">
              <a
                className="mc-btn mc-btn-discord"
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
              >
                <DiscordIcon width={16} height={16} />
                <span>Open Discord</span>
              </a>
              <button
                className="mc-btn mc-btn-outline"
                onClick={() => {
                  setSubmitted(null);
                  setProofPath(null);
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
            Pick your item, choose how you want to pay, and we&apos;ll do the
            rest.
          </p>
        </header>

        <form className="mc-checkout" onSubmit={submit}>
          <div className="mc-checkout-main">
            <div className="mc-card-form">
              <label className="mc-label">Product</label>
              <select
                className="mc-input"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                data-testid="select-product"
              >
                {(products ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.priceInr}
                  </option>
                ))}
              </select>

              <label className="mc-label">Minecraft username</label>
              <input
                className="mc-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. SteveBuilder"
                required
                data-testid="input-username"
              />

              <label className="mc-label">Contact (Discord tag or email)</label>
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
              <div className="mc-method-title">Payment method</div>
              <div className="mc-methods">
                <button
                  type="button"
                  className={`mc-method ${method === "website" ? "is-active" : ""}`}
                  onClick={() => setMethod("website")}
                  data-testid="method-website"
                >
                  <UploadIcon width={28} height={28} />
                  <div>
                    <div className="mc-method-name">UPI on website</div>
                    <div className="mc-method-sub">
                      30 min — 1 working day verification
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  className={`mc-method ${method === "discord" ? "is-active" : ""}`}
                  onClick={() => setMethod("discord")}
                  data-testid="method-discord"
                >
                  <DiscordIcon width={28} height={28} />
                  <div>
                    <div className="mc-method-name">Discord ticket</div>
                    <div className="mc-method-sub">
                      Instant — handled by staff
                    </div>
                  </div>
                </button>
              </div>

              {method === "website" ? (
                <div className="mc-upi">
                  <div className="mc-upi-row">
                    <span className="mc-label">Pay to UPI ID</span>
                    <code
                      className="mc-upi-id"
                      data-testid="text-upi-id"
                    >
                      {UPI_ID}
                    </code>
                  </div>
                  <p className="mc-help">
                    Send <strong>₹{product?.priceInr ?? "—"}</strong> to the UPI
                    ID above, then upload a clear screenshot of the
                    confirmation.
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
                      {upload.isUploading
                        ? "Uploading…"
                        : proofPath
                          ? `Uploaded: ${proofName}`
                          : proofName
                            ? proofName
                            : "Choose screenshot"}
                    </span>
                  </label>
                </div>
              ) : (
                <div className="mc-help">
                  Click submit to create your order — we&apos;ll open Discord so
                  you can open a ticket. Quote your order ID for instant
                  delivery.
                </div>
              )}

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
              <div className="mc-help">Pick a product to continue.</div>
            )}
            <button
              type="submit"
              className="mc-btn mc-btn-gold mc-btn-lg mc-btn-block"
              disabled={
                createOrder.isPending ||
                upload.isUploading ||
                !product ||
                (method === "website" && !proofPath)
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
