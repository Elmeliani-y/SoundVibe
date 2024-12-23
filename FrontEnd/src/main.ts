import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
<<<<<<< HEAD
=======
import{  provideHttpClient} from '@angular/common/http';


>>>>>>> e0b4a316b1d482360a5e51732e77a6b10324e03f
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient()
  ]
})