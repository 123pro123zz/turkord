import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SendHorizontal, Users } from "lucide-react";
import { Channel } from "./Sidebar";

interface ChatMessage {
  id: string;
  text: string;
  user: string;
  avatar: string;
  channelId: string;
  timestamp: string;
}

interface OnlineUser {
  username: string;
  avatarUrl: string;
}

interface ChatAreaProps {
  channel: Channel;
  username: string;
  avatarUrl: string;
  socketRef: React.MutableRefObject<Socket | null>;
  allMessages: Record<string, ChatMessage[]>;
  onlineUsers: OnlineUser[];
}

export default function ChatArea({ channel, username, avatarUrl, socketRef, allMessages, onlineUsers }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = allMessages[channel.id] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("send-message", {
      channelId: channel.id,
      message: input.trim(),
      user: username,
      avatar: avatarUrl,
    });

    setInput("");
  };

  return (
    <div className="flex h-full bg-background transition-colors">
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-borderMain px-6 backdrop-blur-md bg-background/80 shrink-0 shadow-sm z-10 transition-colors">
          <span className="font-semibold text-textMain tracking-tight text-lg"># {channel.name}</span>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`p-2 rounded-apple transition-colors ${showMembers ? "bg-sidebar text-textMain" : "text-textMuted hover:bg-sidebarHover hover:text-textMain"}`}
          >
            <Users size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-textMuted text-center">
              Welcome to #{channel.name}!<br />Say hi to the group.
            </div>
          )}

          {messages.map((m, i) => {
            const isConsecutive = i > 0 && messages[i - 1].user === m.user;

            return (
              <div
                key={m.id || i}
                className={`flex gap-4 px-2 hover:bg-black/[0.03] rounded-apple transition-colors group ${isConsecutive ? "pt-1 pb-1" : "pt-4 pb-1 mt-2"}`}
              >
                {isConsecutive ? (
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    <span className="text-[10px] text-textMuted opacity-0 group-hover:opacity-100 select-none">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-sidebar text-textMain flex items-center justify-center font-semibold text-lg shrink-0 overflow-hidden shadow-sm ring-1 ring-borderMain">
                    {m.avatar ? <img src={m.avatar} alt="avatar" className="w-full h-full object-cover" /> : m.user.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col flex-1 justify-center">
                  {!isConsecutive && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-semibold text-textMain cursor-pointer hover:underline text-[15px]">{m.user}</span>
                      <span className="text-xs text-textMuted font-medium">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                  <div className="text-[15px] text-textMain leading-[1.4] break-words whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="p-4 px-6 bg-background shrink-0 transition-colors">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message #${channel.name}`}
              className="w-full rounded-[16px] border border-borderMain bg-sidebar py-3.5 pl-4 pr-12 text-[15px] focus:border-textMuted focus:outline-none focus:ring-1 focus:ring-textMuted transition-all font-sans text-textMain"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white disabled:opacity-50 transition-all hover:opacity-90 active:scale-95 shadow-sm"
            >
              <SendHorizontal strokeWidth={1.5} size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Members Sidebar */}
      {showMembers && (
        <div className="w-60 border-l border-borderMain bg-sidebar flex flex-col shrink-0 transition-all">
          <div className="h-14 border-b border-borderMain px-4 flex items-center font-semibold text-sm text-textMain">
            Members — {onlineUsers.length}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="mb-2 px-2 text-xs font-semibold text-textMuted uppercase tracking-wider">Online</h3>
            <div className="flex flex-col gap-1">
              {onlineUsers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-apple px-2 py-2 hover:bg-sidebarHover cursor-pointer transition-colors group">
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-borderMain text-textMain font-medium text-sm overflow-hidden">
                      {member.avatarUrl ? <img src={member.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-[#34C759] ring-2 ring-sidebar group-hover:ring-sidebarHover transition-colors"></div>
                  </div>
                  <span className="text-sm font-medium text-textMain truncate">{member.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
