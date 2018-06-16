import { Klasa1comp1 } from './klasa1comp1';
import { Klasa2comp1 } from './klasa2comp1';
import { Component, OnInit } from '@angular/core';

/** Testowy komentarz. */
/** Wzorcowy komponent !!!!!!!!!!!*/

@Component({
  selector: 'app-comp1',
  /** Jak komponent bêdzie rozpoznawany */
  templateUrl: './comp1.component.html',
  /** Wybór "template file" rozumiem ze .html */
  styleUrls: ['./comp1.component.css']
  /** Wybór stylu CSS */
})
export class Comp1Component implements OnInit {
  /** Prawdopodobnie deklaracja klasy w TS*/
  zm1comp1 = 'zm1comp1 Jakis teks bez polskich znakow';
  zm2comp1: Klasa1comp1 = {
    id: 1,
    name: 'Tekst zmiennej zm1comp1'
  };

  zm3: Klasa2comp1 = {
  id2: 7,
    name2: 'Tekst zm3 com1'
  }; 

  constructor() { }
    /** Prawdopodobnie stand kontruktor do sprawdzenia pozniej*/
  ngOnInit() {
    /** Testowy komentarz. */
    }

}


