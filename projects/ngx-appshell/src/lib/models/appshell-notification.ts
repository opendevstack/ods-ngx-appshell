export interface AppShellNotification {
    id: string;
    subject: string;
    type?: 'info' | 'success' | 'error';
    title?: string;
    message?: string;
    date?: Date;
    expanded?: boolean;
    read: boolean;
}