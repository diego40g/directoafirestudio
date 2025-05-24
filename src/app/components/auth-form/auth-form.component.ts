import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.css'
})
export class AuthFormComponent {
  email = '';
  password = '';
  passwordConfirm = '';

  @Output() loginSubmit = new EventEmitter<{ email: string, password: string }>();
  @Output() registerSubmit = new EventEmitter<{ email: string, password: string }>();

  @Input() isLogin = false;

  onLoginSubmit() {
    this.loginSubmit.emit({ email: this.email, password: this.password });
  }

  onRegisterSubmit() {
    if(this.password !== this.passwordConfirm) {
      alert('Passwords do not match');
      return;
    }
    console.log(this.email, this.password)
    this.registerSubmit.emit({ email: this.email, password: this.password });
  }

  // This method will be called by the parent component to clear the form after submission
  clearForm() {
    this.email = '';
    this.password = '';
    this.passwordConfirm = '';
  }


}
