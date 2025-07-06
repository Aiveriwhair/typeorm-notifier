import { NotificationEntity } from "../../src/entities/notification.entity";
import { INotificationTransport } from "../../src/transports/notification-transport.interface";

export class ConsoleTransport implements INotificationTransport {
  async send(notification: NotificationEntity): Promise<void> {
    console.log(
      "🔊 [ConsoleTransport]",
      notification.title,
      "-",
      notification.content
    );
  }
}
