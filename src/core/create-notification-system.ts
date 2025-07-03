import { DataSource } from "typeorm";
import { Logger } from "../logger/logger.interface";
import { NotificationEntityService } from "./notification.service";
import { defaultLogger } from "../logger/default-logger";
import { NotificationEntity } from "../entities/notification.entity";

export const createNotificationSystem = (options: {
  dataSource: DataSource;
  logger?: Logger;
}) => {
  const { dataSource, logger = defaultLogger } = options;

  const manager = new NotificationEntityService(
    dataSource.getRepository(NotificationEntity),
    logger
  );
};
