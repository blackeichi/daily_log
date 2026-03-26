import { Locale } from "date-fns";
import "react-datepicker";

declare module "react-datepicker" {
  export function registerLocale(localeName: string, localeData: Locale): void;
}
