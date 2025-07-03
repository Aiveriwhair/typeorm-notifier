import { Logger } from "./logger.interface";

export const defaultLogger: Logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: (...args) => {
    if (process.env.DEBUG) console.debug(...args);
  },
};
