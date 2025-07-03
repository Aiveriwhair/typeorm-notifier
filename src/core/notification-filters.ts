import { NotificationType } from "../entities/notification.entity";

export interface NotificationFilters {
  type?: NotificationType | NotificationType[]; // Ex: 'info' ou ['error', 'warning']
  isRead?: boolean;
  isArchived?: boolean;

  before?: Date; // createdAt < before
  after?: Date; // createdAt > after

  scheduled?: boolean; // true → uniquement les planifiées (scheduledAt > now)
  expired?: boolean; // true → uniquement les expirées (expiresAt < now)
  active?: boolean; // true → non expirées et valides maintenant

  search?: string; // sur title ou content
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "scheduledAt";
  sortOrder?: "ASC" | "DESC";
}
