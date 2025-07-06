import { NotificationEntity } from "../entities/notification.entity";
import { ChannelResolver, NotificationAuthFunction } from "../core/types";
import { Logger } from "../logger/logger.interface";
import { Server, Socket } from "socket.io";

const USER_PREFIX = "user";
const CHANNEL_PREFIX = "channel";
const NOTIFICATION_EVENT = "t-notification";

export class NotificationGateway {
  constructor(
    private io: Server,
    private logger: Logger,
    private authFn: NotificationAuthFunction,
    private channelResolve: ChannelResolver
  ) {}

  public initialize() {
    this.io.on("connection", async (socket) => {
      let user: { userId: string } | null = null;

      try {
        user = await this.authFn(socket);
        if (!user) throw new Error("Unauthorized");
      } catch (err) {
        this.logger.warn("Socket auth failed", { error: err });
        return socket.disconnect();
      }

      try {
        const channels = await this.handleSocketJoin(socket, user.userId);

        this.logger.info(
          `User ${user.userId} connected to channels: ${channels.join(", ")}`
        );

        socket.on("disconnect", () => {
          this.logger.info(`User ${user?.userId} disconnected`);
        });
      } catch (err) {
        this.logger.error("Failed to resolve channels", { error: err });
        return socket.disconnect();
      }
    });
  }

  private async handleSocketJoin(
    socket: Socket,
    userId: string
  ): Promise<string[]> {
    socket.join(`${USER_PREFIX}:${userId}`);
    let channels: string[] = [];

    try {
      channels = await this.channelResolve(userId);
      channels.forEach((c) => socket.join(`${CHANNEL_PREFIX}:${c}`));
    } catch (err) {
      this.logger.error("Error resolving channels", { userId, error: err });
      throw err;
    }

    socket.emit(`${NOTIFICATION_EVENT}:connected`, {
      userId,
      channels,
    });

    return channels;
  }

  emitToUser(userId: string, notification: NotificationEntity) {
    this.io
      .to(`${USER_PREFIX}:${userId}`)
      .emit(NOTIFICATION_EVENT, notification);
  }

  emitToChannel(channel: string, notification: NotificationEntity) {
    this.io
      .to(`${CHANNEL_PREFIX}:${channel}`)
      .emit(NOTIFICATION_EVENT, notification);
  }
}
