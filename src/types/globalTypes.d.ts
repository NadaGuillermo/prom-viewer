export namespace GlobalTypes {
    type DataIssue = {
        id: string;
        level: 'warning' | 'error';
        message: string;
        resourceId: string | undefined;
        resourceType: 'Questionnaire' | 'QuestionnaireResponse' | 'ObservationDefinition' | 'Observation' | undefined;
        linkId: string | undefined;
    };

    type Result<T> = {
        data: T;
        issues: DataIssue[];
    };

    type NumberOrNull = number | null;
}
