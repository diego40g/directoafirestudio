export interface Task {
    id?: string;
    createdBy: string;
    title: string;
    description: string;
    invitation: Array<string>;
    originalCreatorId?: string;
    isSharedCopy?: boolean;
}

export interface TaskInvitation {
    title: string;
    description: string;
    invitation: Array<string>;
}