import { DATA_ISSUE_CODES } from "./constants";

export type DataIssueCode = typeof DATA_ISSUE_CODES[number];
export interface DataIssue {
    id: string;
    code: DataIssueCode;
    level: 'warning' | 'error';
    message: string;
    context: issueContext;
    userMessage?: string;
    resourceType?: 'Questionnaire' | 'QuestionnaireResponse' | 'ObservationDefinition' | 'Observation';
    showUser?: boolean;
}

export interface issueContext {
    resourceId: string;
    relatedResourceIds?: string[];
    field?: string;
    value?: unknown;
}

export interface Result<T> {
    data: T;
    issues: DataIssue[];
}
