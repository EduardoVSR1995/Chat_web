import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'front',
    renderMode: RenderMode.Prerender
  }
];
