import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Amplify } from 'aws-amplify';
import { routes } from './app.routes';
import { PageTitleStrategy } from './app.title-strategy';
import { environment } from '../environments/environment';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: environment.cognito.userPoolId,
      userPoolClientId: environment.cognito.userPoolClientId,
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
  ],
};
