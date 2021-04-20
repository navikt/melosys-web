export enum Status {
  Redigerer,
  RedigeringUtfort,
  IngenData,
}

export interface Symbolsynlighet {
  pencil: boolean;
  bin: boolean;
}

export type SymbolsynlighetConfig = Partial<Record<Status, Symbolsynlighet>>;
