export interface Task {
    id?: string;
    createdBy: string;
    title: string;
    createdByEmail?: string;
    description: string;
    invitation: Array<string>;
    originalCreatorId?: string;
    originalCreatorEmail?: string;
    isSharedCopy?: boolean;
    completed?: boolean;
}

export interface TaskInvitation {
    title: string;
    description: string;
    invitation: Array<string>;
}