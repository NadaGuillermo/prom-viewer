import { describe, expect, it } from "vitest";

import {
  getObservationDefinitionCanonicalUrlFromObservation,
  getQuestionnaireResponseIdFromObservationReferenceAttribute,
} from "@utils/normalization/utils";

describe("getObservationDefinitionCanonicalUrlFromObservation", () => {
  it("returns the canonical url from the instantiatesCanonical extension", () => {
    const resource = {
      extension: [
        {
          url: "http://hl7.org/fhir/StructureDefinition/workflow-instantiatesCanonical",
          valueCanonical: "https://example.org/ObservationDefinition/score",
        },
      ],
    };

    expect(getObservationDefinitionCanonicalUrlFromObservation(resource)).toBe(
      "https://example.org/ObservationDefinition/score",
    );
  });

  it("returns undefined when the extension array is missing", () => {
    expect(
      getObservationDefinitionCanonicalUrlFromObservation({}),
    ).toBeUndefined();
  });

  it("returns undefined when no extension matches the expected url", () => {
    const resource = {
      extension: [{ url: "http://example.org/other", valueCanonical: "x" }],
    };

    expect(
      getObservationDefinitionCanonicalUrlFromObservation(resource),
    ).toBeUndefined();
  });
});

describe("getQuestionnaireResponseIdFromObservationReferenceAttribute", () => {
  it("extracts the id from a QuestionnaireResponse reference", () => {
    const resource = {
      derivedFrom: [{ reference: "QuestionnaireResponse/abc-123" }],
    };

    expect(
      getQuestionnaireResponseIdFromObservationReferenceAttribute(resource),
    ).toBe("abc-123");
  });

  it("returns undefined when derivedFrom is missing", () => {
    expect(
      getQuestionnaireResponseIdFromObservationReferenceAttribute({}),
    ).toBeUndefined();
  });

  it("returns undefined when no entry has a reference", () => {
    const resource = { derivedFrom: [{}] };

    expect(
      getQuestionnaireResponseIdFromObservationReferenceAttribute(resource),
    ).toBeUndefined();
  });

  it("returns undefined when the reference has no '/' separator", () => {
    const resource = { derivedFrom: [{ reference: "abc-123" }] };

    expect(
      getQuestionnaireResponseIdFromObservationReferenceAttribute(resource),
    ).toBeUndefined();
  });
});
