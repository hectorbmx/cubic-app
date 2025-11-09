import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Auth
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    });
  }
  // Auth
register(email: string, password: string, passwordConfirmation: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/register`, { 
    email, 
    password,
    password_confirmation: passwordConfirmation 
  }, {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
}

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: this.getHeaders()
    });
  }

  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      headers: this.getHeaders()
    });
  }

  // Clientes
  getClientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes`, {
      headers: this.getHeaders()
    });
  }

  getCliente(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Obras
  getObras(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/obras`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  getObra(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/obras/${id}`, {
      headers: this.getHeaders()
    });
  }
}