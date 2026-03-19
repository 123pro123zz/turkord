import { useEffect, useState, useCallback } from "react";
import { LiveKitRoom, RoomAudioRenderer, useParticipants, useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { Mic, MicOff, PhoneOff, PhoneForwarded } from "lucide-react";
import { Participant, RoomEvent, ConnectionState } from "livekit-client";

interface VoiceRoomProps {
  room: string;
  username: string;
}

export default function VoiceRoom({ room, username }: VoiceRoomProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  useEffect(() => {
    let mounted = true;
    setToken("");
    setError("");

    (async () => {
      try {
        const resp = await fetch(`/api/livekit?room=${room}&username=${username}`);
        const data = await resp.json();
        if (!mounted) return;
        if (data.token) {
          setToken(data.token);
        } else {
          setError(data.error || "Failed to get token");
        }
      } catch (e) {
        if (mounted) setError("Failed to connect to server");
      }
    })();
    return () => { mounted = false; };
  }, [room, username]);

  if (!serverUrl || error) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-borderMain px-6 backdrop-blur-md bg-background/80 shrink-0 transition-colors">
          <span className="font-semibold text-textMain tracking-tight">Voice Channel: {room}</span>
        </div>
        <div className="flex flex-1 items-center justify-center flex-col gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <PhoneForwarded strokeWidth={1.5} size={32} />
          </div>
          <div className="text-sm font-medium text-textMain">{error || "Voice not configured"}</div>
          <div className="text-xs text-textMuted max-w-sm text-center">
            Make sure LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and NEXT_PUBLIC_LIVEKIT_URL are configured in .env
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-borderMain px-6 backdrop-blur-md bg-background/80 shrink-0 transition-colors">
          <span className="font-semibold text-textMain tracking-tight">Voice Channel: {room}</span>
        </div>
        <div className="flex flex-1 items-center justify-center flex-col gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
          <div className="text-sm font-medium text-textMain">Connecting...</div>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      connect={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      className="flex h-full flex-col bg-background transition-colors"
      options={{
        audioCaptureDefaults: { autoGainControl: true, echoCancellation: true, noiseSuppression: true },
      }}
    >
      <div className="flex h-14 items-center border-b border-borderMain px-6 backdrop-blur-md bg-background/80 shrink-0 z-10 transition-colors">
        <span className="font-semibold text-textMain tracking-tight">Voice Channel: {room}</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-sidebar/50 transition-colors">
        <ParticipantsGrid />
      </div>

      <RoomControls />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function ParticipantsGrid() {
  const participants = useParticipants();

  if (participants.length === 0) {
    return <div className="text-textMuted text-sm">Waiting for others to join...</div>;
  }

  return (
    <div className="flex flex-wrap gap-8 justify-center items-center">
      {participants.map((p) => (
        <ParticipantTile key={p.identity} participant={p} />
      ))}
    </div>
  );
}

function ParticipantTile({ participant }: { participant: Participant }) {
  const isSpeaking = participant.isSpeaking;
  const displayName = participant.name || participant.identity.split("-")[0];

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full bg-sidebar text-3xl font-semibold text-textMain transition-all duration-200 ${
          isSpeaking ? "ring-[3px] ring-[#34C759] shadow-lg scale-105" : "ring-1 ring-borderMain shadow-sm"
        }`}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
      <span className="text-sm font-medium text-textMain">{displayName}</span>
    </div>
  );
}

function RoomControls() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(true); // Start muted, user clicks to unmute
  const [isConnected, setIsConnected] = useState(false);

  // Wait for room to be fully connected before allowing mic
  useEffect(() => {
    if (!room) return;

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    if (room.state === ConnectionState.Connected) {
      setIsConnected(true);
    }

    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room]);

  const toggleMute = useCallback(async () => {
    if (!localParticipant || !isConnected) return;
    try {
      const newMuted = !isMuted;
      await localParticipant.setMicrophoneEnabled(!newMuted);
      setIsMuted(newMuted);
    } catch (e) {
      console.error("Mic toggle failed:", e);
    }
  }, [localParticipant, isMuted, isConnected]);

  return (
    <div className="flex items-center justify-center gap-6 h-24 bg-background border-t border-borderMain shrink-0 transition-colors">
      <button
        onClick={toggleMute}
        disabled={!isConnected}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition-all disabled:opacity-40 ${
          isMuted ? "bg-red-500/10 text-red-500" : "bg-sidebar text-textMain hover:bg-sidebarHover"
        }`}
      >
        {isMuted ? <MicOff strokeWidth={1.5} size={24} /> : <Mic strokeWidth={1.5} size={24} />}
      </button>

      <button
        onClick={() => window.location.reload()}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition-all active:scale-95"
      >
        <PhoneOff strokeWidth={1.5} size={24} />
      </button>
    </div>
  );
}
