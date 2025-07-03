import { NotificationEntity } from "../entities/notification.entity";
import { NotificationGateway } from "../websocket/notification-gateway";
import { INotificationTransport } from "./notification-transport.interface";

export class WebSocketTransport implements INotificationTransport {
  constructor(private gateway: NotificationGateway) {}

  async send(notification: NotificationEntity): Promise<void> {
    if (notification.userId) {
      this.gateway.emitToUser(notification.userId, notification);
    }
    if (notification.channel) {
      this.gateway.emitToChannel(notification.channel, notification);
    }
  }
}
