import type { VariableDomains as Domains} from "@customTypes/variableDomains";

export const convertFhirDateTimeToDateFormat = (isoDate: string): Domains.DateFormat => {
  //   const date = new Date(isoDate);
  //   // Check if the date is valid // handle error differently
  // if (isNaN(date.getTime())) {
  //   throw new Error(`Invalid ISO 8601 date: ${isoDate}`);
  // }

  //   const year = date.getUTCFullYear();
  // const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  // const day = String(date.getUTCDate()).padStart(2, '0');

    // return `${year}-${month}-${day}`;
    return new Date(isoDate).toISOString().split('T')[0];
}