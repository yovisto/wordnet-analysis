import { Word } from "./word";

export interface WeightedWord extends Omit<Word, 'identifier'> {     
    identifier: "WeightedWord"
    weight: number;
}