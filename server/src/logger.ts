import morgan from "morgan";
import winston from "winston";

const { format } = winston;
const { combine, json, timestamp } = format;

const level = process.env.NODE_ENV === "production" ? "info" : "debug";

const logFormat = combine(timestamp(), json());

const stdoutLogger = winston.createLogger({
  level,
  transports: [
    new winston.transports.Console({
      format: logFormat,
    }),
  ],
});

const stream = {
  write: (message: string) => stdoutLogger.info(message.trim()),
};

const morganMiddleware = morgan(":method :url :status :res[content-length] - :response-time ms", { stream });

export default {
  logger: stdoutLogger,
  morganMiddleware,
};
