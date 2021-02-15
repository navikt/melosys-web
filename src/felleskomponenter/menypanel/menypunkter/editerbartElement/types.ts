export enum Status {
  Redigerer,
  RedigeringUtfort,
  IngenData,
}

export interface Symbolsynlighet {
  pencil: boolean;
  bin: boolean;
}

export type SymbolsynlighetMap = Map<Status, Symbolsynlighet>;
