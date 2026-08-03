/**
 * @param resource - a raw FHIR Observation resource
 * @returns the canonical url of the ObservationDefinition the observation instantiates, or undefined
 * @description Reads the workflow-instantiatesCanonical extension used to link an Observation to its ObservationDefinition.
 */
export const getObservationDefinitionCanonicalUrlFromObservation = (resource: any): string | undefined => {
  return resource.extension?.find(
    (ext: any) => ext.url === "http://hl7.org/fhir/StructureDefinition/workflow-instantiatesCanonical"
  )?.valueCanonical;
}

// ok
export const getQuestionnaireResponseIdFromObservationReferenceAttribute = (resource: any): string |undefined => {
  const questionnaireResponse: string | undefined = resource.derivedFrom?.find((entry: any) => entry.reference !== undefined)?.reference;

  if (questionnaireResponse === undefined) {
    return undefined;
  }

  // reference has form "QuestionnaireResponse/[id]"

  const splitPosition = questionnaireResponse.indexOf("/");
  if (splitPosition === -1) {
    return undefined;
  }

  return questionnaireResponse.slice(splitPosition + 1);
}
