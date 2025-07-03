import { Repository } from "typeorm";
import { Logger } from "../logger/logger.interface";
import { NotificationPayload } from "./types";
import { NotificationEntity } from "../entities/notification.entity";
import { INotificationTransport } from "../transports/notification-transport.interface";
import { NotificationFilters } from "./notification-filters";

export class NotificationEntityService {
  constructor(
    private readonly repo: Repository<NotificationEntity>,
    private readonly transports: INotificationTransport[],
    private readonly logger: Logger
  ) {}

  async create(payload: NotificationPayload): Promise<NotificationEntity> {
    let notif: NotificationEntity = new NotificationEntity();
    notif = await this.repo.save(notif);

    // Immédiat ? (scheduledAt <= now)
    const now = new Date();
    if (!payload.scheduledAt || payload.scheduledAt <= now) {
      await this.send(notif);
    }

    return notif;
  }

  async send(notif: NotificationEntity) {
    for (const transport of this.transports) {
      await transport.send(notif);
    }
  }

  async getUserNotifications(userId: string, filters: NotificationFilters) {}
  async markAsRead(id: number, userId: string) {}
  async markAllAsRead(userId: string) {}
  async archive(id: number) {}
}
