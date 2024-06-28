import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { change } from "redux-form";
import PT from "prop-types";

import { MKVUtils } from "../../../melosyskodeverk";
import * as MPT from "../../../proptypes";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as Api from "../../../services/api";
import * as Utils from "../../../utils";

import "./knyttTilSak.css";
import { useAsyncCallbackState } from "../../../hooks";

export const KnyttTilSak = (props) => {
  const { sak, erJournalføring, changeField, feltNavn, formValues } = props;
  const { behandlingstema, behandlingstype, journalforingGjelder, opprettBehandling } = {
    opprettBehandling: formValues[feltNavn.opprettBehandling],
    behandlingstema: formValues[feltNavn.behandlingstema],
    behandlingstype: formValues[feltNavn.behandlingstype],
    journalforingGjelder: formValues[feltNavn.hovedpart],
  };
  const { behandlingOversikter, sakstype, sakstema } = sak;
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState();
  const [muligeBehandlingstyper, setMuligeBehandlingstyper] = useState();
  const [sisteBehandlingHarSendtAnmodningUnntakTilUtland, setSendtAnmodningUnntakTilUtland] = useState(false);
  const sisteBehandling = behandlingOversikter[0];
  const [{ harBehandlingMedTrygdeavgift }] = useAsyncCallbackState(
    () => Api.Fagsaker.fagsak.hentTrygdeavgiftOppsummering(sak.saksnummer),
    { harBehandlingMedTrygdeavgift: false },
    []
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
    sisteBehandling.behandlingsstatus.kode
  );
  const sakKanIkkeViderebehandles = MKVUtils.erOpphørtEllerHenlagtEllerBortfaltEllerAnnullert(sak.saksstatus.kode);

  const sisteBehandlingErPågåendeArtikkel16Sak =
    sisteBehandlingHarSendtAnmodningUnntakTilUtland && !sisteBehandlingErInaktiv;

  const sisteBehandlingKanOpprettesAndregangsbehandlingPå =
    sisteBehandlingErInaktiv || sisteBehandlingErPågåendeArtikkel16Sak;

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
    const erAnmodningsperiodeSendt = (anmodningsperiode) => anmodningsperiode.sendtUtland;

    Api.Anmodningsperioder.hent(sisteBehandling.behandlingID).then((response) => {
      setSendtAnmodningUnntakTilUtland(response?.anmodningsperioder?.some(erAnmodningsperiodeSendt));
    });
  }, [sisteBehandling]);

  useEffect(() => {
    if (sakstype.kode && sakstema.kode) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(
        journalforingGjelder,
        sakstype.kode,
        sakstema.kode,
        null,
        sisteBehandling.behandlingstema.kode
      ).then((alleMuligeBehandlingstemaer) => {
        setMuligeBehandlingstemaer(alleMuligeBehandlingstemaer);
      });
    }
  }, [journalforingGjelder, sakstype.kode, sakstema.kode, sisteBehandling?.behandlingstema?.kode]);

  useEffect(() => {
    if (sakstype.kode && sakstema.kode && behandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyperForKnyttTilSak(
        journalforingGjelder,
        sak.saksnummer,
        behandlingstema
      ).then((alleMuligeBehandlingstyper) => {
        setMuligeBehandlingstyper(alleMuligeBehandlingstyper);
      });
    }
  }, [journalforingGjelder, sakstype.kode, sakstema.kode, behandlingstema, sisteBehandling?.behandlingID]);

  useEffect(() => {
    if (opprettBehandling && Utils._isEmpty(behandlingstema)) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, sisteBehandling.behandlingstema.kode);
    }
    if (!opprettBehandling && !Utils._isEmpty(behandlingstema)) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, "");
    }
    if (!opprettBehandling && !Utils._isEmpty(behandlingstype)) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    }
  }, [opprettBehandling, behandlingstema, behandlingstype, sisteBehandling?.behandlingstema?.kode]);

  const VurderDokumentCheckbox = () => (
    <Skjema.Checkbox feltNavn="vurderDokument" label={`Oppdater behandlingsstatus til "Vurder dokument"`} />
  );

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
        {sisteBehandlingErPågåendeArtikkel16Sak ? (
          <Nav.Alert variant="warning" className="anmodningSvarSendt">
            Hvis du har mottatt svar på anmodning om unntak skal du <b>ikke</b> opprette en ny behandling.
          </Nav.Alert>
        ) : (
          <Nav.Alert variant="info" className="tidligereBehandlingAvsluttet">
            Tidligere behandling er avsluttet.
          </Nav.Alert>
        )}
        {erJournalføring && (
          <div className="panelElement">
            <Nav.Typo.Undertittel className="overskrift">Velg hva du vil gjøre med dokumentet</Nav.Typo.Undertittel>
            <Skjema.RadioGroup legend="" name={feltNavn.opprettBehandling}>
              <Nav.Radio value>Opprett ny behandling</Nav.Radio>
              <Nav.Radio value={false}>Uten å opprette behandling</Nav.Radio>
            </Skjema.RadioGroup>
          </div>
        )}
        {opprettBehandling && (
          <div className="panelElement">
            <Nav.Typo.Undertittel className="overskrift">Velg tema og type for ny behandling</Nav.Typo.Undertittel>
            <Skjema.Select
              feltNavn={feltNavn.behandlingstema}
              bredde="fullbredde"
              label="Behandlingstema"
              emptyFieldDisabled={behandlingstema?.kode}
              disabled={harBehandlingMedTrygdeavgift}
              className={harBehandlingMedTrygdeavgift ? "select__slim" : undefined}
            >
              {muligeBehandlingstemaer?.map((elem) => (
                <option key={elem.kode} value={elem.kode} label={elem.term} />
              ))}
            </Skjema.Select>
            {harBehandlingMedTrygdeavgift && (
              <Nav.Typo.EtikettLiten className="behandlingstema__label">
                Du kan ikke endre behandlingstema når saken har en tilknyttet fakturaserie.
              </Nav.Typo.EtikettLiten>
            )}
            <Skjema.RadioGroup legend="Behandlingstype" name={feltNavn.behandlingstype}>
              {muligeBehandlingstyper?.map((elem) => (
                <Nav.Radio key={elem.kode} value={elem.kode}>
                  {elem.term}
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
    <div className="knyttTilSak__behandlingspanel">
      {erJournalføring ? (
        <VurderDokumentCheckbox />
      ) : (
        <Nav.Alert variant="warning" className="feilmelding_innrykk">
          Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling
        </Nav.Alert>
      )}
    </div>
  );
};
KnyttTilSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  erJournalføring: PT.bool.isRequired,
  changeField: PT.func.isRequired,
  feltNavn: PT.object.isRequired,
  formValues: PT.object.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  changeField: (feltNavn, felt, verdi) => dispatch(change(feltNavn, felt, verdi)),
});

export default connect(null, mapDispatchToProps)(KnyttTilSak);
