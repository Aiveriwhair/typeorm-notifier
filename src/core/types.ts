export type NotificationType = "info" | "warning" | "error" | "custom";

export interface NotificationPayload {
  userId?: string; // Notification ciblée
  channel?: string; // Ou notification de groupe

  title: string;
  content?: string;

  type?: NotificationType; // Défaut = INFO
  link?: string; // Pour rediriger vers une ressource
  metadata?: Record<string, any>;

  scheduledAt?: Date; // Pour envoi différé
  expiresAt?: Date; // Pour expiration automatique
}

export interface NotificationAuthContext {
  userId: string;
  channels: string[]; // Groupes pour recevoir des broadcasts
  [key: string]: any; // Extension libre
}

export type NotificationAuthFunction = (
  socket: any
) => Promise<{ userId: string } | null>;

export type ChannelResolver = (userId: string) => Promise<string[]>;
