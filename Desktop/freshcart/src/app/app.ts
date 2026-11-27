import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeaturesStrip } from './shared/layout/features-strip';
import { SiteFooter } from './shared/layout/site-footer';
import { SiteHeader } from './shared/layout/site-header';
import { TopBar } from './shared/layout/top-bar';
import { ToastContainer } from './shared/ui/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopBar, SiteHeader, FeaturesStrip, SiteFooter, ToastContainer],
  template: `
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
    <app-toast-container />
    <app-top-bar />
    <app-site-header />
    <main id="main" class="min-h-[60vh]"><router-outlet /></main>
    <app-features-strip />
    <app-site-footer />
  `,
})
export class App {}
