import { Server } from "socket.io";
import { createServer } from "http";
import { DataSource } from "typeorm";
import { createNotificationSystem } from "../src/core/create-notification-system";
import { defaultLogger } from "../src/logger/default-logger";
import { NotificationEntity } from "../src/entities/notification.entity";

// === Setup HTTP and WebSocket servers ===
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// === Setup in-memory SQLite database ===
const dataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  synchronize: true,
  entities: [NotificationEntity],
});

// === Start notification system ===
async function bootstrap() {
  await dataSource.initialize();

  const notif = createNotificationSystem({
    dataSource,
    io,
    transports: [],
    authFn: async (socket) => {
      return { userId: "u123" };
    },
    channelResolver: async (userId) => {
      return userId === "admin" ? ["admins", "global"] : ["global"];
    },
  });

  setTimeout(async () => {
    const notification = await notif.create({
      title: "Hello",
      content: "This is a test notification",
      channel: "global",
    });
  }, 5000);

  httpServer.listen(4000, () => {
    console.log("Server listening on http://localhost:4000");
  });
}

bootstrap();
