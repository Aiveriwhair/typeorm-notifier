import { NotificationType } from "../entities/notification.entity";

export interface NotificationFilters {
  type?: NotificationType | NotificationType[]; // Ex: 'info' or ['error', 'warning']
  isRead?: boolean;
  isArchived?: boolean;

  scheduled?: boolean; // true → uniquement les planifiées (scheduledAt > now)
  expired?: boolean; // true → uniquement les expirées (expiresAt < now)
  active?: boolean; // true → non expirées et valides maintenant

  search?: string; // sur title ou content
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "scheduledAt";
  sortOrder?: "ASC" | "DESC";
}

export const defaultNotificationFilters: NotificationFilters = {
  type: undefined,
  isRead: undefined,
  isArchived: undefined,
  scheduled: undefined,
  expired: undefined,
  active: undefined,
  search: undefined,
  limit: undefined,
  offset: undefined,
  sortBy: "createdAt",
  sortOrder: "DESC",
};
