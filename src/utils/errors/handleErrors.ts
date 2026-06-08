import type { Errors } from "./types";

export const forwardErrorsToUser = (dataIssues: Errors.DataIssue[]) => {
  console.error("PRO-Viewer: Issues of FHIR resources", dataIssues);
}