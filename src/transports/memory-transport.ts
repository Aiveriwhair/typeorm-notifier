import { NotificationEntity } from "../entities/notification.entity";
import { INotificationTransport } from "./notification-transport.interface";

export class MemoryTransport implements INotificationTransport {
  private sent: NotificationEntity[] = [];

  getSent(): NotificationEntity[] {
    return this.sent;
  }

  async send(notification: NotificationEntity): Promise<void> {
    this.sent.push(notification);
  }
}
