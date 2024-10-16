import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  signal,
} from '@angular/core';
import {
  AsyncPipe,
  DOCUMENT,
  NgFor,
  NgIf,
  NgStyle,
  PlatformLocation,
} from '@angular/common';
import { Alert } from '#app/shared/alert/alert.component';
import { HttpClient } from '@angular/common/http';
import { Html2textPipe, Meta } from '@engineers/ngx-utils';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { meta } from '#configs/meta';
import { GetMany } from '#types/interfaces/get-many.interface';
import { catchError, Observable, of, tap } from 'rxjs';
import { PageComponent } from '#app/shared/components/page/page.component';
import { Contact } from '#types/dto/contact.dto';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  imports: [
    MatListModule,
    RouterModule,
    NgIf,
    NgFor,
    NgStyle,
    PageComponent,
    AsyncPipe,
    MatListModule,
    MatIconModule,
  ],
  providers: [Html2textPipe],
})
export default class PostsListComponent {
  data$: Observable<GetMany<Contact>>;
  isLoading = signal(true);
  alert = signal<Alert | undefined>(undefined);
  meta = signal<Meta | undefined>(undefined);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.meta.set(meta);
    this.data$ = this.http.get<GetMany<Contact>>(`api/contacts`).pipe(
      catchError((err) => {
        this.alert.set({
          status: 'error',
          message: err,
          big: true,
        });
        return of();
      }),
      tap(() => {
        this.isLoading.set(false);
      }),
    );
  }
}
