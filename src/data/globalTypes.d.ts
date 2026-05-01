export namespace Mapping {
    type DataIssue = {
        id: string;
        level: 'warning' | 'error';
        message: string;
        path?: string; // e.g. "item[3].answer[0]"
    };

    type Result<T> = {
        data: T;
        issues: DataIssue[];
    };
}
