// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) { }

  login() {
    this.authService.login(this.user).subscribe(
      (response: any) => {
        localStorage.setItem('token', response.access_token);
        this.toastr.success('Login successful');
        this.router.navigate(['map']);
      },
      (error) => {
        this.toastr.error('Login failed');
      }
    );
  }
}
