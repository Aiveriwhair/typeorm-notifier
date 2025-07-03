import { NotificationEntity } from "../entities/notification.entity";

export interface INotificationTransport {
  /**
   * Envoie la notification via un canal spécifique (WebSocket, Email, etc.)
   * @param notification - La notification à envoyer
   */
  send(notification: NotificationEntity): Promise<void>;
}
