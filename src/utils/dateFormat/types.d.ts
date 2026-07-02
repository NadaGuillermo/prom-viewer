export namespace DateFormat {
  export interface DateFormatSettings {
    format: string;
  }

  export interface DateFormatConfig {
    date: DateFormatSettings;
  }

  export type PartialDateFormatConfig = {
    date?: Partial<DateFormatSettings>;
  };
}
