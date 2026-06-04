import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Amplify } from 'aws-amplify';
import { routes } from './app.routes';
import { PageTitleStrategy } from './app.title-strategy';
import { environment } from '../environments/environment';
import { provideLottieOptions } from 'ngx-lottie';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: environment.cognito.userPoolId,
      userPoolClientId: environment.cognito.userPoolClientId,
    },
  },
  API: {
    REST: {
      NuvinaryApi: {
        endpoint: environment.api.endpoint,
        region: environment.api.region,
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ],
};
