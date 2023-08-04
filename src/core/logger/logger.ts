export class Logger {
  public static of(contextName?: string) {
    return new Logger(contextName);
  }

  constructor(private readonly contextName?: string) {}

  private transform(...params: any[]) {
    params = Array.isArray(params) ? params : [params];
    params = params
      .filter((param) => !!param)
      .map((param) => (typeof param === 'object' ? JSON.stringify(param, null, 2) : param));

    if (this.contextName) {
      params = [this.contextName].concat(params);
    }

    return params;
  }

  public debug(...params: any[]): void {
    console.debug(...this.transform(params));
  }

  public error(...params: any[]): void {
    console.error(...this.transform(params));
  }
}
