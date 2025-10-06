import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { change, FormAction } from "redux-form";
import { Dispatch } from "redux";

import { MKVUtils } from "../../../melosyskodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as Api from "../../../services/api";
import * as Utils from "../../../utils";

import "./knyttTilSak.less";
import { useAsyncCallbackState } from "../../../hooks";
import { harFlerePågåendeBehandlinger } from "../../../melosyskodeverk/utils";
import MKV from "../../../melosyskodeverk/index.js";

export interface KnyttTilSakProps {
  sak: {
    saksnummer: string;
    sakstype: { kode: string };
    sakstema: { kode: string };
    saksstatus: { kode: string };
    behandlingOversikter: Array<{
      behandlingID: number;
      behandlingsstatus: { kode: string };
      behandlingstema: { kode: string };
      behandlingstype: { kode: string };
    }>;
  };
  erJournalføring: boolean;
  changeField: (formName: string, fieldName: string, value: unknown) => void;
  feltNavn: {
    formNavn: string;
    opprettBehandling: string;
    behandlingstema: string;
    behandlingstype: string;
    hovedpart: string;
  };
  formValues: {
    [key: string]: unknown;
  };
}

export function KnyttTilSak(props: KnyttTilSakProps) {
  const { sak, erJournalføring, changeField, feltNavn, formValues } = props;
  const { behandlingstema, behandlingstype, journalforingGjelder, opprettBehandling } = {
    opprettBehandling: formValues[feltNavn.opprettBehandling],
    behandlingstema: formValues[feltNavn.behandlingstema],
    behandlingstype: formValues[feltNavn.behandlingstype],
    journalforingGjelder: formValues[feltNavn.hovedpart],
  };
  const { behandlingOversikter, sakstype, sakstema } = sak;
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState<
    Array<{ kode: string; term: string }> | undefined
  >();
  const [muligeBehandlingstyper, setMuligeBehandlingstyper] = useState<
    Array<{ kode: string; term: string }> | undefined
  >();
  const [sisteBehandlingHarSendtAnmodningUnntakTilUtland, setSendtAnmodningUnntakTilUtland] = useState(false);
  const sisteBehandling = behandlingOversikter[0];
  const [{ harBehandlingMedTrygdeavgift }] = useAsyncCallbackState(
    () => Api.Fagsaker.fagsak.hentTrygdeavgiftOppsummering(sak.saksnummer),
    { harBehandlingMedTrygdeavgift: false },
    [],
  );

  useEffect(() => {
    return () => {
      if (erJournalføring) changeField(feltNavn.formNavn, "vurderDokument", undefined);
      changeField(feltNavn.formNavn, feltNavn.opprettBehandling, undefined);
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, "");
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    };
  }, []);

  const sisteBehandlingErInaktiv = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(
    sisteBehandling.behandlingsstatus.kode,
  );
  const sakKanIkkeViderebehandles = MKVUtils.erOpphørtEllerHenlagtEllerBortfaltEllerAnnullert(sak.saksstatus.kode);

  const sisteBehandlingErPågåendeArtikkel16Sak =
    sisteBehandlingHarSendtAnmodningUnntakTilUtland && !sisteBehandlingErInaktiv;

  // Sjekker om det finnes åpne behandlinger av andre typer enn årsavregning
  const harÅpneIkkeÅrsavregningsbehandlinger = behandlingOversikter.some(
    (behandling) =>
      !MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandling.behandlingsstatus.kode) &&
      behandling.behandlingstype.kode !== MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING,
  );

  const harÅpneBehandlinger = behandlingOversikter.some(
    (behandling) => !MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandling.behandlingsstatus.kode),
  );

  const erEøsEllerAvtaleland =
    sakstype.kode === MKV.Koder.sakstyper.EU_EOS || sakstype.kode === MKV.Koder.sakstyper.TRYGDEAVTALE;

  const sisteBehandlingKanOpprettesAndregangsbehandlingPå =
    sisteBehandlingErInaktiv || sisteBehandlingErPågåendeArtikkel16Sak || (muligeBehandlingstyper?.length ?? 0) > 0;

  useEffect(() => {
    if (sisteBehandlingErPågåendeArtikkel16Sak && erJournalføring) {
      changeField(feltNavn.formNavn, feltNavn.opprettBehandling, undefined);
    } else {
      const kanOppretteAndregangsbehandling =
        sisteBehandlingKanOpprettesAndregangsbehandlingPå && !sakKanIkkeViderebehandles;
      changeField(feltNavn.formNavn, feltNavn.opprettBehandling, kanOppretteAndregangsbehandling);
    }

    if (erJournalføring) {
      const skalIkkeVurdereDokument = sisteBehandlingKanOpprettesAndregangsbehandlingPå || sakKanIkkeViderebehandles;
      const defaultVurderDokument = !skalIkkeVurdereDokument || sisteBehandlingErPågåendeArtikkel16Sak;
      changeField(feltNavn.formNavn, "vurderDokument", defaultVurderDokument);
    }
  }, [
    sisteBehandlingKanOpprettesAndregangsbehandlingPå,
    sakKanIkkeViderebehandles,
    sisteBehandlingErPågåendeArtikkel16Sak,
  ]);

  useEffect(() => {
    const erAnmodningsperiodeSendt = (anmodningsperiode: { sendtUtland: boolean }) => anmodningsperiode.sendtUtland;

    Api.Anmodningsperioder.hent(sisteBehandling.behandlingID).then(
      (response: { anmodningsperioder?: Array<{ sendtUtland: boolean }> }) => {
        setSendtAnmodningUnntakTilUtland(response?.anmodningsperioder?.some(erAnmodningsperiodeSendt) ?? false);
      },
    );
  }, [sisteBehandling]);

  useEffect(() => {
    if (sakstype.kode && sakstema.kode) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(
        journalforingGjelder,
        sakstype.kode,
        sakstema.kode,
        null,
        sisteBehandling.behandlingstema.kode,
      ).then((alleMuligeBehandlingstemaer: Array<{ kode: string; term: string }>) => {
        setMuligeBehandlingstemaer(alleMuligeBehandlingstemaer);
      });
    }
  }, [journalforingGjelder, sakstype.kode, sakstema.kode, sisteBehandling?.behandlingstema?.kode]);

  useEffect(() => {
    if (sakstype.kode && sakstema.kode && behandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyperForKnyttTilSak(journalforingGjelder, sak.saksnummer, behandlingstema)
        .then((alleMuligeBehandlingstyper: Array<{ kode: string; term: string }>) => {
          if (erEøsEllerAvtaleland && harÅpneBehandlinger) {
            setMuligeBehandlingstyper([]);
          } else if (harÅpneIkkeÅrsavregningsbehandlinger && sakstype.kode !== MKV.Koder.sakstyper.FTRL) {
            const årsavregninger = alleMuligeBehandlingstyper.filter(
              (type) => type.kode === MKV.Koder.behandlinger.behandlingstyper.ÅRSAVREGNING,
            );
            setMuligeBehandlingstyper(årsavregninger);
          } else {
            setMuligeBehandlingstyper(alleMuligeBehandlingstyper);
          }
        })
        .catch((error: Error) => {
          /* eslint-disable-next-line no-console */
          console.error("Kunne ikke hente behandlingstyper:", error);
          setMuligeBehandlingstyper([]);
        });
    } else {
      setMuligeBehandlingstyper([]);
    }
  }, [
    journalforingGjelder,
    sakstype.kode,
    sakstema.kode,
    behandlingstema,
    sisteBehandling?.behandlingID,
    harÅpneIkkeÅrsavregningsbehandlinger,
    harÅpneBehandlinger,
    behandlingOversikter,
  ]);

  // Håndterer setting av behandlingstema basert på opprettBehandling tilstand
  useEffect(() => {
    if (opprettBehandling && Utils._isEmpty(behandlingstema)) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, sisteBehandling.behandlingstema.kode);
    }
    // Setter behandlingstema når opprettBehandling er undefined (visse journalføringsscenarier)
    else if (
      opprettBehandling === undefined &&
      Utils._isEmpty(behandlingstema) &&
      sisteBehandlingKanOpprettesAndregangsbehandlingPå &&
      !sakKanIkkeViderebehandles
    ) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, sisteBehandling.behandlingstema.kode);
    }
    // Setter behandlingstema i journalføring selv når opprettBehandling er false
    else if (
      erJournalføring &&
      Utils._isEmpty(behandlingstema) &&
      sisteBehandling?.behandlingstema?.kode &&
      !sakKanIkkeViderebehandles
    ) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, sisteBehandling.behandlingstema.kode);
    }
    // Nullstiller behandlingstema kun når det ikke trengs for journalføring
    else if (
      !opprettBehandling &&
      !Utils._isEmpty(behandlingstema) &&
      opprettBehandling !== undefined &&
      !(erJournalføring && !sakKanIkkeViderebehandles)
    ) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, "");
    }
    if (!opprettBehandling && !Utils._isEmpty(behandlingstype)) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    }
  }, [
    opprettBehandling,
    behandlingstema,
    behandlingstype,
    sisteBehandling?.behandlingstema?.kode,
    sisteBehandlingKanOpprettesAndregangsbehandlingPå,
    sakKanIkkeViderebehandles,
    erJournalføring,
  ]);

  const skalViseFeilmelding = () => {
    // Ikke vis feilmelding hvis vi er i journalføring-kontekst eller for FTRL-saker
    if (erJournalføring || sakstype.kode === MKV.Koder.sakstyper.FTRL) {
      return false;
    }

    // For EØS/AVTALELAND-saker: vis feilmelding hvis det finnes noen åpne behandlinger
    if (erEøsEllerAvtaleland) {
      return harÅpneBehandlinger;
    }

    // For vanlige saker: vis kun feilmelding hvis det ikke er åpne ikke-årsavregningsbehandlinger
    // og det finnes flere pågående behandlinger
    return (
      !harÅpneIkkeÅrsavregningsbehandlinger &&
      harFlerePågåendeBehandlinger(behandlingOversikter.map((b) => b.behandlingsstatus.kode))
    );
  };

  function VurderDokumentCheckbox() {
    return <Skjema.Checkbox feltNavn="vurderDokument" label={`Oppdater behandlingsstatus til "Vurder dokument"`} />;
  }

  if (sakKanIkkeViderebehandles) {
    return (
      <div className="knyttTilSak__behandlingspanel">
        {erJournalføring ? (
          <Nav.Alert variant="info" className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak som er opphørt/henlagt/bortfalt/annullert i
            Melosys, men du kan knytte dokumentet til den avsluttede behandlingen
          </Nav.Alert>
        ) : (
          <Nav.Alert variant="warning" className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak som er opphørt/henlagt/bortfalt/annullert i
            Melosys
          </Nav.Alert>
        )}
      </div>
    );
  }

  if (sisteBehandlingKanOpprettesAndregangsbehandlingPå) {
    return (
      <div className="knyttTilSak__panelramme">
        {sisteBehandlingErPågåendeArtikkel16Sak && (
          <Nav.Alert variant="warning" className="anmodningSvarSendt">
            Hvis du har mottatt svar på anmodning om unntak skal du <b>ikke</b> opprette en ny behandling.
          </Nav.Alert>
        )}
        {sisteBehandlingErInaktiv && (
          <Nav.Alert variant="info" className="tidligereBehandlingAvsluttet">
            Tidligere behandling er avsluttet.
          </Nav.Alert>
        )}

        {erJournalføring && (
          <div className="panelElement">
            <Nav.Heading size="xsmall" className="overskrift">
              Velg hva du vil gjøre med dokumentet
            </Nav.Heading>
            <Skjema.RadioGroup legend="" name={feltNavn.opprettBehandling}>
              <Nav.Radio value>Opprett ny behandling</Nav.Radio>
              <Nav.Radio value={false}>Uten å opprette behandling</Nav.Radio>
            </Skjema.RadioGroup>
          </div>
        )}
        {(opprettBehandling as boolean) && (
          <div className="panelElement">
            <Nav.Heading size="xsmall" className="overskrift">
              Velg tema og type for ny behandling
            </Nav.Heading>
            <Skjema.Select
              feltNavn={feltNavn.behandlingstema}
              label="Behandlingstema"
              emptyFieldDisabled={!!(behandlingstema as { kode?: string })?.kode}
              disabled={harBehandlingMedTrygdeavgift}
              className={harBehandlingMedTrygdeavgift ? "select__slim" : undefined}
            >
              {muligeBehandlingstemaer?.map((elem) => (
                <option key={elem.kode} value={elem.kode} label={elem.term} />
              ))}
            </Skjema.Select>
            {harBehandlingMedTrygdeavgift && (
              <Nav.Detail className="behandlingstema__label">
                Du kan ikke endre behandlingstema når saken har en tilknyttet fakturaserie.
              </Nav.Detail>
            )}
            <Skjema.RadioGroup legend="Behandlingstype" name={feltNavn.behandlingstype}>
              {muligeBehandlingstyper?.map((elem) => (
                <Nav.Radio key={elem.kode} value={elem.kode}>
                  {elem.term as string}
                </Nav.Radio>
              ))}
            </Skjema.RadioGroup>
          </div>
        )}
        {opprettBehandling === false && sisteBehandlingErPågåendeArtikkel16Sak && (
          <div className="panelElement vurderDokument">
            <VurderDokumentCheckbox />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {erJournalføring && !harFlerePågåendeBehandlinger(behandlingOversikter.map((b) => b.behandlingsstatus.kode)) && (
        <div className="knyttTilSak__behandlingspanel">
          <VurderDokumentCheckbox />
        </div>
      )}

      {skalViseFeilmelding() && (
        <div className="knyttTilSak__behandlingspanel">
          <Nav.Alert variant="warning" className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling
          </Nav.Alert>
        </div>
      )}
    </>
  );
}

const mapDispatchToProps = (dispatch: Dispatch<FormAction>) => ({
  changeField: (feltNavn: string, felt: string, verdi: unknown) => dispatch(change(feltNavn, felt, verdi)),
});

export default connect(null, mapDispatchToProps)(KnyttTilSak);
