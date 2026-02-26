import { Routes } from '@angular/router';
import { ProductCatalogScreenComponent } from './screens/product-catalog-screen/product-catalog-screen.component';
import { ProductViewScreenComponent } from './screens/product-view-screen/product-view-screen.component';
import { NotificationsScreenComponent } from './screens/notifications-screen/notifications-screen.component';
import { PlatformShellComponent } from './screens/platform-shell/platform-shell.component';
import { BasicShellComponent } from './screens/basic-shell/basic-shell.component';

export const routes: Routes = [
	{
		path: '',
		component: PlatformShellComponent,
		children: [
			{ path: '', component: ProductCatalogScreenComponent },
			{ path: 'item/:id', component: ProductViewScreenComponent },
			{ path: 'notifications', component: NotificationsScreenComponent },
		],
	},
	{
		path: 'basic-shell',
		component: BasicShellComponent,
		children: [
			{ path: '', component: ProductCatalogScreenComponent },
		],
	},
];
