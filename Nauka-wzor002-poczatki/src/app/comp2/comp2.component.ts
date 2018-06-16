import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cos2',
  /** zmiana nazwy selectora */
  templateUrl: './comp2.component.html',
  styleUrls: ['./comp2.component.css']
})
export class Comp2Component implements OnInit {
  
  zm1com2 = 'cos';

  constructor() { }

  ngOnInit() {
  }

}
