export namespace Errors {
    interface DataIssue {
        id: string;
        code: DataIssueCode;
        level: 'warning' | 'error';
        message: string;
        context: issueContext;
        userMessage?: string;
        resourceType?: 'Questionnaire' | 'QuestionnaireResponse' | 'ObservationDefinition' | 'Observation';
        showUser?: boolean;
    };

    interface issueContext {
        resourceId: string;
        relatedResourceIds?: string[];
        field?: string;
        value?: unknown;
    };

    interface Result<T> {
        data: T;
        issues: DataIssue[];
    };
    
    
}
