export namespace GlobalTypes {
    type DataIssue = {
        id: string;
        code: DataIssueCode;
        level: 'warning' | 'error';
        message: string;
        userMessage?: string;
        resourceId?: string;
        resourceType?: 'Questionnaire' | 'QuestionnaireResponse' | 'ObservationDefinition' | 'Observation';
        linkId?: string;
        showUser?: boolean;
        context?: Record<string, unknown>;
    };

    type Result<T> = {
        data: T;
        issues: DataIssue[];
    };

    type NumberOrNull = number | null;

    enum DataIssueCode {
        QR_MISSING_QUESTIONNAIRE = "QR_MISSING_QUESTIONNAIRE",
        QR_INVALID_REFERENCE = "QR_INVALID_REFERENCE",
        TRANSFORM_FAILED = "TRANSFORM_FAILED",
        MISSING_FIELD = "MISSING_FIELD",
    }
}
