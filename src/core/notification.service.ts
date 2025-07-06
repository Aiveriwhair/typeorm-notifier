import { Repository } from "typeorm";
import { Logger } from "../logger/logger.interface";
import { NotificationPayload } from "./types";
import {
  NotificationEntity,
  NotificationType,
} from "../entities/notification.entity";
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
    notif.userId = payload.userId;
    notif.channel = payload.channel;
    notif.title = payload.title;
    notif.content = payload.content;
    notif.type = payload.type ?? NotificationType.INFO;
    notif.link = payload.link;
    notif.metadata = payload.metadata || {};
    notif.scheduledAt = payload.scheduledAt || new Date();
    notif.expiresAt = payload.expiresAt;
    notif = await this.repo.save(notif);

    this.logger.info(
      `Notification created with ID ${notif.id} for user ${notif.userId}`
    );

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

    this.logger.info(
      `Notification ${notif.id} ${
        notif.userId ? `for user ${notif.userId} ` : ""
      }${
        notif.channel ? `on channel ${notif.channel}` : ""
      } sent successfully to ${this.transports.length} transport(s)`
    );
  }

  async getUserNotifications(userId: string, filters: NotificationFilters) {
    const query = this.repo
      .createQueryBuilder("notification")
      .where("notification.userId = :userId", { userId });

    if (filters.type) {
      query.andWhere("notification.type = :type", { type: filters.type });
    }
    if (filters.isRead !== undefined) {
      query.andWhere("notification.read = :read", { read: filters.isRead });
    }
    if (filters.isArchived !== undefined) {
      query.andWhere("notification.archived = :archived", {
        archived: filters.isArchived,
      });
    }
    if (filters.scheduled) {
      // True = scheduledAt > now
      query.andWhere("notification.scheduledAt > :now", { now: new Date() });
    } else if (filters.scheduled === false) {
      // False = scheduledAt <= now
      query.andWhere("notification.scheduledAt <= :now", { now: new Date() });
    }
    if (filters.expired) {
      // True = expiresAt < now
      query.andWhere("notification.expiresAt < :now", { now: new Date() });
    } else if (filters.expired === false) {
      // False = expiresAt >= now
      query.andWhere("notification.expiresAt >= :now", { now: new Date() });
    }
    if (filters.active) {
      // True = not expired and valid now
      query.andWhere(
        "notification.expiresAt >= :now AND notification.scheduledAt <= :now",
        { now: new Date() }
      );
    } else if (filters.active === false) {
      // False = either expired or not valid now
      query.andWhere(
        "notification.expiresAt < :now OR notification.scheduledAt > :now",
        { now: new Date() }
      );
    }

    if (filters.search) {
      const search = `%${filters.search}%`;
      query.andWhere(
        "(notification.title LIKE :search OR notification.content LIKE :search)",
        { search }
      );
    }

    if (filters.limit) {
      query.take(filters.limit);
    }

    if (filters.offset) {
      query.skip(filters.offset);
    }

    let sortOrder = filters.sortOrder || "DESC";
    if (filters.sortBy) {
      query.orderBy(
        `notification.${filters.sortBy}`,
        filters.sortOrder || sortOrder
      );
    } else {
      query.orderBy("notification.createdAt", sortOrder);
    }

    return await query.getMany();
  }

  async markAsRead(id: number, userId: string) {
    const notif = await this.repo.findOne({
      where: { id, userId },
    });
    if (!notif) {
      throw new Error("Notification not found");
    }
    notif.isRead = true;
    notif.readAt = new Date();
    this.logger.info(`Notification ${id} marked as read for user ${userId}`);
    return await this.repo.save(notif);
  }

  async markAllAsRead(userId: string) {
    const notifications = await this.repo.find({
      where: { userId, isRead: false },
    });
    this.repo.updateAll;

    for (const notif of notifications) {
      notif.isRead = true;
      notif.readAt = new Date();
    }
    this.logger.info(
      `Marking ${notifications.length} notifications as read for user ${userId}`
    );
    return await this.repo.save(notifications);
  }

  async archive(id: number, userId: string) {
    const notif = await this.repo.findOne({
      where: { id, userId },
    });
    if (!notif) {
      throw new Error("Notification not found");
    }
    notif.isArchived = true;
    this.logger.info(`Notification ${id} archived`);
    return await this.repo.save(notif);
  }

  async countUnread(userId: string): Promise<number> {
    const count = await this.repo.count({
      where: { userId, isRead: false },
    });
    return count;
  }
}
