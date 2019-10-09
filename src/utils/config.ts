export interface IConfig {
  IO_DEVELOPER_PORTAL_PUBLIC_PATH: string;
  IO_DEVELOPER_PORTAL_BASE_URL: string;
  IO_DEVELOPER_PORTAL_PORT: string;
  IO_DEVELOPER_PORTAL_BACKEND: string;
  IO_DEVELOPER_PORTAL_APIM_BASE_URL: string;
  IO_DEVELOPER_PORTIO_DEVELOPER_PORTAL_BASE_URLAL_APIM_BASE_URL: string;
}

export function getConfig(param: keyof IConfig): string {
  if (!("_env_" in window)) {
    throw new Error("Missing configuration");
  }
  // tslint:disable-next-line: no-any
  if (!(window as any)._env_[param]) {
    throw new Error("Missing required environment variable: " + param);
  }
  // tslint:disable-next-line: no-any
  return (window as any)._env_[param];
}
