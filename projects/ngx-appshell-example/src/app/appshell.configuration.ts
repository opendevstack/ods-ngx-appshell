import { Injectable } from "@angular/core";

@Injectable()
export class AppShellConfiguration {
    public static headerVariant = ''; // theme-white | theme-purple | theme-blue
    public static applicationSymbol = 'symbol-accent-green.svg';
    public static applicationName = 'Application Name';
    public static appShellHelpLink = {
        anchor: 'https://boehringer.sharepoint.com/',
        icon: 'bi-question-mark-circle-icon'
    };
    public static headerLinks = [
        {label: 'About Us', anchor: '/'},
        {label: 'Feedback', anchor: '/product'},
        {label: 'Contact', anchor: '/contact'}
    ];
    public static sidenavSections = [
        {
            label: 'SECTION 1',
            links: [
                {label: 'Page 1', anchor: '/'},
                {label: 'Page 2', anchor: '/product'},
                {label: 'Page 3', anchor: 'https://www.google.com'}
            ]
        },
        {
            label: 'SECTION 2',
            links: [
                {label: 'Page 1', anchor: '/subsection', icon: 'bi-house-icon'},
                {label: 'Page 2', anchor: '/subsection2', icon: 'bi-house-icon'},
                {label: 'Page 3', anchor: 'https://www.google.com', icon: 'bi-house-icon'}
            ]
        }
    ];
    public static sidenavLinks = {
        label: 'Links',
        links: [
            {label: 'Link 1', anchor: 'https://www.google.com', icon: 'bi-chain-linked-icon', target: '_blank'},
            {label: 'Link 2', anchor: 'https://www.google.com', icon: 'bi-chain-linked-icon', target: '_blank'},
            {label: 'Link 3', anchor: 'https://www.google.com', icon: 'bi-chain-linked-icon', target: '_blank'}
        ]
    };
}
