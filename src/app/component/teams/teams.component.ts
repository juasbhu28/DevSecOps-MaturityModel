import { Component, OnInit } from '@angular/core';
import { YamlParserService } from 'src/app/service/yaml-parser/yaml-parser.service';
import * as yaml from 'js-yaml';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css'],
})
export class TeamsComponent implements OnInit {
  YamlObject: any;
  teamList: any;
  teamGroups: Map<string, string[]> = new Map();

  constructor(private yaml: YamlParserService) {}

  ngOnInit(): void {
    this.yaml.setUri('./assets/YAML/meta.yaml');
    this.yaml.getJson().subscribe((data: any) => {
      this.YamlObject = data;

      console.log(this.YamlObject);
      this.teamList = this.YamlObject['teams'];
      this.teamGroups = this.YamlObject['teamGroups'];

      console.log('teamList', this.teamList);
      console.log('teamGroups', this.teamGroups);
    });
  }

  getTeamArray(key: string): string[] {
    return this.teamGroups.get(key) || [];
  }

  unsorted() {
    return 0;
  }
}
