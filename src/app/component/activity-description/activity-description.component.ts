import { Component, ViewChildren, QueryList, OnInit } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { YamlParserService } from '../../service/yaml-parser/yaml-parser.service';
import * as md from 'markdown-it';
import { map } from 'rxjs/operators';

/**
 * Interface for meta data strings
 * @author jbotello_meli
 */
interface MetaStrings {
  strings: {
    en: {
      labels: string[];
      KnowledgeLabels: string[];
    };
  };
  teams: string[];
}

/**
 * Interface for implementation details
 * @author jbotello_meli
 */
export interface implementation {
  name: string;
  tags: string[];
  url: string;
  description: string;
}

/**
 * Interface for difficulty of implementation
 * @author jbotello_meli
 */
interface DifficultyOfImplementation {
  knowledge: number;
  time: number;
  resources: number;
}

/**
 * Interface for references
 * @author jbotello_meli
 */
interface References {
  'iso27001-2017': string[];
  'iso27001-2022': string[];
  samm2: string[];
  openCRE: string[];
}

/**
 * Interface for meta information
 * @author jbotello_meli
 */
interface Meta {
  implementationGuide: string;
}

/**
 * Interface for generated YAML data
 * @author jbotello_meli
 */
interface GeneratedYamlData {
  description: string;
  uuid: string;
  risk: string;
  tags: string[];
  measure: string;
  meta?: Meta;
  usefulness?: number;
  difficultyOfImplementation?: DifficultyOfImplementation;
  references?: References;
  dependsOn: string[];
  implementation: implementation[];
  evidence: string;
  comments: string;
  assessment: string;
  isImplemented: boolean;
  teamsImplemented: Record<string, any>;
  teamsEvidence: Record<string, string>;
}

export interface activityDescription {
  dimension: string;
  subDimension: string;
  level: string;
  tags: string[];
  activityName: string;
  uuid: string;
  description: string;
  risk: string;
  measure: string;
  implementatonGuide: string;
  iso: string[];
  iso22: string[];
  samm: string[];
  openCRE: string[];
  knowledge: number;
  resources: number;
  time: number;
  dependsOn: string[];
  implementation: implementation[];
  usefulness: number;
  evidence: string;
  teamsEvidence: Object;
  assessment: string;
  comments: string;
  isImplemented: boolean;
  teamsImplemented: Record<string, any>;
}

@Component({
  selector: 'app-activity-description',
  templateUrl: './activity-description.component.html',
  styleUrls: ['./activity-description.component.css'],
})
export class ActivityDescriptionComponent implements OnInit {
  currentActivity: activityDescription = {
    dimension: '',
    subDimension: '',
    level: '',
    tags: [''],
    activityName: '',
    uuid: '',
    description: '',
    risk: '',
    measure: '',
    implementatonGuide: '',
    samm: [''],
    iso: [''],
    iso22: [''],
    openCRE: [''],
    knowledge: -1,
    resources: -1,
    time: -1,
    dependsOn: [],
    implementation: [],
    usefulness: -1,
    assessment: '',
    evidence: '',
    teamsEvidence: {},
    comments: '',
    isImplemented: false,
    teamsImplemented: {},
  };

