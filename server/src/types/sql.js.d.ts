declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string, params?: any[]): Array<{ columns: string[]; values: any[][] }> | undefined;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export interface Statement {
    run(params?: any[]): void;
    get(params?: any[]): any[] | undefined;
    all(params?: any[]): any[];
    bind(params?: any[]): boolean;
    reset(): void;
    free(): void;
  }

  export interface QueryOptions {
    columns?: boolean;
    values?: boolean;
  }

  export interface Config {
    locateFile?: (file: string) => string;
  }

  export default function initSqlJs(config?: Config): Promise<{ Database: typeof Database; locateFile: (file: string) => string }>;
}
