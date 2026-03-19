"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Sidebar, { Channel, TEXT_CHANNELS } from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import VoiceRoom from "@/components/VoiceRoom";
import SettingsModal from "@/components/SettingsModal";

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

export default function ChatPage() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState("theme-light");
  const [channel, setChannel] = useState<Channel>({ id: "general", name: "General", type: "text" });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef(channel);
  const router = useRouter();

  // Keep channelRef in sync
  useEffect(() => {
    channelRef.current = channel;
  }, [channel]);

  // Initialize socket ONCE
  useEffect(() => {
    const savedName = localStorage.getItem("turkord_username");
    if (!savedName) {
      router.push("/");
      return;
    }
    setUsername(savedName);
    const savedAvatar = localStorage.getItem("turkord_avatar") || "";
    setAvatarUrl(savedAvatar);
    const savedTheme = localStorage.getItem("turkord_theme") || "theme-light";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;

    const s = io();
    socketRef.current = s;

    s.on("connect", () => {
      // Register presence
      s.emit("register-user", { username: savedName, avatarUrl: savedAvatar });
      // Request history for all text channels
      TEXT_CHANNELS.forEach((ch) => s.emit("join-channel", ch.id));
    });

    // Receive channel history
    s.on("channel-history", (data: { channelId: string; messages: ChatMessage[] }) => {
      setAllMessages((prev) => ({
        ...prev,
        [data.channelId]: data.messages,
      }));
    });

    // Receive new messages (globally, for ALL channels)
    s.on("new-message", (msg: ChatMessage) => {
      setAllMessages((prev) => {
        const existing = prev[msg.channelId] || [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [msg.channelId]: [...existing, msg] };
      });

      // If message is NOT for the currently active channel, increment unread
      if (msg.channelId !== channelRef.current.id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.channelId]: (prev[msg.channelId] || 0) + 1,
        }));
      }
    });

    // Receive presence updates
    s.on("presence-update", (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    return () => {
      s.disconnect();
    };
  }, [router]);

  // Clear unread when switching to a channel
  const handleSetChannel = useCallback((c: Channel) => {
    setChannel(c);
    setUnreadCounts((prev) => ({ ...prev, [c.id]: 0 }));
  }, []);

  if (!username) return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative transition-colors duration-300">
      <Sidebar
        currentChannel={channel}
        setChannel={handleSetChannel}
        username={username}
        avatarUrl={avatarUrl}
        onOpenSettings={() => setIsSettingsOpen(true)}
        unreadCounts={unreadCounts}
      />
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {channel.type === "text" ? (
          <ChatArea
            channel={channel}
            username={username}
            avatarUrl={avatarUrl}
            socketRef={socketRef}
            allMessages={allMessages}
            onlineUsers={onlineUsers}
          />
        ) : (
          <VoiceRoom room={channel.id} username={username} />
        )}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        username={username}
        setUsername={setUsername}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        theme={theme}
        setTheme={(newTheme: string) => {
          setTheme(newTheme);
          localStorage.setItem("turkord_theme", newTheme);
          document.documentElement.className = newTheme;
        }}
      />
    </div>
  );
}
