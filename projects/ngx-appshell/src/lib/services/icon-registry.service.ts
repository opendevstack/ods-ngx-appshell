import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export const APPSHELL_ICON_MAP = new InjectionToken<Record<string, string>>('APPSHELL_ICON_MAP');
export const APPSHELL_ICON_SET_LITERAL = new InjectionToken<string>('APPSHELL_ICON_SET_LITERAL');

@Injectable({ providedIn: 'root' })
export class IconRegistryService {

  private namespace = 'appshell';
  private http: HttpClient;

  constructor(
    httpBackend: HttpBackend,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    @Optional() @Inject(APPSHELL_ICON_SET_LITERAL) private iconSetLiteral?: string,
    @Optional() @Inject(APPSHELL_ICON_MAP) private iconMap?: Record<string, string>,
  ) {
    this.http = new HttpClient(httpBackend);
  }

  async registerIconsFromManifest(manifestUrl: string = 'assets/icons.json'): Promise<void> {
    if (this.iconSetLiteral) {
      this.matIconRegistry.addSvgIconSetLiteralInNamespace(
        this.namespace,
        this.sanitizer.bypassSecurityTrustHtml(this.iconSetLiteral)
      );
      return;
    }

    if (this.iconMap) {
      for (const [name, svg] of Object.entries(this.iconMap)) {
        this.matIconRegistry.addSvgIconLiteralInNamespace(
          this.namespace,
          name,
          this.sanitizer.bypassSecurityTrustHtml(svg)
        );
      }
      return;
    }

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
              if (typeof relativePath !== 'string' || !relativePath.endsWith('.svg')) return;

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
        error: () => resolve()
      });
    });
  }
}