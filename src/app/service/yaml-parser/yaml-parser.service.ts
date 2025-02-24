import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { parse } from 'yamljs';

@Injectable({
  providedIn: 'root'
})
export class YamlParserService {
  private uri: string = './';

  constructor(private http: HttpClient) {}

  setUri(uri: string): void {
    this.uri = uri;
  }

  public getJson(): Observable<unknown> {
    return this.http
      .get(this.uri, {
        observe: 'body',
        responseType: 'text'
      })
      .pipe(
        map(yamlString => {
          try {
            return parse(yamlString);
          } catch (error) {
            throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error instanceof Error ?
      error.error.message :
      `Server returned code ${error.status} with body "${error.error}"`;
    return throwError(() => new Error(message));
  }
}
