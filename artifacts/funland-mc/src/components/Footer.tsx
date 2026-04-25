import { DiscordIcon, BlockIcon } from "./Icons";

const DISCORD_URL = "https://discord.gg/GNZZ968bUX";

export function Footer() {
  return (
    <footer className="mc-footer">
      <div className="mc-footer-inner">
        <div className="mc-footer-col">
          <div className="mc-footer-title">
            <BlockIcon width={20} height={20} /> FunLand MC
          </div>
          <p className="mc-footer-text">
            India&apos;s most chaotic Minecraft server. Lifesteal SMP, duels,
            ranks, and chests of loot.
          </p>
        </div>
        <div className="mc-footer-col">
          <div className="mc-footer-title">Server</div>
          <p className="mc-footer-text">play.funlandmc.fun</p>
          <p className="mc-footer-text">Bedrock port 19132</p>
          <p className="mc-footer-text">Versions 1.16+ to 1.21.11</p>
        </div>
        <div className="mc-footer-col">
          <div className="mc-footer-title">Support</div>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="mc-footer-link"
          >
            <DiscordIcon width={16} height={16} /> Join our Discord
          </a>
          <p className="mc-footer-text">UPI 9155174642@pthdfc</p>
        </div>
      </div>
      <div className="mc-footer-bar">
        <span>&copy; {new Date().getFullYear()} FunLand MC</span>
        <span>Not affiliated with Mojang or Microsoft.</span>
      </div>
    </footer>
  );
}
