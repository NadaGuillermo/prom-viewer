export namespace Mapping {
    type DataIssue = {
        id: string;
        level: 'warning' | 'error';
        message: string;
        resourceId: string | undefined;
        resourceType: string | undefined;
        linkId: string | undefined;
    };

    type Result<T> = {
        data: T;
        issues: DataIssue[];
    };
}