  YamlObject: any;
  GeneralLabels: string[] = [];
  KnowledgeLabels: string[] = [];
  TeamList: string[] = [];
  rowIndex: number = 0;
  markdown: md = md();
  SAMMVersion: string = 'OWASP SAMM VERSION 2';
  ISOVersion: string = 'ISO 27001:2017';
  ISO22Version: string = 'ISO 27001:2022';
  openCREVersion: string = 'OpenCRE';
  @ViewChildren(MatAccordion) accordion!: QueryList<MatAccordion>;
  constructor(private route: ActivatedRoute, private yaml: YamlParserService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentActivity.uuid = params['uuid'];
    });

    //gets value from sample file
    this.yaml.setUri('./assets/YAML/meta.yaml');
    console.log(this.perfNow() + 's: meta.yaml fetch');
    this.yaml.getJson().pipe(
      map((data: unknown) => data as MetaStrings)
    ).subscribe(data => {
      console.log(this.perfNow() + 's: meta.yaml');
      this.GeneralLabels = data.strings.en.labels;
      this.KnowledgeLabels = data.strings.en.KnowledgeLabels;
      this.TeamList = data.teams;
      console.log(this.perfNow() + 's: meta.yaml processed');
    });

    //gets value from generated folder
    console.log(this.perfNow() + 's: generated.yaml fetch');
    this.yaml.setUri('./assets/YAML/generated/generated.yaml');
    this.yaml.getJson().pipe(
      map((data: unknown) => data as GeneratedYamlData)
    ).subscribe(data => {
      console.log(this.perfNow() + 's: generated.yaml downloaded');
      this.YamlObject = data;

      this.currentActivity.description = this.defineStringValues(data.description, '');
      this.currentActivity.uuid = this.defineStringValues(data.uuid, '');
      this.currentActivity.risk = this.defineStringValues(data.risk, '');
      this.currentActivity.tags = this.defineStringArrayValues(data.tags, []);
      this.currentActivity.measure = this.defineStringValues(data.measure, '');

      if (data.meta?.implementationGuide) {
        this.currentActivity.implementatonGuide = this.defineStringValues(
          data.meta.implementationGuide,
          ''
        );
      }

      if (data.difficultyOfImplementation) {
        this.currentActivity.knowledge = this.defineIntegerValues(
          data.difficultyOfImplementation.knowledge,
          -1
        );
        this.currentActivity.time = this.defineIntegerValues(
          data.difficultyOfImplementation.time,
          -1
        );
        this.currentActivity.resources = this.defineIntegerValues(
          data.difficultyOfImplementation.resources,
          -1
        );
      }

      if (data.references) {
        this.currentActivity.iso = this.defineStringArrayValues(
          data.references['iso27001-2017'],
          []
        );
        this.currentActivity.iso22 = this.defineStringArrayValues(
          data.references['iso27001-2022'],
          []
        );
        this.currentActivity.samm = this.defineStringArrayValues(
          data.references.samm2,
          []
        );
        this.currentActivity.openCRE = this.defineStringArrayValues(
          data.references.openCRE,
          []
        );
      }

      if (data.usefulness !== undefined) {
        this.currentActivity.usefulness = this.defineIntegerValues(
          data.usefulness,
          -1
        );
      }

      this.currentActivity.dependsOn = this.defineStringArrayValues(data.dependsOn, []);
      this.currentActivity.implementation = this.defineImplementationObject(data.implementation);
      this.currentActivity.evidence = this.defineStringValues(data.evidence, '');
      this.currentActivity.comments = this.defineStringValues(data.comments, '');
      this.currentActivity.assessment = this.defineStringValues(data.assessment, '');
      this.currentActivity.isImplemented = this.defineBooleanValues(data.isImplemented, false);

      let combinedTeamsImplemented: Record<string, any> = {};
      const dataFromLocalStorage: string | null = localStorage.getItem('dataset');

      if (dataFromLocalStorage !== null) {
        const localData = JSON.parse(dataFromLocalStorage);
        let localDataActivity = null;

        for (const subdim of localData) {
          if (subdim?.Activity) {
            for (const activity of subdim.Activity) {
              if (activity?.uuid === data.uuid) {
                console.log('Found', activity);
                localDataActivity = activity;
                break;
              }
            }
          }
          if (localDataActivity) break;
        }

        combinedTeamsImplemented = {
          ...(localDataActivity?.teamsImplemented || {}),
          ...(data.teamsImplemented || {})
        };
      } else {
        combinedTeamsImplemented = data.teamsImplemented || {};
      }

      this.currentActivity.teamsImplemented = {};
      for (const team of this.TeamList) {
        this.currentActivity.teamsImplemented[team] = combinedTeamsImplemented[team];
      }

      this.currentActivity.teamsEvidence = this.defineEvidenceObject(data.teamsEvidence);
      this.openall();
      console.log(this.perfNow() + 's: generated.yaml processed');
    });
  }

  defineStringValues(
    dataToCheck: string,
    valueOfDataIfUndefined: string
  ): string {
    try {
      return this.markdown.render(dataToCheck);
    } catch {
      return valueOfDataIfUndefined;
    }
  }

  defineBooleanValues(
    dataToCheck: boolean,
    valueOfDataIfUndefined: boolean
  ): boolean {
    try {
      return dataToCheck;
    } catch {
      return valueOfDataIfUndefined;
    }
  }

  defineStringArrayValues(
    dataToCheck: string[],
    valueOfDataIfUndefined: string[]
  ): string[] {
    try {
      return dataToCheck;
    } catch {
      return valueOfDataIfUndefined;
    }
  }

  defineIntegerValues(
    dataToCheck: number,
    valueOfDataIfUndefined: number
  ): number {
    try {
      return dataToCheck;
    } catch {
      return valueOfDataIfUndefined;
    }
  }

  defineEvidenceObject(dataToCheck: { [key: string]: string }): Object {
    var dataToReturn: { [key: string]: string } = {};
    for (var key in dataToCheck) {
      dataToReturn[key] = this.defineStringValues(dataToCheck[key], '');
    }
    return dataToReturn;
  }

  defineImplementationObject(dataToCheck: implementation[]): implementation[] {
    var dataToReturn: implementation[] = [];
    for (var data in dataToCheck) {
      var temp: implementation = {
        name: '',
        url: '',
        tags: [],
        description: '',
      };
      temp['name'] = this.defineStringValues(dataToCheck[data]['name'], '');
      temp['url'] = this.defineStringValues(dataToCheck[data]['url'], '');
      temp['description'] = this.defineStringValues(
        dataToCheck[data]['description'],
        ''
      );
      temp['tags'] = this.defineStringArrayValues(
        dataToCheck[data]['tags'],
        []
      );
      //console.log(temp)
      dataToReturn.push(temp);
    }
    //console.log(dataToReturn)
    return dataToReturn;
  }

  // Expand all function
  openall(): void {
    this.accordion.forEach(element => {
      element.openAll();
    });
  }

  // Close all function
  closeall(): void {
    this.accordion.forEach(element => {
      element.closeAll();
    });
  }

  perfNow() {
    return (performance.now() / 1000).toFixed(3);
  }
}
