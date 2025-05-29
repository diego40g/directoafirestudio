import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AuthFormComponent } from "../../components/auth-form/auth-form.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [AuthFormComponent, RouterLink],
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  private handleLoginError(error: any) {
    console.error('Login failed:', error);

    switch (error.code) {
      case 'auth/invalid-email':
        alert('User incorrect. Please use email.');
        break;
      case 'auth/invalid-credential':
        alert('Incorrect password. Please try again.');
        break;
      default:
        alert('An unexpected error occurred. Please try again later.');
    }
  }

  handleLogin(credentials: { email: string, password: string }) {
    this.authService.loginWithEmailPassword(credentials.email, credentials.password)
      .then(() => this.router.navigate(['/tasks']))
      .catch(this.handleLoginError.bind(this));
  }
}
