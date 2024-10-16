import { User } from '#types/dto/user.dto';
import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { BehaviorSubject, catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authVersion = 2;

  constructor(private http: HttpClient) {}

  login(username: string, pass: string) {
    console.log({ username, pass });
    return this.http.post<User>('api/auth/login', { username, pass }).pipe(
      tap((user) => {
        this.setAuthData(user);
      }),
    );
  }

  register(data: { [key: string]: any }) {
    return this.http.post<User>('api/auth/register', data).pipe(
      tap((user) => {
        this.setAuthData(user);
      }),
      catchError((error) => {
        if (isDevMode()) console.error(error);
        return error.error || error;
      }),
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage?.removeItem('user');
  }

  /**
   * use this function to load the auth data after the page is refreshed
   * i.e. load data from localStorage into this.currentUserSubject
   * call it in app.component's ngOnInit()
   */
  loadAuthData() {
    // in SSR localStorage is not defined
    if (typeof localStorage === 'undefined') return;

    // remove auth_token if its version is obsoleted
    // todo: use refresh_token instead to refresh the auth_token
    let authVersion = localStorage.getItem('authVersion');
    if (!authVersion || +authVersion < this.authVersion) {
      this.logout();
      return;
    }

    let userString = localStorage.getItem('user');
    if (userString) {
      try {
        let user: User = JSON.parse(userString);
        this.currentUserSubject.next(user);
      } catch {
        this.currentUserSubject.next(null);
      }
    } else {
      this.currentUserSubject.next(null);
    }
  }

  /**
   * use this method in places where you don't need reactivity
   * i.e. when you don't want to get updates when the currentUser state is changed
   * otherwise, subscribe to currentUser$
   */
  isAuthenticated() {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  setAuthData(user: User) {
    if (!user.auth_token) {
      throw new Error("the response doesn't contain an access token");
    }
    this.currentUserSubject.next(user);
    localStorage?.setItem('user', JSON.stringify(user));
    localStorage?.setItem('authVersion', `${this.authVersion}`);
  }
}
