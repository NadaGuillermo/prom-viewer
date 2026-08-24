export namespace Errors {
    type DataIssue = {
        id: string;
        code: DataIssueCode;
        level: 'warning' | 'error';
        message: string;
        context: issueContext;
        userMessage?: string;
        resourceType?: 'Questionnaire' | 'QuestionnaireResponse' | 'ObservationDefinition' | 'Observation';
        showUser?: boolean;
    };

    type issueContext = {
        resourceId: string;
        relatedResourceIds?: string[];
        field?: string;
        value?: unknown;
    };

    type Result<T> = {
        data: T;
        issues: DataIssue[];
    };
    
    
}
