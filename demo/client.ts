import io from "socket.io-client";

const socket = io("http://localhost:4000", {
  auth: { userId: "u123" },
});

socket.on("connect", () => {
  console.log("✅ Connected to server");
});

socket.on("t-notification", (notif: any) => {
  console.log("📨 Received notification:", notif);
});

socket.on("t-notification:connected", (info: any) => {
  console.log("🔗 Subscribed to channels:", info);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});
