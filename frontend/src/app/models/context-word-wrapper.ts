import { ContextWord } from "./context-word";

export interface ContextWordWrapper {
    contextWords: Array<ContextWord[]>;
    text: string;
    is_rdf: boolean;
}