const isProduction = process.env.NODE_ENV === "production";

function write(
  method: "error" | "warn" | "log",
  message: string,
  ...args: unknown[]
) {
  if (isProduction) {
    return;
  }

  console[method](message, ...args);
}

export const logger = {
  error(message: string, ...args: unknown[]) {
    write("error", message, ...args);
  },
  warn(message: string, ...args: unknown[]) {
    write("warn", message, ...args);
  },
  log(message: string, ...args: unknown[]) {
    write("log", message, ...args);
  },
};
