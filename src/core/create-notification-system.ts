import { DataSource } from "typeorm";
import { Server } from "socket.io";

import { Logger } from "../logger/logger.interface";
import { NotificationEntityService } from "./notification.service";
import { defaultLogger } from "../logger/default-logger";
import { noLogger } from "../logger/no-logger";
import { NotificationEntity } from "../entities/notification.entity";
import { INotificationTransport } from "../transports/notification-transport.interface";
import { NotificationAuthFunction, ChannelResolver } from "../core/types";
import { NotificationGateway } from "../websocket/notification-gateway";
import { WebSocketTransport } from "../transports/websocket-transport";

export interface CreateNotificationSystemOptions {
  dataSource: DataSource;
  io: Server;
  logger?: Logger;
  useSocket?: boolean;
  transports?: INotificationTransport[];
  authFn: NotificationAuthFunction;
  channelResolver: ChannelResolver;
}

export const createNotificationSystem = ({
  dataSource,
  io,
  logger = defaultLogger,
  useSocket = true,
  transports = [],
  authFn,
  channelResolver,
}: CreateNotificationSystemOptions) => {
  const repository = dataSource.getRepository(NotificationEntity);

  if (useSocket) {
    const gateway = new NotificationGateway(
      io,
      logger,
      authFn,
      channelResolver
    );

    gateway.initialize();
    const socketTransport = new WebSocketTransport(gateway);
    transports.push(socketTransport);
  }

  const service = new NotificationEntityService(repository, transports, logger);

  return service;
};
