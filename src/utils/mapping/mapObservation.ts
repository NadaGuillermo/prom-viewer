import type { NormalizedFHIR } from "@utils/normalization";
import type { Mapping } from "./types";
import { issueFactories, type Errors } from "@utils/errors";

export const mapObservation = (
  observation: NormalizedFHIR.Observation,
): Errors.Result<Mapping.Observation> => {
  const issues: Errors.DataIssue[] = [];
  const observationId = observation.id;
  const value = observation.value;
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

  const answerNumber = Number(value);

  if (Number.isNaN(answerNumber) || value === null) {
    issues.push(
      issueFactories.observation.invalidObservationValue(observation),
    );
  }

  return {
    data: {
      id: observationId,
      value:
        value === null || Number.isNaN(answerNumber) ? null : Number(value),
      questionnaireResponse: questionnaireResponse ?? "",
      observationDefinition: observationDefinition ?? "",
    },
    issues: issues,
  };
};
