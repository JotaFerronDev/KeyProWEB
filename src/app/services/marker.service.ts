// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Marker } from '../models/marker.model';
import { ApiResponse } from '../models/api-reponse.model';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) { }

  get_markers(): Observable<Marker[]> {
    return this.http.get<Marker[]>(`${this.apiUrl}/markers`);
  }

  register_marker(marker: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/markers`, marker);
  }
}
