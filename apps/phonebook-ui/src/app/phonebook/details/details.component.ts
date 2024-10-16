import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  isDevMode,
  signal,
} from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Alert } from '#app/shared/alert/alert.component';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta } from '@engineers/ngx-utils';
import { meta } from '#configs/meta';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { PageComponent } from '#app/shared/components/page/page.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Contact } from '#types/dto/contact.dto';

@Component({
  selector: 'app-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    PageComponent,
    RouterModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export default class PostDetailsComponent {
  alert = signal<Alert | undefined>(undefined);
  isLoading = signal(true);
  data$: Observable<Contact>;
  meta = signal<Meta | undefined>(undefined);

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.data$ = this.activatedRoute.paramMap.pipe(
      switchMap((params) =>
        this.http.get<any>(`api/contacts/${params.get('id')}`),
      ),
      tap((res) => {
        if (!res.id)
          throwError(
            () =>
              'cannot find the requested contact <br /><a href="/">view all contacts</a>',
          );
      }),
      tap(() => this.meta.set(meta)),
      catchError((error) => {
        this.alert.set({
          status: 'error',
          message: error,
          big: true,
        });
        if (isDevMode()) console.error(error);
        return of();
      }),
      tap(() => this.isLoading.set(false)),
    );
  }
}
