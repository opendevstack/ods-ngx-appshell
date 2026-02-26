import { Injectable } from "@angular/core";

@Injectable()
export class AppShellConfiguration {
    public static headerVariant = ''; // theme-white | theme-purple | theme-blue
    public static applicationSymbol = undefined;//'symbol.svg';
    public static applicationLogo = 'logo.svg';
    public static applicationName = 'Application Name';
    public static applicationNameLink = '/';
    public static appShellHelpLink = {
        anchor: 'https://google.com/',
        icon: 'headset_mic',
        label: 'Help',
    };
    public static appShellNotificationsLink = {
        anchor: '/notifications',
        icon: 'notifications',
        label: 'Notifications'
    };
    public static headerLinks = [
        {label: 'About Us', anchor: '/'},
        {label: 'Feedback', anchor: '/basic-shell'},
        {label: 'Contact', anchor: '/contact'}
    ];
    public static sidenavSections = [
        {
            label: 'SECTION 1',
            links: [
                {label: 'Platform Layout', anchor: '/'},
                {label: 'Basic Layout', anchor: '/basic-shell'},
                {label: 'Page 3', anchor: 'https://www.google.com'}
            ]
        },
        {
            label: 'SECTION 2',
            links: [
                {label: 'Page 1', anchor: '/subsection', icon: 'house'},
                {label: 'Page 2', anchor: '/subsection2', icon: 'house'},
                {label: 'Page 3', anchor: 'https://www.google.com', icon: 'house'}
            ]
        }
    ];
    public static sidenavLinks = {
        label: 'Links',
        links: [
            {label: 'Link 1', anchor: 'https://www.google.com', icon: 'link', target: '_blank'},
            {label: 'Link 2', anchor: 'https://www.google.com', icon: 'link', target: '_blank'},
            {label: 'Link 3', anchor: 'https://www.google.com', icon: 'link', target: '_blank'}
        ]
    };
    public static toastLimitInScreen = 3;
}
