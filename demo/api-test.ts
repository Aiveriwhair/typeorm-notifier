import "reflect-metadata";
import { DataSource } from "typeorm";
import { NotificationEntity } from "../src/entities/notification.entity";
import { NotificationType } from "../src/entities/notification.entity";
import { INotificationTransport } from "../src/transports/notification-transport.interface";
import { Logger } from "../src/logger/logger.interface";
import { NotificationEntityService } from "../src/core/notification.service";

/**
 * This script demonstrates how to use the NotificationEntityService
 * to create, retrieve, and manage notifications in a TypeORM-based application.
 */

// === Mock Logger ===
const logger: Logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
};

// === Mock Transport ===
const mockTransport: INotificationTransport = {
  async send(notif) {
    console.log(`📤 [Transport] Sending notification: ${notif.title}`);
  },
};

// === Setup DB ===
const dataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  synchronize: true,
  entities: [NotificationEntity],
});

async function runTests() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(NotificationEntity);

  const service = new NotificationEntityService(repo, [mockTransport], logger);

  // === Create notifications ===
  await service.create({
    userId: "u123",
    channel: "global",
    title: "Bienvenue",
    content: "Voici votre première notification !",
    type: NotificationType.INFO,
  });

  await service.create({
    userId: "u123",
    channel: "global",
    title: "Important",
    content: "Ceci est un message important",
    type: NotificationType.WARNING,
    expiresAt: new Date(Date.now() + 3600 * 1000), // expire dans 1h
  });

  await service.create({
    userId: "u123",
    channel: "global",
    title: "Ancienne notification",
    content: "Elle est expirée",
    type: NotificationType.INFO,
    expiresAt: new Date(Date.now() - 3600 * 1000), // déjà expirée
  });

  // === Récupérer les notifications actives ===
  const activeNotifs = await service.getUserNotifications("u123", {
    active: true,
  });
  console.log(`🔍 Notifications actives: ${activeNotifs.length}`);

  // === Marquer une notif comme lue ===
  if (activeNotifs[0]) {
    await service.markAsRead(activeNotifs[0].id, "u123");
    console.log(`✅ Notification ${activeNotifs[0].id} marquée comme lue`);
  }

  // === Compter les non lues ===
  const unreadCount1 = await service.countUnread("u123");
  console.log(`🔢 Non lues : ${unreadCount1}`);

  // === Marquer tout comme lu ===
  await service.markAllAsRead("u123");
  console.log(`✅ Toutes les notifications marquées comme lues`);

  // === Archiver une notif ===
  if (activeNotifs[1]) {
    await service.archive(activeNotifs[1].id, "u123");
    console.log(`📦 Notification ${activeNotifs[1].id} archivée`);
  }

  // === Compter les non lues ===
  const unreadCount2 = await service.countUnread("u123");
  console.log(`🔢 Non lues : ${unreadCount2}`);

  await dataSource.destroy();
}

runTests().catch(console.error);
