import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private config: any;
  
  private http: HttpClient;
  
  /**
   * We are not injecting HttpClient, because if you inject HttpClient then angular first resolve all the HTTP_INTERCEPTORS, 
   * and when you provide MsalInterceptor, this makes angular to load MsalService and other component used by Msalinterceptor load before APP_INITIALIZER.
   * To resolve this issue we need to by pass HTTP_INTERCEPTORS, so for this we can use HttpBackend handler, and then create local instance of HttpClient.
   * This will bypass the HTTP_INTERCEPTORS, while getting config file.
   * More info: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/1403
   */
  constructor(private readonly httpHandler: HttpBackend) {
    this.http = new HttpClient(this.httpHandler);
  }
  
  async loadConfig(): Promise<void> {
    return firstValueFrom(this.http.get('./config/config.json'))
      .then((config) => {
        this.config = config;
      })
      .catch((err) => {
        console.error(err);
      });
  }
  
  getConfig() {
    return this.config;
  }
}