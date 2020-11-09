export interface Redigerer<T> {
  redigerbart: boolean,
  overordnetFeltNavn: string,
  verdier: T,
  settVerdi: (felt: string, verdi: any) => void,
  slett: () => void,
}

export interface RedigeringUtfort<T> {
  verdier: T[],
}

// TODO: Disse typene tilhører egentlig editableElementListe/enRedigeringsknappliste og burde defineres der
