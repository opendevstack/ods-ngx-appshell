import { AppShellTag } from "./appshell-tag";

export interface AppShellProduct {
    id: string;
    title: string;
    shortDescription: string;
    description: string;
    image?: string;
    link?: string;
    tags?: AppShellTag[];
    authors: string[];
    date?: Date;
}