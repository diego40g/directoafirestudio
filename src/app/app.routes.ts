import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TaskComponent } from './pages/task/task.component';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'tasks', component: TaskComponent, canActivate: [authGuard]},
    { path: '', redirectTo: '/tasks', pathMatch: 'full' },
];
