import { useEffect, useState } from "react";
import {
  supabase,
  ADMIN_EMAIL,
  useListAdminOrders,
  useUpdateAdminOrder,
  useGetServerStatus,
  useUpdateServerStatus,
  useAdminStats,
  useListSpecialOffers,
  useCreateSpecialOffer,
  useUpdateSpecialOffer,
  useDeleteSpecialOffer,
  type Order,
  type SpecialOffer,
} from "@/lib/supabase";
import { ShieldIcon, ChestIcon, HeartIcon, CoinIcon } from "@/components/Icons";

const ADMIN_USER = "prideisnub";

function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span className={`mc-badge mc-badge-${status}`}>{status.toUpperCase()}</span>
  );
}

function OrderRow({ order }: { order: Order }) {
  const update = useUpdateAdminOrder();
  const [note, setNote] = useState(order.adminNote ?? "");
  const [open, setOpen] = useState(false);

  const setStatus = (status: Order["status"]) =>
    update.mutate({
      orderId: order.id,
      data: { status, adminNote: note.trim() || null },
    });

  return (
    <div className="mc-order" data-testid={`row-order-${order.id}`}>
      <div className="mc-order-head" onClick={() => setOpen((v) => !v)}>
        <div className="mc-order-cell">
          <code className="mc-order-id">{order.id.slice(0, 8)}</code>
        </div>
        <div className="mc-order-cell">
          <div className="mc-order-name">{order.productName}</div>
          <div className="mc-order-sub">{order.productCategory}</div>
        </div>
        <div className="mc-order-cell">
          <div className="mc-order-name">{order.minecraftUsername}</div>
          {order.referral && (
            <div className="mc-order-sub">ref: {order.referral}</div>
          )}
        </div>
        <div className="mc-order-cell">₹{order.priceInr}</div>
        <div className="mc-order-cell">{order.paymentMethod}</div>
        <div className="mc-order-cell">
          <StatusBadge status={order.status} />
        </div>
      </div>
      {open && (
        <div className="mc-order-body">
          <div className="mc-order-grid">
            <div>
              <div className="mc-label">Contact</div>
              <div>{order.contact ?? "—"}</div>
            </div>
            <div>
              <div className="mc-label">Transaction ref</div>
              <div>{order.transactionRef ?? "—"}</div>
            </div>
            <div>
              <div className="mc-label">Notes</div>
              <div>{order.notes ?? "—"}</div>
            </div>
            <div>
              <div className="mc-label">Created</div>
              <div>{new Date(order.createdAt).toLocaleString()}</div>
            </div>
          </div>
          {order.paymentProofPath && (
            <div>
              <div className="mc-label">Payment proof</div>
              <a
                href={order.paymentProofPath}
                target="_blank"
                rel="noreferrer"
                className="mc-link"
                data-testid={`link-proof-${order.id}`}
              >
                Open uploaded screenshot
              </a>
            </div>
          )}
          <label className="mc-label">Admin note</label>
          <textarea
            className="mc-input mc-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            data-testid={`input-note-${order.id}`}
          />
          <div className="mc-order-actions">
            <button
              className="mc-btn mc-btn-gold"
              onClick={() => setStatus("verified")}
              disabled={update.isPending}
              data-testid={`button-verify-${order.id}`}
            >
              Verify payment
            </button>
            <button
              className="mc-btn mc-btn-outline"
              onClick={() => setStatus("delivered")}
              disabled={update.isPending}
              data-testid={`button-deliver-${order.id}`}
            >
              Mark delivered
            </button>
            <button
              className="mc-btn mc-btn-ghost"
              onClick={() => setStatus("rejected")}
              disabled={update.isPending}
              data-testid={`button-reject-${order.id}`}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusEditor() {
  const { data } = useGetServerStatus();
  const update = useUpdateServerStatus();
  const [form, setForm] = useState({
    status: "online" as "online" | "offline" | "maintenance",
    playersOnline: 0,
    maxPlayers: 200,
    ip: "",
    port: 19132,
    version: "",
    message: "",
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (data && !hydrated) {
      setForm({
        status: data.status,
        playersOnline: data.playersOnline,
        maxPlayers: data.maxPlayers,
        ip: data.ip,
        port: data.port,
        version: data.version,
        message: data.message ?? "",
      });
      setHydrated(true);
    }
  }, [data, hydrated]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({
      ...form,
      message: form.message.trim() || null,
    });
  };

  if (!hydrated) return null;

  return (
    <form className="mc-card-form" onSubmit={submit}>
      <div className="mc-summary-title">Server status</div>
      <label className="mc-label">Status</label>
      <select
        className="mc-input"
        value={form.status}
        onChange={(e) =>
          setForm({ ...form, status: e.target.value as typeof form.status })
        }
        data-testid="select-server-status"
      >
        <option value="online">Online</option>
        <option value="offline">Offline</option>
        <option value="maintenance">Maintenance</option>
      </select>
      <div className="mc-row-2">
        <div>
          <label className="mc-label">IP</label>
          <input
            className="mc-input"
            value={form.ip}
            onChange={(e) => setForm({ ...form, ip: e.target.value })}
          />
        </div>
        <div>
          <label className="mc-label">Port</label>
          <input
            type="number"
            className="mc-input"
            value={form.port}
            onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
          />
        </div>
      </div>
      <label className="mc-label">Version</label>
      <input
        className="mc-input"
        value={form.version}
        onChange={(e) => setForm({ ...form, version: e.target.value })}
      />
      <label className="mc-label">Message</label>
      <textarea
        className="mc-input mc-textarea"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button
        className="mc-btn mc-btn-gold"
        type="submit"
        disabled={update.isPending}
        data-testid="button-save-status"
      >
        Save status
      </button>
    </form>
  );
}

const BLANK_OFFER = {
  title: "",
  description: "",
  discountText: "",
  badgeLabel: "OFFER",
  active: true,
  expiresAt: "",
  accent: "#fbbf24",
  sortOrder: 0,
};

function OfferForm({
  initial,
  onSave,
  onCancel,
  busy,
}: {
  initial: typeof BLANK_OFFER;
  onSave: (v: typeof BLANK_OFFER) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof BLANK_OFFER, v: string | boolean | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mc-card-form" style={{ gap: 8 }}>
      <label className="mc-label">Title</label>
      <input
        className="mc-input"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="e.g. Weekend Sale"
      />
      <label className="mc-label">Description</label>
      <input
        className="mc-input"
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="e.g. Buy any rank and get 10% off"
      />
      <label className="mc-label">Discount text (shown on banner right)</label>
      <input
        className="mc-input"
        value={form.discountText}
        onChange={(e) => set("discountText", e.target.value)}
        placeholder="e.g. 10% OFF"
      />
      <div className="mc-row-2">
        <div>
          <label className="mc-label">Badge label</label>
          <input
            className="mc-input"
            value={form.badgeLabel}
            onChange={(e) => set("badgeLabel", e.target.value)}
            placeholder="OFFER"
          />
        </div>
        <div>
          <label className="mc-label">Accent color</label>
          <input
            type="color"
            className="mc-input"
            style={{ height: 38, padding: 2 }}
            value={form.accent}
            onChange={(e) => set("accent", e.target.value)}
          />
        </div>
      </div>
      <div className="mc-row-2">
        <div>
          <label className="mc-label">Expires at (optional)</label>
          <input
            type="datetime-local"
            className="mc-input"
            value={form.expiresAt}
            onChange={(e) => set("expiresAt", e.target.value)}
          />
        </div>
        <div>
          <label className="mc-label">Sort order</label>
          <input
            type="number"
            className="mc-input"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
        </div>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
        />
        <span className="mc-label" style={{ margin: 0 }}>Active (show on store)</span>
      </label>
      <div className="mc-order-actions">
        <button
          className="mc-btn mc-btn-gold"
          onClick={() => onSave(form)}
          disabled={busy || !form.title.trim()}
        >
          Save offer
        </button>
        <button className="mc-btn mc-btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function SpecialOfferEditor() {
  const { data: offers } = useListSpecialOffers();
  const create = useCreateSpecialOffer();
  const update = useUpdateSpecialOffer();
  const del = useDeleteSpecialOffer();
  const [editing, setEditing] = useState<SpecialOffer | null | "new">(null);

  const busy = create.isPending || update.isPending || del.isPending;

  const handleSave = (form: typeof BLANK_OFFER) => {
    if (editing === "new") {
      create.mutate(
        { ...form, expiresAt: form.expiresAt || null },
        { onSuccess: () => setEditing(null) },
      );
    } else if (editing) {
      update.mutate(
        { id: editing.id, ...form, expiresAt: form.expiresAt || null },
        { onSuccess: () => setEditing(null) },
      );
    }
  };

  const toForm = (o: SpecialOffer): typeof BLANK_OFFER => ({
    title: o.title,
    description: o.description,
    discountText: o.discountText,
    badgeLabel: o.badgeLabel,
    active: o.active,
    expiresAt: o.expiresAt
      ? new Date(o.expiresAt).toISOString().slice(0, 16)
      : "",
    accent: o.accent,
    sortOrder: o.sortOrder,
  });

  return (
    <div className="mc-card-form">
      <div className="mc-summary-title">Special Offers</div>

      {editing === "new" ? (
        <OfferForm
          initial={BLANK_OFFER}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          busy={busy}
        />
      ) : editing ? (
        <OfferForm
          initial={toForm(editing)}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          busy={busy}
        />
      ) : (
        <>
          {(offers ?? []).length === 0 ? (
            <div className="mc-empty" style={{ fontSize: 13 }}>
              No offers yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(offers ?? []).map((o) => (
                <div
                  key={o.id}
                  className="mc-order"
                  style={{ borderLeft: `3px solid ${o.accent}` }}
                >
                  <div
                    className="mc-order-head"
                    style={{ cursor: "default", flexWrap: "wrap", gap: 8 }}
                  >
                    <div className="mc-order-cell" style={{ flex: 1 }}>
                      <div className="mc-order-name">{o.title}</div>
                      <div className="mc-order-sub">{o.description}</div>
                    </div>
                    <div className="mc-order-cell">
                      <span
                        className={`mc-badge ${o.active ? "mc-badge-verified" : "mc-badge-rejected"}`}
                      >
                        {o.active ? "ACTIVE" : "OFF"}
                      </span>
                    </div>
                    <div className="mc-order-cell" style={{ gap: 6, display: "flex" }}>
                      <button
                        className="mc-btn mc-btn-outline"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => setEditing(o)}
                        disabled={busy}
                      >
                        Edit
                      </button>
                      <button
                        className="mc-btn mc-btn-ghost"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        onClick={() => del.mutate(o.id)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            className="mc-btn mc-btn-gold"
            style={{ marginTop: 8 }}
            onClick={() => setEditing("new")}
          >
            + Add offer
          </button>
        </>
      )}
    </div>
  );
}

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const email = user.trim() === ADMIN_USER ? ADMIN_EMAIL : user.trim();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (err) {
        setError("Invalid username or password.");
      } else {
        onLogin();
      }
    } catch {
      setError("Sign-in failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mc-page">
      <section className="mc-section">
        <div className="mc-success" style={{ maxWidth: 420, margin: "0 auto" }}>
          <ShieldIcon width={48} height={48} />
          <h1 className="mc-h2">Admin access</h1>
          <p>Enter your admin credentials to continue.</p>
          <form
            onSubmit={submit}
            className="mc-card-form"
            style={{ width: "100%" }}
          >
            <label className="mc-label">Username</label>
            <input
              className="mc-input"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              data-testid="input-admin-user"
            />
            <label className="mc-label">Password</label>
            <input
              type="password"
              className="mc-input"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              data-testid="input-admin-pass"
            />
            {error && (
              <div className="mc-status-msg" style={{ color: "#ff7a7a" }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              className="mc-btn mc-btn-gold"
              disabled={busy}
              data-testid="button-admin-login"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<Order["status"] | "all">("pending");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthed(!!data.session);
    });
    const sub = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const { data: orders } = useListAdminOrders({ enabled: !!authed });
  const stats = useAdminStats(orders);

  if (authed === null) {
    return (
      <main className="mc-page">
        <section className="mc-section">
          <div className="mc-empty">Loading…</div>
        </section>
      </main>
    );
  }

  if (!authed) {
    return <LoginGate onLogin={() => setAuthed(true)} />;
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  const filtered =
    filter === "all"
      ? orders ?? []
      : (orders ?? []).filter((o) => o.status === filter);

  return (
    <main className="mc-page">
      <section className="mc-section">
        <header
          className="mc-section-head"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 className="mc-h1 mc-h1-sm">Admin</h1>
            <p className="mc-section-sub">
              Verify payments, deliver orders, and keep the server status fresh.
            </p>
          </div>
          <button
            className="mc-btn mc-btn-ghost"
            onClick={logout}
            data-testid="button-admin-logout"
          >
            Sign out
          </button>
        </header>

        <div className="mc-stats">
          <div className="mc-stat">
            <div className="mc-stat-ico">
              <ChestIcon width={22} height={22} />
            </div>
            <div>
              <div className="mc-stat-num" data-testid="stat-pending">
                {stats.pending}
              </div>
              <div className="mc-stat-label">Pending</div>
            </div>
          </div>
          <div className="mc-stat">
            <div className="mc-stat-ico">
              <HeartIcon width={22} height={22} />
            </div>
            <div>
              <div className="mc-stat-num">{stats.verified}</div>
              <div className="mc-stat-label">Verified</div>
            </div>
          </div>
          <div className="mc-stat">
            <div className="mc-stat-ico">
              <ShieldIcon width={22} height={22} />
            </div>
            <div>
              <div className="mc-stat-num">{stats.delivered}</div>
              <div className="mc-stat-label">Delivered</div>
            </div>
          </div>
          <div className="mc-stat">
            <div className="mc-stat-ico">
              <CoinIcon width={22} height={22} />
            </div>
            <div>
              <div className="mc-stat-num">₹{stats.revenueInr}</div>
              <div className="mc-stat-label">Revenue</div>
            </div>
          </div>
        </div>

        <div className="mc-admin-grid">
          <div>
            <div className="mc-tabs">
              {(["pending", "verified", "delivered", "rejected", "all"] as const).map(
                (s) => (
                  <button
                    key={s}
                    className={`mc-tab ${filter === s ? "is-active" : ""}`}
                    onClick={() => setFilter(s)}
                    data-testid={`filter-${s}`}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
            <div className="mc-orders">
              {filtered.length === 0 ? (
                <div className="mc-empty">No orders.</div>
              ) : (
                filtered.map((o) => <OrderRow key={o.id} order={o} />)
              )}
            </div>
          </div>
          <aside>
            <StatusEditor />
            <SpecialOfferEditor />
          </aside>
        </div>
      </section>
    </main>
  );
}
