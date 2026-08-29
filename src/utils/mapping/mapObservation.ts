import type * as NormalizedFHIR from "@utils/normalization";
import type * as Mapping from "./types";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";

export const mapObservation = (
  observation: NormalizedFHIR.Observation,
): Errors.Result<Mapping.Observation> => {
  const issues: Errors.DataIssue[] = [];
  const observationId = observation.id;
  const observationValue = observation.value;
  const questionnaireResponse = observation.questionnaireResponse;
  const observationDefinition = observation.observationDefinition;

  // if (questionnaireResponse === undefined) {
  //     issues.push({
  //         id: `issue-observation-${observationId}-${Math.random().toString(36).substring(2, 9)}`,
  //         level: 'error',
  //         message: `Observation with id ${observationId} does not reference any QuestionnaireResponse and will therefore be omitted.}`,
  //     })
  // }
  // if (observationDefinition === undefined) {
  //     issues.push({
  //         id: `issue-observation-${observationId}-${Math.random().toString(36).substring(2, 9)}`,
  //         level: 'error',
  //         message: `Observation with id ${observationId} does not reference any ObservationDefinition and will therefore be omitted.}`,
  //     });
  // }

  const value = observationValue === null || Number.isNaN(Number(observationValue)) ? null : Number(observationValue);

  if (value === null) {
    issues.push(
      issueFactories.observation.invalidObservationValue(observation),
    );
  }
  
  return {
    data: {
      id: observationId,
      value: value,
      questionnaireResponse: questionnaireResponse,
      observationDefinition: observationDefinition,
    },
    issues: issues,
  };
};
