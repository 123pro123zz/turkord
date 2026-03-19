const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const channelMessages = {}; 
const onlineUsers = {};     
const voiceUsers = {}; 

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  function broadcastPresence() {
    const users = Object.values(onlineUsers);
    const unique = {};
    users.forEach((u) => { unique[u.username] = u; });
    io.emit("presence-update", Object.values(unique));
  }

  function broadcastVoicePresence() {
    const channelMap = {};
    for (const [sId, cId] of Object.entries(voiceUsers)) {
      if (!channelMap[cId]) channelMap[cId] = [];
      const u = onlineUsers[sId];
      if (u && !channelMap[cId].some(existing => existing.username === u.username)) {
        channelMap[cId].push(u);
      }
    }
    io.emit("voice-presence-update", channelMap);
  }

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("register-user", (data) => {
      onlineUsers[socket.id] = {
        username: data.username,
        avatarUrl: data.avatarUrl || "",
      };
      broadcastPresence();
      broadcastVoicePresence();
    });

    socket.on("update-user", (data) => {
      if (onlineUsers[socket.id]) {
        onlineUsers[socket.id].username = data.username;
        onlineUsers[socket.id].avatarUrl = data.avatarUrl || "";
        broadcastPresence();
        broadcastVoicePresence();
      }
    });

    socket.on("join-voice", (channelId) => {
      voiceUsers[socket.id] = channelId;
      broadcastVoicePresence();
    });

    socket.on("leave-voice", () => {
      delete voiceUsers[socket.id];
      broadcastVoicePresence();
    });

    socket.on("join-channel", (channelId) => {
      const history = channelMessages[channelId] || [];
      socket.emit("channel-history", { channelId, messages: history });
    });

    socket.on("send-message", (data) => {
      const { channelId, message, user, avatar } = data;
      const msg = {
        id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 5),
        text: message,
        user: user,
        avatar: avatar || "",
        channelId: channelId,
        timestamp: new Date().toISOString(),
      };

      if (!channelMessages[channelId]) channelMessages[channelId] = [];
      channelMessages[channelId].push(msg);

      if (channelMessages[channelId].length > 200) {
        channelMessages[channelId] = channelMessages[channelId].slice(-200);
      }

      io.emit("new-message", msg);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      delete onlineUsers[socket.id];
      delete voiceUsers[socket.id];
      broadcastPresence();
      broadcastVoicePresence();
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on port ${PORT}`);
  });
});
