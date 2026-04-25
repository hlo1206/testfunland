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
  type CreateSpecialOfferInput,
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

const EMPTY_OFFER: CreateSpecialOfferInput = {
  title: "",
  description: "",
  active: true,
  expiresAt: null,
};

function OfferForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: CreateSpecialOfferInput;
  onSave: (v: CreateSpecialOfferInput) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState(initial);

  const set = (patch: Partial<CreateSpecialOfferInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      expiresAt: form.expiresAt || null,
    });
  };

  return (
    <form className="mc-card-form" onSubmit={submit} style={{ marginTop: 12 }}>
      <label className="mc-label">Title *</label>
      <input
        className="mc-input"
        required
        value={form.title}
        onChange={(e) => set({ title: e.target.value })}
        placeholder="e.g. Weekend Sale!"
      />
      <label className="mc-label">Description *</label>
      <textarea
        className="mc-input mc-textarea"
        required
        value={form.description}
        onChange={(e) => set({ description: e.target.value })}
        placeholder="e.g. Get 20% off on all ranks this weekend only!"
      />
      <label className="mc-label">Expires at</label>
      <input
        type="datetime-local"
        className="mc-input"
        value={form.expiresAt ? form.expiresAt.slice(0, 16) : ""}
        onChange={(e) =>
          set({ expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })
        }
      />
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => set({ active: e.target.checked })}
        />
        <span className="mc-label" style={{ margin: 0 }}>Active (visible in shop)</span>
      </label>
      <div className="mc-order-actions" style={{ marginTop: 8 }}>
        <button type="submit" className="mc-btn mc-btn-gold" disabled={isPending}>
          {isPending ? "Saving…" : "Save offer"}
        </button>
        <button type="button" className="mc-btn mc-btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function SpecialOffersEditor() {
  const { data: offers } = useListSpecialOffers();
  const create = useCreateSpecialOffer();
  const update = useUpdateSpecialOffer();
  const del = useDeleteSpecialOffer();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<SpecialOffer | null>(null);

  const handleCreate = (v: CreateSpecialOfferInput) => {
    create.mutate(v, {
      onSuccess: () => setAdding(false),
      onError: (err) => alert(`Failed to save offer: ${(err as Error).message}`),
    });
  };

  const handleUpdate = (v: CreateSpecialOfferInput) => {
    if (!editing) return;
    update.mutate({ id: editing.id, ...v }, {
      onSuccess: () => setEditing(null),
      onError: (err) => alert(`Failed to update offer: ${(err as Error).message}`),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this offer?")) {
      del.mutate(id, {
        onError: (err) => alert(`Failed to delete offer: ${(err as Error).message}`),
      });
    }
  };

  return (
    <div className="mc-card-form">
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div className="mc-summary-title">Special offers</div>
        {!adding && (
          <button
            className="mc-btn mc-btn-gold"
            style={{ fontSize: 13, padding: "4px 12px" }}
            onClick={() => { setAdding(true); setEditing(null); }}
          >
            + Add offer
          </button>
        )}
      </div>

      {adding && (
        <OfferForm
          initial={EMPTY_OFFER}
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          isPending={create.isPending}
        />
      )}

      {!offers || offers.length === 0 ? (
        <div className="mc-empty" style={{ fontSize: 13, padding: "12px 0" }}>
          No offers yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {offers.map((offer) => (
            <div key={offer.id} className="mc-order">
              {editing?.id === offer.id ? (
                <OfferForm
                  initial={{
                    title: offer.title,
                    description: offer.description,
                    active: offer.active,
                    expiresAt: offer.expiresAt,
                  }}
                  onSave={handleUpdate}
                  onCancel={() => setEditing(null)}
                  isPending={update.isPending}
                />
              ) : (
                <div className="mc-order-head" style={{ flexWrap: "wrap", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mc-order-name">{offer.title}</div>
                    <div className="mc-order-sub">{offer.description}</div>
                    {offer.expiresAt && (
                      <div className="mc-order-sub">
                        Expires: {new Date(offer.expiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: offer.active ? "#166534" : "#374151",
                        color: offer.active ? "#4ade80" : "#9ca3af",
                      }}
                    >
                      {offer.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <button
                      className="mc-btn mc-btn-outline"
                      style={{ fontSize: 12, padding: "3px 10px" }}
                      onClick={() => { setEditing(offer); setAdding(false); }}
                    >
                      Edit
                    </button>
                    <button
                      style={{
                        fontSize: 12,
                        padding: "3px 10px",
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.5)",
                        color: "#f87171",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: 600,
                      }}
                      onClick={() => handleDelete(offer.id)}
                      disabled={del.isPending}
                    >
                      {del.isPending ? "Deleting…" : "🗑 Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
            <div style={{ marginTop: 24 }}>
              <SpecialOffersEditor />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
