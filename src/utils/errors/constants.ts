export const DataIssueCode = {
        QR_MISSING_QUESTIONNAIRE: "QR_MISSING_QUESTIONNAIRE",
        QR_EMPTY: "QR_EMPTY",
        Q_NOT_IN_CONFIG: "Q_NOT_IN_CONFIG",
        O_MISSING_QUESTIONNAIRE_RESPONSE: "O_MISSING_QUESTIONNAIRE_RESPONSE",
        O_MISSING_OBSERVATION_DEFINITION: "O_MISSING_OBSERVATION_DEFINITION",
        OD_CONTRADICTING_CONFIG: "OD_CONTRADICTING_CONFIG",
        INVALID_REFERENCE: "INVALID_REFERENCE",
        INVALID_VALUE_TYPE: "INVALID_VALUE_TYPE",
        INVALID_VALUE: "INVALID_VALUE",
        INVALID_NUMBER_OF_VALUES: "INVALID_NUMBER_OF_VALUES",
        MISSING_FIELD:"MISSING_FIELD",
    } as const;

export const userMessageMissingResponse = "Some questionnaire responses could not be processed and will not be displayed.";
export const userMessageMissingQuestionnaire = "Some questionnaires are not configured correctly and will not be displayed."