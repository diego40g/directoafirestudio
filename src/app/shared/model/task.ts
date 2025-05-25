export interface Task {
    id?: string;
    createdBy: string,
    title: string;
    description: string;
    invitation: Array<string>;
}
