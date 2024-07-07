// src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) { }

  register() {
    this.authService.register(this.user).subscribe(
      () => {
        this.toastr.success('Registration successful');
        this.router.navigate(['login']);
      },
      (error) => {
        this.toastr.error('Registration failed');
      }
    );
  }
}
