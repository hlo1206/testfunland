import { useGetServerStatus } from "@workspace/api-client-react";
import { BlockIcon } from "./Icons";

export function ServerStatusCard() {
  const { data, isLoading } = useGetServerStatus({
    query: { refetchInterval: 30_000 },
  });

  const status = data?.status ?? "offline";
  const dotClass =
    status === "online"
      ? "is-online"
      : status === "maintenance"
        ? "is-maint"
        : "is-offline";

  return (
    <div className="mc-status" data-testid="card-status">
      <div className="mc-status-row">
        <span className={`mc-status-dot ${dotClass}`} />
        <span className="mc-status-label">
          {isLoading ? "Pinging server..." : status.toUpperCase()}
        </span>
      </div>
      <div className="mc-status-grid">
        <div>
          <div className="mc-status-key">Address</div>
          <div className="mc-status-val" data-testid="text-server-ip">
            {data?.ip ?? "—"}
          </div>
        </div>
        <div>
          <div className="mc-status-key">Port</div>
          <div className="mc-status-val">{data?.port ?? "—"}</div>
        </div>
        <div>
          <div className="mc-status-key">Version</div>
          <div className="mc-status-val">{data?.version ?? "—"}</div>
        </div>
      </div>
      {data?.message && (
        <div className="mc-status-msg">
          <BlockIcon
            width={14}
            height={14}
            style={{ verticalAlign: "-2px", marginRight: 6 }}
          />
          {data.message}
        </div>
      )}
    </div>
  );
}
