import { Injectable } from '@angular/core';
import {ColorTranslator} from "colortranslator";
import {hashCode} from "./util";

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  constructor() { }

  colorPerson(personId: string) {
    return ColorTranslator.toRGB({ h: Math.abs(hashCode(personId) % 360), s: '50%', l: '50%' })
  }
}
