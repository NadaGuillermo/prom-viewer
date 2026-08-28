export const DataIssueCode = {
        EMPTY_RESOURCE: "EMPTY_RESOURCE",
        MISSING_RESOURCE_IN_CONFIG: "MISSING_RESOURCE_IN_CONFIG",
        MISSING_RESOURCE_LINK: "MISSING_RESOURCE_LINK",
        CONTRADICTING_VALUES: "CONTRADICTING_VALUES",
        INVALID_REFERENCE: "INVALID_REFERENCE",
        INVALID_VALUE_TYPE: "INVALID_VALUE_TYPE",
        INVALID_VALUE: "INVALID_VALUE",
        INVALID_NUMBER_OF_VALUES: "INVALID_NUMBER_OF_VALUES",
        MISSING_FIELD: "MISSING_FIELD",
        MISSING_VALUE: "MISSING_VALUE",
        DUPLICATE_DEFINITION_IN_RESOURCE_AND_CONFIG: "DUPLICATE_DEFINITION_IN_RESOURCE_AND_CONFIG",
    } as const;

export const userMessageResponseNotDisplayed = "Some questionnaire responses could not be processed and will not be displayed.";
export const userMessageQuestionnaireNotDisplayed = "Some questionnaires are not configured correctly and will not be displayed."