import { Component, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { AlertComponent, Alert } from '#app/shared/alert/alert.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { fieldsMatchValidator } from '@engineers/ngx-formly';
import { FormComponent } from '../../../shared/form/form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormGroup } from '@angular/forms';
import LoginComponent from '../login/login.component';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';

export interface DialogData {
  title?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports: [
    CommonModule,
    AlertComponent,
    FormComponent,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
})
export default class RegisterComponent {
  fields?: FormlyFieldConfig[];
  loading = true;
  alert?: Alert;
  platform = inject(PLATFORM_ID);

  constructor(
    public dialogRef: MatDialogRef<RegisterComponent>,
    private dialog: MatDialog,
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data?: DialogData,
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe({
      next: (user) => {
        // if already logged in
        if (user) {
          this.alert = {
            status: 'error',
            message: 'you already loggedIn. <a href="/">Go to home page</a>',
            big: true,
          };

          this.loading = false;
        } else {
          this.fields = [
            {
              key: 'username*',
            },
            {
              fieldGroup: [
                {
                  key: 'password*',
                  props: {
                    minLength: 8,
                  },
                },
                {
                  key: 'passwordConfirm*',
                  type: 'password',
                  props: {
                    label: 'confirm password',
                    description: 'repeat the password again',
                  },
                },
              ],
              validators: {
                validation: [fieldsMatchValidator],
              },
            },
          ];
        }

        this.loading = false;
      },
    });
  }

  onSubmit(ev: { data: { [key: string]: any }; form: FormGroup }): void {
    this.loading = true;
    ev.data.pass = ev.data.password;

    this.auth
      .register(ev.data)
      .subscribe({
        next: (res) => {
          this.dialogRef.close();
        },
        error: (error) => {
          this.alert = {
            status: 'error',
            message: error.message,
          };
        },
      })
      .add(() => {
        this.loading = false;
      });
  }

  login() {
    this.dialogRef.close();
    this.dialog.open(LoginComponent);
  }
}
