import { Logger } from "./logger.interface";

export const noLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};
