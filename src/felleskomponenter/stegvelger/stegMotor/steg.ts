import * as Utils from "../../../utils";
import { FANE_STATUS, STEG, type PropsLight, type StegKriterie, type FaneStatus } from "./typer";
import React from "react";

interface StegData {
  [key: string]: unknown;
  tilstand?: unknown;
}

interface BuiltSteg {
  id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  komponent: React.ComponentType<any> | null;
  tittel: string | null;
  handlers: Record<string, unknown> | null;
  data: StegData;
  status: FaneStatus;
  stegPosisjon: number;
  aktivtSteg: boolean | undefined;
  vedtakSteg: boolean;
}

class Steg {
  protected _id: string | null = null;
  protected _tittel: string | null = null;
  protected _kriterier: StegKriterie[] | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _komponent: React.ComponentType<any> | null = null;
  protected _status: FaneStatus | null = null;
  protected _samleRelevanteData: ((propsLight: PropsLight) => Record<string, unknown>) | null = null;
  protected _beregnRelevantUI: ((propsLight: PropsLight) => Record<string, unknown>) | null = null;
  protected _handlers: Record<string, unknown> | null = null;
  protected _propsLight: PropsLight;
  protected _stegPosisjon: number;
  protected _aktiv: boolean | undefined;

  constructor(propsLight: PropsLight, posisjon: number) {
    this._propsLight = propsLight;
    this._stegPosisjon = posisjon;
  }

  get id(): string | null {
    return this._id;
  }
  set id(id: string | null) {
    this._id = id;
  }

  get tittel(): string | null {
    return this._tittel;
  }
  set tittel(tittel: string | null) {
    this._tittel = tittel;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get komponent(): React.ComponentType<any> | null {
    return this._komponent;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set komponent(komponent: React.ComponentType<any> | null) {
    this._komponent = komponent;
  }

  get kriterier(): StegKriterie[] | null {
    return this._kriterier;
  }
  set kriterier(kriterier: StegKriterie[] | null) {
    this._kriterier = kriterier;
  }

  get handlers(): Record<string, unknown> | null {
    return this._handlers;
  }
  set handlers(handlers: Record<string, unknown> | null) {
    this._handlers = handlers;
  }

  get status(): FaneStatus | null {
    return this._status;
  }
  set status(status: FaneStatus | null) {
    this._status = status;
  }

  set aktivtSteg(aktiv: boolean | undefined) {
    this._aktiv = aktiv;
  }

  get samleRelevanteData(): ((propsLight: PropsLight) => Record<string, unknown>) | null {
    return this._samleRelevanteData;
  }
  set samleRelevanteData(samleRelevanteData: ((propsLight: PropsLight) => Record<string, unknown>) | null) {
    this._samleRelevanteData = samleRelevanteData;
  }

  get beregnRelevantUI(): ((propsLight: PropsLight) => Record<string, unknown>) | null {
    return this._beregnRelevantUI;
  }
  set beregnRelevantUI(beregnRelevantUI: ((propsLight: PropsLight) => Record<string, unknown>) | null) {
    this._beregnRelevantUI = beregnRelevantUI;
  }

  byggSteg = (): BuiltSteg => ({
    id: this._id,
    komponent: this._komponent,
    tittel: this._tittel,
    handlers: this._handlers,
    data: {
      ...this._samleRelevanteData!(this._propsLight),
      tilstand: this._beregnRelevantUI!(this._propsLight),
    },
    status: this.hentStatus(),
    stegPosisjon: this._stegPosisjon,
    aktivtSteg: this._aktiv,
    vedtakSteg: this.erVedtakSteg(this._id),
  });

  nesteSteg = (): string | undefined => {
    const { avklartefakta = [], vilkar = [] } = this._propsLight;

    const kriterieMatch = this._kriterier!.find((kriterie) => {
      const { exec } = kriterie;
      return this.assertRegel(exec, avklartefakta, vilkar);
    });

    return kriterieMatch && kriterieMatch.nesteSteg;
  };

  hentStatus = (): FaneStatus => {
    const relevantUI = this.beregnRelevantUI!(this._propsLight);

    if (!relevantUI) return FANE_STATUS.FEIL;

    if (relevantUI.stegErGyldig) return FANE_STATUS.OK;

    return relevantUI.harAvklaring ? FANE_STATUS.OK : FANE_STATUS.UBEHANDLET;
  };

  erVedtakSteg = (id: string | null): boolean =>
    id === STEG.VEDTAK ||
    id === STEG.ENDRET_PERIODE ||
    id === STEG.AVSLAG_12_X_OG_16 ||
    id === STEG.ARTIKKEL_16_VEDTAK ||
    id === STEG.ARTIKKEL_13_1_A_VEDTAK ||
    id === STEG.VIDERESEND ||
    id === STEG.ARTIKKEL_13_1_B_VEDTAK ||
    id === STEG.ARTIKKEL_13_1_B_UTPEK_LAND ||
    id === STEG.ARTIKKEL_13_2_A_VEDTAK ||
    id === STEG.GODKJENN_UTPEKING_NORGE ||
    id === STEG.GODKJENN_UTPEKING_ANNET_LAND ||
    id === STEG.AVSLAA_UTPEKING ||
    id === STEG.ARTIKKEL_13_2_B_UTPEK_LAND ||
    id === STEG.ARTIKKEL_13_3_VEDTAK ||
    id === STEG.ARTIKKEL_13_3_UTPEK_LAND ||
    id === STEG.ARTIKKEL_13_4_VEDTAK ||
    id === STEG.ARTIKKEL_13_4_UTPEK_LAND ||
    id === STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK;

  assertRegel = (
    regel: (avklartefakta?: unknown[], vilkar?: unknown[]) => boolean,
    avklartefakta: unknown[],
    vilkar: unknown[],
  ): boolean => (Utils._isFunction(regel) ? regel(avklartefakta, vilkar) : false);
}

export default Steg;
