const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// In-memory stores
const channelMessages = {}; // { channelId: [messages] }
const onlineUsers = {};     // { socketId: { username, avatarUrl } }

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
    // Deduplicate by username (same user in multiple tabs counts as one)
    const unique = {};
    users.forEach((u) => { unique[u.username] = u; });
    io.emit("presence-update", Object.values(unique));
  }

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Register user
    socket.on("register-user", (data) => {
      onlineUsers[socket.id] = {
        username: data.username,
        avatarUrl: data.avatarUrl || "",
      };
      broadcastPresence();
    });

    // Client asks for channel history
    socket.on("join-channel", (channelId) => {
      const history = channelMessages[channelId] || [];
      socket.emit("channel-history", { channelId, messages: history });
    });

    // Handle messages - store AND broadcast to everyone
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

      // Store in history
      if (!channelMessages[channelId]) channelMessages[channelId] = [];
      channelMessages[channelId].push(msg);

      // Keep max 200 messages per channel in memory
      if (channelMessages[channelId].length > 200) {
        channelMessages[channelId] = channelMessages[channelId].slice(-200);
      }

      // Broadcast to ALL connected clients (not room-based)
      io.emit("new-message", msg);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      delete onlineUsers[socket.id];
      broadcastPresence();
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {

    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
