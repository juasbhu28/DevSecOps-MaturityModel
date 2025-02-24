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
        responseType: 'text',
        headers: {
          'Content-Type': 'text/yaml;charset=UTF-8'
        }
      })
      .pipe(
        map(yamlString => {
          try {
            const parsedYaml = parse(yamlString);
            return this.decodeYamlSpecialCharacters(parsedYaml);

            return this.decodeYamlSpecialCharacters(parsedYaml);
          } catch (error) {
            throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }),
        catchError(this.handleError)
      );
  }

  private decodeSpecialCharacters(text: string): string {
    if (!text || text === 'false') {
      return text;
    }
    return text.replace(/\\x([0-9A-Fa-f]{2})/g, (match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
  }

  private decodeYamlSpecialCharacters(obj: any): any {
    if (!obj || obj === false) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.decodeSpecialCharacters(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.decodeYamlSpecialCharacters(item));
    }

    if (typeof obj === 'object') {
      const decodedObj: any = {};
      Object.keys(obj).forEach(key => {
        decodedObj[key] = this.decodeYamlSpecialCharacters(obj[key]);
      });
      return decodedObj;
    }

    return obj;
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
