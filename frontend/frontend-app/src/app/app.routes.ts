import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DocumentTypesComponent } from './components/document-types/document-types.component';
import { NewRequestComponent } from './components/new-request/new-request.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { DocumentDetailComponent } from './components/document-detail/document-detail.component';
import { AdminRequestsComponent } from './components/admin-requests/admin-requests.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ── Shared (both roles) ──────────────────────────────────────────────────
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },

  // ── User routes ──────────────────────────────────────────────────────────
  {
    path: 'document-types',
    component: DocumentTypesComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'user' },
  },
  {
    path: 'requests/new',
    component: NewRequestComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'user' },
  },
  {
    path: 'requests',
    component: DocumentListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'requests/:id',
    component: DocumentDetailComponent,
    canActivate: [authGuard],
  },

  // ── Admin routes ─────────────────────────────────────────────────────────
  {
    path: 'admin/requests',
    component: AdminRequestsComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
  },

  { path: '**', redirectTo: '/login' },
];