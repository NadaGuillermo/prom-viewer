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
