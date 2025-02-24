import { HttpClient, HttpHandler } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { YamlParserService } from './yaml-parser.service';

describe('YAMLParserService', () => {
  let service: YamlParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClientTestingModule, YamlParserService, HttpClient, HttpHandler],
    });
    service = TestBed.inject(YamlParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
