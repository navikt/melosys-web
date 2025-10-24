import { RouteComponentProps } from "react-router-dom";
import { KTObject } from "@navikt/melosys-kodeverk";
import { Feilkode } from "../../@types";
import { Oppsummering } from "../../services/modules/behandlinger/behandling";
import { Avklartfakta } from "../../services/modules/avklartefakta";
import { AnmodningsperiodesvarResDto } from "../../services/modules/anmodningsperioder/svar/svar";
import { AvklartefaktaStore, EnkelDataStore, VilkaarStore } from "./StegState";

// Type alias for untyped data from Redux/API (to be replaced with proper types later)
type UntypedData = Record<string, unknown>;

// Redux state types - UI-specific derived types
interface ArbeidslandMedYrkesaktivitetType {
  arbeidsland: KTObject;
  yrkesaktivitet: boolean;
}

// Steg-related types
export interface StegStoresType {
  [key: string]: EnkelDataStore | AvklartefaktaStore | VilkaarStore;
  anmodningsperiodesvar: EnkelDataStore;
  avklartefakta: AvklartefaktaStore;
  vilkaar: VilkaarStore;
  lovvalgsbestemmelse: EnkelDataStore;
  tilleggbestemmelse: EnkelDataStore;
  unntakfrabestemmelse: EnkelDataStore;
  lovvalgsperiode: EnkelDataStore;
  lovvalgsland: EnkelDataStore;
}

export interface StegvelgerState {
  aktivtStegNummer: number;
  aktuelleSteg: StegType[];
  stegStores: StegStoresType;
  visMottatteOpplysningerFeilmeldinger: boolean;
}

export interface StegType {
  id: string;
  stegPosisjon: number;
  aktivtSteg?: boolean;
  vedtakSteg?: boolean;
}

export interface StegDataType {
  felt?: string;
  type?: string;
  innhold?: unknown;
  iAlleSteg?: boolean;
  oppdaterRedux?: boolean;
}

export interface PerioderStegStateType {
  lovvalgsbestemmelse: unknown;
  tilleggbestemmelse: unknown;
  unntakfrabestemmelse: unknown;
  lovvalgsperiode: unknown;
  lovvalgsland: unknown;
}

export interface UtpekDataType {
  mottakerinstitusjoner: unknown;
  fritekstSed?: string | null;
  fritekstBrev?: string | null;
}

export type AvvisUtpekingDataType = UntypedData;

export type BestillingType = UntypedData;

export interface GodkjennUnntaksperioderDataType {
  varsleUtland?: boolean;
  fritekst?: string | null;
  endretPeriode: unknown;
  lovvalgsbestemmelse: unknown;
}

export interface EndreVedtakDataType {
  begrunnelseKode?: string | null;
  fritekst?: string | null;
  fritekstSed?: string | null;
}

export interface StegvelgerProps extends RouteComponentProps {
  anmodningsperiodesvar: AnmodningsperiodesvarResDto;
  behandlingID: number;
  arbeidsland: KTObject[];
  arbeidslandMedYrkesaktivitet: ArbeidslandMedYrkesaktivitetType[];
  behandlingsPerioder: UntypedData;
  hentVilkar: (behandlingID: number) => Promise<void>;
  hentAvklartefakta: (behandlingID: number) => Promise<void>;
  hentLovvalgsperioder: (behandlingID: number) => Promise<void>;
  endreVedtak: (behandlingID: number, data: EndreVedtakDataType) => Promise<unknown>;
  kontrollerFerdigbehandling: (data: unknown) => Promise<unknown>;
  lagreMottatteOpplysningerHandler: () => Promise<void>;
  lovvalgsperioder: unknown[];
  oppdaterPerioderState: (skjema: unknown) => Promise<void>;
  oppdaterMottatteOpplysninger: () => void;
  saksopplysninger: UntypedData;
  oppdaterVilkaar: (vilkaarListe: unknown) => Promise<void>;
  oppdaterAvklartefakta: (avklartefaktaListe: unknown) => Promise<void>;
  oppdaterLovvalgperioder: (stegState: PerioderStegStateType) => Promise<void>;
  vilkar: unknown[];
  lagreAvklartefaktaHandler: () => Promise<void>;
  lagreAllData: () => Promise<void>;
  hentMedlemsPerioder: (behandlingID: number) => Promise<void>;
  mottatteOpplysningerFeilmeldinger: UntypedData;
  hentAnmodningsperioder: (behandlingID: number) => Promise<void>;
  anmodningsperioder: unknown[];
  anmodningErSendtUtland: boolean;
  oppdaterAnmodningsPerioder: (stegState: PerioderStegStateType) => Promise<void>;
  lagreUtpekingsperioderHandler: () => Promise<void>;
  redigerbart: boolean;
  oppdaterAnmodningsperiodesvar: (anmodningsperiodesvar: unknown) => Promise<void>;
  generiskStegRedigerbart: boolean;
  erIDirekteTilArtikkel16Flyt: boolean;
  tilForsiden: () => void;
  utpek: (saksnummer: string, body: UtpekDataType) => Promise<unknown>;
  avvisUtpeking: (behandlingID: number, data: AvvisUtpekingDataType) => Promise<unknown>;
  hentUtpekingsperioder: (behandlingID: number) => Promise<void>;
  oppdaterUtpekingsperioder: (stegState: PerioderStegStateType) => Promise<void>;
  utpekingsperioder: UntypedData;
  omfattesIAnnetLand: boolean;
  stegMap: Record<string, Array<string | UntypedData>>;
  vurderUtpekingValid: boolean;
  forsteSteg: string;
  erArbeidEttLand: boolean;
  videresend: (saksnummer: string, body: unknown) => Promise<unknown>;
  bestillAnmodningsperioder: (behandlingID: number, bestilling: BestillingType) => Promise<unknown>;
  medfolgendeBarn: unknown[];
  lagredeVirksomheter: unknown[];
  soknadsperiode: UntypedData;
  norgeErUtpekt11_3AToggleEnabled: boolean;
  utsendingsvilkår: UntypedData;
  unntaksvilkår: UntypedData;
  art11_3Aeller13_3A: UntypedData;
  art11_4_1eller13_4_1: UntypedData;
  art11_4_2eller13_4_2: UntypedData;

  // Optional props with defaults
  bestemmelser?: unknown[];
  arbeidsgivereIPerioden?: unknown[];
  avklartefakta?: Avklartfakta[];
  behandlingOppfriskes?: boolean;
  hentFullmektig?: () => Promise<unknown>;
  oppsummering?: Oppsummering;
  valgteVirksomheter?: unknown[];
  valgteVirksomheterIkkeNaeringsDrivende?: unknown[];
  soknad_skjema?: UntypedData;
  artikkel12_vedtak_skjema?: UntypedData;
  artikkel16_anmodning_skjema?: UntypedData;
  artikkel16_motta_svar_skjema?: UntypedData;
  vurder_utpeking_skjema?: UntypedData;
  lagreVilkarHandler?: () => Promise<void>;
  lagreLovvalgsperioderHandler?: () => Promise<void>;
  lagreAnmodningsperioderHandler?: () => Promise<void>;
  saksnummer?: string;
  vurderUtpekingFom?: string;
  vurderUtpekingTom?: string;
  lovvalgsbestemmelse?: string;
  tilleggsbestemmelse?: string;
  valgteLovvalgsVilkarBestemmelse?: string;
  maritimtarbeid?: UntypedData[];
  hjemmebaser?: string[];
  sakstype?: string;
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger?: () => Promise<void>;
  feilmeldinger?: Feilkode[] | string;
  kontrollfeil?: Feilkode[];
}
