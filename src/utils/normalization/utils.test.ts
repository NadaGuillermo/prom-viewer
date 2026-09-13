/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import { describe, expect, it } from "vitest";
import type { Observation } from "fhir/r4";

import {
  getQuestionnaireResponseIdFromObservationReferenceAttribute,
} from "@utils/normalization/utils";

describe("getQuestionnaireResponseIdFromObservationReferenceAttribute", () => {
  it("extracts the id from a QuestionnaireResponse reference", () => {
    const resource = {
      derivedFrom: [{ reference: "QuestionnaireResponse/abc-123" }],
    } as Observation;

    expect(
      getQuestionnaireResponseIdFromObservationReferenceAttribute(resource),
    ).toBe("abc-123");
  });

  it("returns undefined when derivedFrom is missing", () => {
    expect(
      getQuestionnaireResponseIdFromObservationReferenceAttribute(
        {} as Observation,
      ),
    ).toBeUndefined();
  });

  it("returns undefined when no entry has a reference", () => {
    const resource = { derivedFrom: [{}] } as Observation;

    expect(
      getQuestionnaireResponseIdFromObservationReferenceAttribute(resource),
    ).toBeUndefined();
  });

  it("returns undefined when the reference has no '/' separator", () => {
    const resource = { derivedFrom: [{ reference: "abc-123" }] } as Observation;

    expect(
      getQuestionnaireResponseIdFromObservationReferenceAttribute(resource),
    ).toBeUndefined();
  });
});
