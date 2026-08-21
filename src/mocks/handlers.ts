import { fhirHandlers } from "./fhir/handlers";
import { configHandlers } from "./config/handlers";

export const handlers = [...fhirHandlers, ...configHandlers];
