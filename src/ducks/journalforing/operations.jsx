/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import { change } from "redux-form";
import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";
import { MKVUtils } from "../../melosyskodeverk";
import MKV from "../../melosyskodeverk/index.js";

export function hent(journalpostID) {
  return doThenDispatch(() => Api.Journalforing.hent(journalpostID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function resetJournalforing() {
  return (dispatch) => dispatch(Actions.resetJournalforing());
}

/**
 * Forbereder skjema-data for "Knytt til sak" ved å hente alle nødvendige data
 * og sette form-verdier basert på business logic.
 *
 * Dette flytter business logic ut av komponenten og inn i Redux action creator,
 * noe som gir:
 * - Enveis dataflyt (Redux → Component)
 * - Testbar business logic utenfor React
 * - Ingen circular dependencies i useEffects
 * - Lettere å resonnere om
 *
 * @param {object} sak - Saken som skal knyttes til
 * @param {boolean} erJournalføring - Om dette er i journalføringskontekst
 * @param {string} journalforingGjelder - Hvem journalføringen gjelder (bruker/virksomhet)
 * @param {object} feltNavn - Form-feltnavn
 * @returns {Promise<object>} Metadata som komponenten trenger for rendering
 */
export function prepareKnyttTilSakForm(sak, erJournalføring, journalforingGjelder, feltNavn) {
  return async (dispatch) => {
    const { behandlingOversikter, sakstype, sakstema, saksstatus } = sak;
    const sisteBehandling = behandlingOversikter[0];

    if (!sisteBehandling) {
      // Ingen behandlinger funnet på sak - returner tomme verdier
      return {
        muligeBehandlingstemaer: [],
        muligeBehandlingstyper: [],
        harBehandlingMedTrygdeavgift: false,
      };
    }

    // Kalkuler synkrone verdier
    const sisteBehandlingErInaktiv = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(
      sisteBehandling.behandlingsstatus.kode,
    );
    const sakKanIkkeViderebehandles = MKVUtils.erOpphørtEllerHenlagtEllerBortfaltEllerAnnullert(saksstatus.kode);

    // Hent alle async data parallelt
    const [anmodningsperioderResponse, trygdeavgiftResponse, muligeBehandlingstemaer] = await Promise.all([
      Api.Anmodningsperioder.hent(sisteBehandling.behandlingID).catch(() => ({ anmodningsperioder: [] })),
      Api.Fagsaker.fagsak
        .hentTrygdeavgiftOppsummering(sak.saksnummer)
        .catch(() => ({ harBehandlingMedTrygdeavgift: false })),
      Api.LovligeKombinasjoner.hentBehandlingstemaer(
        journalforingGjelder,
        sakstype.kode,
        sakstema.kode,
        null,
        sisteBehandling.behandlingstema.kode,
      ).catch(() => []),
    ]);

    // Kalkuler avledede verdier
    const sisteBehandlingHarSendtAnmodningUnntakTilUtland =
      anmodningsperioderResponse?.anmodningsperioder?.some((a) => a.sendtUtland) || false;

    const sisteBehandlingErPågåendeArtikkel16Sak =
      sisteBehandlingHarSendtAnmodningUnntakTilUtland && !sisteBehandlingErInaktiv;

    // Sett behandlingstema tidlig (brukes av videre logikk)
    const behandlingstema = sisteBehandling.behandlingstema.kode;
    dispatch(change(feltNavn.formNavn, feltNavn.behandlingstema, behandlingstema));

    // Hent behandlingstyper basert på behandlingstema
    const alleMuligeBehandlingstyper = await Api.LovligeKombinasjoner.hentBehandlingstyperForKnyttTilSak(
      journalforingGjelder,
      sak.saksnummer,
      behandlingstema,
    ).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Feil ved henting av behandlingstyper:", error);
      return [];
    });

    // Filtrer behandlingstyper basert på sakstype og åpne behandlinger
    const erEøsEllerAvtaleland =
      sakstype.kode === MKV.Koder.sakstyper.EU_EOS || sakstype.kode === MKV.Koder.sakstyper.TRYGDEAVTALE;

    const harÅpneBehandlinger = behandlingOversikter.some(
      (behandling) => !MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandling.behandlingsstatus.kode),
    );

    const harÅpneIkkeÅrsavregningsbehandlinger = behandlingOversikter.some(
      (behandling) =>
        !MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandling.behandlingsstatus.kode) &&
        behandling.behandlingstype.kode !== MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING,
    );

    let muligeBehandlingstyper;
    if (erEøsEllerAvtaleland && harÅpneBehandlinger) {
      // For EØS/AVTALELAND med åpne behandlinger: ingen behandlingstyper
      muligeBehandlingstyper = [];
    } else if (harÅpneIkkeÅrsavregningsbehandlinger && sakstype.kode !== MKV.Koder.sakstyper.FTRL) {
      // For vanlige saker med åpne ikke-årsavregninger: kun årsavregning
      muligeBehandlingstyper = alleMuligeBehandlingstyper.filter(
        (type) => type.kode === MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING,
      );
    } else {
      muligeBehandlingstyper = alleMuligeBehandlingstyper;
    }

    const sisteBehandlingKanOpprettesAndregangsbehandlingPå =
      sisteBehandlingErInaktiv || sisteBehandlingErPågåendeArtikkel16Sak || muligeBehandlingstyper.length > 0;

    // Sett opprettBehandling basert på kalkulert logikk
    if (sisteBehandlingErPågåendeArtikkel16Sak && erJournalføring) {
      dispatch(change(feltNavn.formNavn, feltNavn.opprettBehandling, undefined));
    } else {
      const kanOppretteAndregangsbehandling =
        sisteBehandlingKanOpprettesAndregangsbehandlingPå && !sakKanIkkeViderebehandles;
      dispatch(change(feltNavn.formNavn, feltNavn.opprettBehandling, kanOppretteAndregangsbehandling));
    }

    // Sett vurderDokument for journalføring
    if (erJournalføring) {
      const skalIkkeVurdereDokument = sisteBehandlingKanOpprettesAndregangsbehandlingPå || sakKanIkkeViderebehandles;
      const defaultVurderDokument = !skalIkkeVurdereDokument || sisteBehandlingErPågåendeArtikkel16Sak;
      dispatch(change(feltNavn.formNavn, "vurderDokument", defaultVurderDokument));
    }

    return {
      muligeBehandlingstemaer,
      muligeBehandlingstyper,
      harBehandlingMedTrygdeavgift: trygdeavgiftResponse.harBehandlingMedTrygdeavgift,
      sisteBehandlingErInaktiv,
      sakKanIkkeViderebehandles,
      sisteBehandlingErPågåendeArtikkel16Sak,
      sisteBehandlingKanOpprettesAndregangsbehandlingPå,
    };
  };
}
