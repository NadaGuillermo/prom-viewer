import type { NormalizedFHIR } from "@utils/fhir";
import type { Mapping } from "./types";
import { type Errors } from "@utils/errors";

export const mapNormalizedObservationDefinitionToPromDataObservationDefinition =
  (
    normalizedObservationDefinition: NormalizedFHIR.ObservationDefinition,
  ): Errors.Result<Mapping.ObservationDefinition> => {
    const issues: Errors.DataIssue[] = [];

    const range = normalizedObservationDefinition.range;
    const scoreHealthCorrelation = normalizedObservationDefinition.scoreHealthCorrelation
    const referenceRange: Mapping.ReferenceRange[] | undefined = normalizedObservationDefinition.referenceRange?.map((range) => {
      return {
        range: range.range,
        name: range.context ?? "Reference Value"
      }
    });   
    
      //?.filter((range) => Array.isArray(range.range));
    // const referenceValue = normalizedObservationDefinition.referenceRange?.filter((range) => typeof range.range === "number");

    return {
      data: {
        id: normalizedObservationDefinition.id,
        url: normalizedObservationDefinition.url,
        ...(range && {range: range}),
        ...(scoreHealthCorrelation && {scoreHealthCorrelation: scoreHealthCorrelation}),
        ...(referenceRange && {referenceRange: referenceRange}),
        // ...(referenceValue && {referenceValue: referenceValue}), 
      },
      issues: issues,
    };
  };
