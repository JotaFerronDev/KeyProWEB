// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService, private toastr: ToastrService) { }

  login(user: any) {
    return this.http.post(`${this.apiUrl}/users/login`, user);
  }

  register(user: any) {
    return this.http.post(`${this.apiUrl}/users/register`, user);
  }

  logout() {
    localStorage.removeItem('token');
    this.toastr.info('Logged out');
    this.router.navigate(['login']);
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.user_id;
    }
    return null;
  }
}
