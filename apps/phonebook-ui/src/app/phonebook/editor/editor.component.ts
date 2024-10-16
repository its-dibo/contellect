import {
  ChangeDetectionStrategy,
  Component,
  isDevMode,
  signal,
} from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Alert } from '#app/shared/alert/alert.component';
import { HttpClient } from '@angular/common/http';
import { FormComponent, SubmitEvent } from '#app/shared/form/form.component';
import { QuillConfig, QuillModule } from 'ngx-quill';
import { FormlyQuillComponent } from '@engineers/ngx-formly';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { PageComponent } from '#app/shared/components/page/page.component';
import { Meta } from '@engineers/ngx-utils';
import { meta } from '#configs/meta';
import { Contact } from '#types/dto/contact.dto';

export const quillConfig: QuillConfig = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: [false, 2, 3, 4] }, { size: ['small', false, 'large'] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ direction: 'rtl' }, { direction: 'ltr' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
    syntax: true,
  },
  placeholder: 'notes ...',
  debug: isDevMode() ? 'log' : 'error',
  // uses angular DomSanitizer to sanitize html values
  sanitize: true,
};

@Component({
  selector: 'app-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  imports: [
    NgIf,
    FormComponent,
    QuillModule,
    RouterModule,
    PageComponent,
    AsyncPipe,
  ],
})
export default class PostsEditorComponent {
  fields$: Observable<FormlyFieldConfig[]>;
  model = signal<{ [key: string]: any }>({});
  /** the item to be edited */
  itemId = signal<string | null>(null);
  meta = signal<Meta | undefined>(undefined);
  isLoading = signal(true);
  alert = signal<Alert | undefined>(undefined);

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.fields$ = this.activatedRoute.paramMap.pipe(
      switchMap((params) => {
        let itemId = params.get('id');
        this.itemId.set(itemId);
        return itemId
          ? this.http.get<Contact>(`api/contacts/${itemId}`)
          : of(null);
      }),
      switchMap((data) => {
        if (this.itemId()) {
          if (!data?.id)
            return throwError(() => `This contact is not existing`);
          this.model.set(data);
          return of(data);
        }

        return of({});
      }),
      tap((data) => this.meta.set({ ...meta, ...data })),
      map(() => [
        {
          key: 'name',
          props: {
            required: true,
          },
        },
        {
          key: 'phone',
          props: {
            required: true,
          },
        },
        {
          key: 'address',
        },
        {
          key: 'notes',
          type: FormlyQuillComponent,
          props: quillConfig,
        },
      ]),
      catchError((err) => {
        console.error(err);
        this.alert.set({
          status: 'error',
          message: `${err} <hr /><a href="/">view All contacts</a>`,
          big: true,
        });
        return of();
      }),
      tap(() => {
        this.isLoading.set(false);
      }),
    );
  }

  onSubmit(ev: SubmitEvent): void {
    this.isLoading.set(true);

    let req = this.itemId()
      ? this.http.patch<{ id: string }>(
          `api/contacts/${this.itemId()}`,
          ev.data,
        )
      : this.http.post<{ id: string }>('api/contacts', ev.data);

    req
      .subscribe({
        next: (res) => {
          if (!this.itemId() && !res.id) {
            this.alert.set({
              status: 'error',
              message: 'failed! no id returned',
            });
            return;
          }
          this.alert.set({
            status: 'ok',
            message: `the contact is created successfully. <a href="/${
              res.id || this.itemId()
            }">view</a> | <a href="/${this.itemId() || res.id}/edit">Edit</a>`,
          });
          // reset the form after creating a new post
          !this.itemId() && ev.form.reset();
        },
        error: (err) => {
          if (isDevMode()) console.error(err);
          this.alert.set({
            status: 'error',
            message: err.error?.message || err.message || err.error || err,
          });
        },
      })
      .add(() => {
        this.isLoading.set(false);
        window.scroll({ top: 0, behavior: 'smooth' });
      });
  }
}
