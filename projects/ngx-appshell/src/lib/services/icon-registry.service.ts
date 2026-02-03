import { Injectable, Provider } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class IconRegistryService {
  
  private namespace = 'appshell';

  private http: HttpClient;

  constructor(
    httpBackend: HttpBackend,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.http = new HttpClient(httpBackend);
  }

  registerIconsFromManifest(manifestUrl: string = 'assets/icons/icons.json'): Promise<void> {
    return new Promise<void>((resolve) => {
      this.http.get<Record<string, string> | string[]>(manifestUrl).subscribe({
        next: (manifest) => {
          const basePath = manifestUrl.substring(0, manifestUrl.lastIndexOf('/') + 1);

          if (Array.isArray(manifest)) {
            manifest
              .filter((f) => typeof f === 'string' && f.endsWith('.svg'))
              .forEach((file) => {
                const iconName = file.replace(/\.svg$/i, '');
                const url = basePath + file;
                this.matIconRegistry.addSvgIconInNamespace(
                  this.namespace,
                  iconName,
                  this.sanitizer.bypassSecurityTrustResourceUrl(url)
                );
              });
          } else if (manifest && typeof manifest === 'object') {
            Object.entries(manifest).forEach(([iconName, relativePath]) => {
              if (typeof relativePath !== 'string' || !relativePath.endsWith('.svg')) {
                return;
              }
              const isAbsolute = /^https?:\/\//i.test(relativePath);
              const url = isAbsolute ? relativePath : basePath + relativePath;
              this.matIconRegistry.addSvgIconInNamespace(
                this.namespace,
                iconName,
                this.sanitizer.bypassSecurityTrustResourceUrl(url)
              );
            });
          }

          resolve();
        },
        error: () => {
          resolve();
        },
      });
    });
  }
}