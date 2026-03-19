import { Hash, Mic, Apple, Settings, ChevronDown } from "lucide-react";

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
}

interface SidebarProps {
  currentChannel: Channel;
  setChannel: (c: Channel) => void;
  username: string;
  avatarUrl: string;
  onOpenSettings: () => void;
  unreadCounts: Record<string, number>;
}

export const TEXT_CHANNELS: Channel[] = [
  { id: "general", name: "General", type: "text" },
  { id: "development", name: "Development", type: "text" },
];

export const VOICE_CHANNELS: Channel[] = [
  { id: "lounge", name: "Lounge", type: "voice" },
];

export default function Sidebar({ currentChannel, setChannel, username, avatarUrl, onOpenSettings, unreadCounts }: SidebarProps) {
  return (
    <div className="flex h-full w-[300px] border-r border-borderMain bg-sidebar shrink-0 transition-colors">
      {/* Servers Bar */}
      <div className="flex w-[72px] flex-col items-center border-r border-borderMain bg-background py-4 gap-4 transition-colors">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent text-white shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95">
          <Apple strokeWidth={1.5} size={24} />
        </div>
        <div className="h-px w-8 bg-borderMain transition-colors" />
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-sidebar text-textMain cursor-pointer transition-colors hover:bg-sidebarHover hover:rounded-apple">
          T
        </div>
      </div>

      {/* Channels Bar */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-borderMain px-4 transition-colors">
          <h2 className="font-semibold text-textMain tracking-tight">Turkord Space</h2>
          <ChevronDown strokeWidth={1.5} size={16} className="text-textMuted" />
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-6">
            <h3 className="mb-2 px-2 text-xs font-semibold text-textMuted uppercase tracking-wider">Text Channels</h3>
            <div className="space-y-0.5">
              {TEXT_CHANNELS.map((c) => {
                const unread = unreadCounts[c.id] || 0;
                return (
                  <div
                    key={c.id}
                    onClick={() => setChannel(c)}
                    className={`flex cursor-pointer items-center gap-2 rounded-apple px-2 py-1.5 transition-colors ${
                      currentChannel.id === c.id ? "bg-background shadow-sm text-accent" : "text-textMuted hover:bg-sidebarHover hover:text-textMain"
                    }`}
                  >
                    <Hash strokeWidth={1.5} size={18} />
                    <span className={`text-sm flex-1 ${unread > 0 && currentChannel.id !== c.id ? "font-bold text-textMain" : "font-medium"}`}>{c.name}</span>
                    {unread > 0 && currentChannel.id !== c.id && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold text-textMuted uppercase tracking-wider">Voice Channels</h3>
            <div className="space-y-0.5">
              {VOICE_CHANNELS.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setChannel(c)}
                  className={`flex cursor-pointer items-center gap-2 rounded-apple px-2 py-1.5 transition-colors ${
                    currentChannel.id === c.id ? "bg-background shadow-sm text-accent" : "text-textMuted hover:bg-sidebarHover hover:text-textMain"
                  }`}
                >
                  <Mic strokeWidth={1.5} size={18} />
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User profile area */}
        <div className="flex items-center gap-3 border-t border-borderMain bg-sidebar p-4 shrink-0 transition-colors">
          <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-sm shrink-0 overflow-hidden shadow-sm">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 truncate">
            <span className="text-sm font-medium leading-none mb-1 text-textMain">{username}</span>
            <span className="text-[11px] text-textMuted leading-none">Online</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-apple transition-colors hover:bg-sidebarHover text-textMuted hover:text-textMain shrink-0"
          >
            <Settings strokeWidth={1.5} size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
