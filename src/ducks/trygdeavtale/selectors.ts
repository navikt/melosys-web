import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import { KTObject } from "@navikt/melosys-kodeverk";
import * as Types from "./types";
import { StegNavn } from "../../kodeverk/koder";
import MKV from "../../melosyskodeverk";

export const TrygdeavtaleSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state) => state.trygdeavtale,
  (trygdeavtale) => trygdeavtale
);

export const TrygdeavtaleDataSelector: Selector<RootState, Types.Data> = createSelector(
  TrygdeavtaleSelector,
  (trygdeavtale) => (trygdeavtale.data ? trygdeavtale.data : [])
);

export const InngangStegDataSelector = createSelector(TrygdeavtaleDataSelector, (trygdeavtale) =>
  trygdeavtale.find((steg) => steg.steg === StegNavn.INNGANG)
);

export const AvklarVirksomhetStegDataSelector = createSelector(TrygdeavtaleDataSelector, (trygdeavtale) =>
  trygdeavtale.find((steg) => steg.steg === StegNavn.AVKLAR_VIRKSOMHET)
);

export const BestemmelseStegDataSelector = createSelector(TrygdeavtaleDataSelector, (trygdeavtale) =>
  trygdeavtale.find((steg) => steg.steg === StegNavn.BESTEMMELSE)
);

export const ArbeidslandSelector = createSelector(
  InngangStegDataSelector,
  (inngangsdata) => inngangsdata?.resultat?.land || []
);

export const ArbeidslandKTSelector = createSelector(ArbeidslandSelector, (arbeidsland) =>
  MKV.KTObjects.landkoder.filter((landkodeObjekt: KTObject) => arbeidsland.includes(landkodeObjekt.kode))
);
