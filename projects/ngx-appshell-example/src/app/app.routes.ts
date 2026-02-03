import { Routes } from '@angular/router';
import { ProductCatalogScreenComponent } from './screens/product-catalog-screen/product-catalog-screen.component';
import { ProductViewScreenComponent } from './screens/product-view-screen/product-view-screen.component';
import { NotificationsScreenComponent } from './screens/notifications-screen/notifications-screen.component';

export const routes: Routes = [
	{ path: '', component: ProductCatalogScreenComponent },
	{ path: 'item/:id', component: ProductViewScreenComponent },
	{ path: 'notifications', component: NotificationsScreenComponent }
];
