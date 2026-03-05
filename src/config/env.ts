export const env = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const PORT = env("PORT");
export const BETTER_AUTH_SECRET = env("BETTER_AUTH_SECRET");
export const BETTER_AUTH_URL = env("BETTER_AUTH_URL");
