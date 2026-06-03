type LogArg = string | number | boolean | object | null | undefined;

const isProduction = process.env.NODE_ENV === "production";

function write(
  method: "error" | "warn" | "log" | "debug",
  message: string,
  ...args: LogArg[]
) {
  if (isProduction) {
    return;
  }

  console[method](message, ...args);
}

export const logger = {
  error(message: string, ...args: LogArg[]) {
    write("error", message, ...args);
  },
  warn(message: string, ...args: LogArg[]) {
    write("warn", message, ...args);
  },
  log(message: string, ...args: LogArg[]) {
    write("log", message, ...args);
  },
  debug(message: string, ...args: LogArg[]) {
    write("debug", message, ...args);
  },
};
