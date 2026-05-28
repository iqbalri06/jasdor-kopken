import pino from 'pino';
import { config } from './config.js';

const transport =
  config.log.format === 'pretty'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

export const logger = pino({
  level: config.log.level,
  transport,
});

export function child(name) {
  return logger.child({ mod: name });
}
