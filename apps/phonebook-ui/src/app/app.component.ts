import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import ToolbarComponent from './toolbar/toolbar.component';
import { AuthService } from './users/auth/auth.service';
import { PlatformService } from '@engineers/ngx-utils';
import { meta } from '#configs/meta';

/**
 * this allows you to inject any service outside an injector context
 */
export let AppInjector: Injector;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ToolbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = meta.title || meta.name;

  constructor(
    private auth: AuthService,
    private platform: PlatformService,
    private injector: Injector,
  ) {
    AppInjector = this.injector;
  }

  ngOnInit(): void {
    this.auth.loadAuthData();
  }
}
