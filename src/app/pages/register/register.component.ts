import { Component } from '@angular/core';
import { AuthFormComponent } from '../../components/auth-form/auth-form.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [AuthFormComponent, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private authService: AuthService) {}

  private handleRegisterError(error: any) {
    console.error('Registration failed:', error);

    switch (error.code) {
      case 'auth/weak-password':
        alert('The password must be at least 6 characters long.');
        break;
      case 'auth/invalid-email':
        alert('Invalid email. Please use a valid email address.');
        break;
      case 'auth/email-already-in-use':
        alert('The email address is already in use by another account.');
        break;
      default:
        alert('An unexpected error occurred. Please try again later')
    }
  }


  async handleRegister(credentials: { email: string, password: string }) {
    try {
      await this.authService.registerWithEmailPassword(credentials.email, credentials.password);
      alert('Registration successful!');
    } catch (error) {
      this.handleRegisterError(error);
    }
  }
}
