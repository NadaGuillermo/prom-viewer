import Ajv2020, { type ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";

import type { Config } from "@utils/config";
import promsSchema from "../../schemas/proms.schema.json";

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(promsSchema);

/**
 * @param data - raw, unvalidated JSON parsed from the fetched PROMs config file
 * @returns the same data, typed as Config.PromConfig, once it passes schema validation
 * @description Validates the PROMs config against schemas/proms.schema.json (Ajv, JSON
 * Schema draft 2020-12). Throws a descriptive error listing every violation on failure.
 */
export function validatePromConfig(data: unknown): Config.PromConfig {
  if (!validate(data)) {
    throw new Error(
      `PROMs configuration file failed schema validation:\n${formatErrors(validate.errors)}`,
    );
  }
  return data as Config.PromConfig;
}

/**
 * @param errors - Ajv validation errors, or null/undefined when none were collected
 * @returns a newline-separated, human-readable list of the violations
 * @description Formats Ajv error objects into "<path> <message>" lines for display to the user.
 */
function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (errors === null || errors === undefined || errors.length === 0) {
    return "Unknown validation error";
  }
  return errors
    .map((error) => `- ${error.instancePath || "(root)"} ${error.message ?? ""}`)
    .join("\n");
}
