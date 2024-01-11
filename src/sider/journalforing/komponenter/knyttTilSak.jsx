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
  const sakErHenlagtEllerBortfalt = MKVUtils.erHenlagtEllerHenlagtBortfalt(sak.saksstatus.kode);

  const sisteBehandlingErPågåendeArtikkel16Sak =
    sisteBehandlingHarSendtAnmodningUnntakTilUtland && !sisteBehandlingErInaktiv;

  const sisteBehandlingKanOpprettesAndregangsbehandlingPå =
    sisteBehandlingErInaktiv || sisteBehandlingErPågåendeArtikkel16Sak;

  useEffect(() => {
    if (sisteBehandlingErPågåendeArtikkel16Sak && erJournalføring) {
      changeField(feltNavn.formNavn, feltNavn.opprettBehandling, undefined);
    } else {
      const kanOppretteAndregangsbehandling =
        sisteBehandlingKanOpprettesAndregangsbehandlingPå && !sakErHenlagtEllerBortfalt;
      changeField(feltNavn.formNavn, feltNavn.opprettBehandling, kanOppretteAndregangsbehandling);
    }

    if (erJournalføring) {
      const skalIkkeVurdereDokument = sisteBehandlingKanOpprettesAndregangsbehandlingPå || sakErHenlagtEllerBortfalt;
      const defaultVurderDokument = !skalIkkeVurdereDokument || sisteBehandlingErPågåendeArtikkel16Sak;
      changeField(feltNavn.formNavn, "vurderDokument", defaultVurderDokument);
    }
  }, [
    sisteBehandlingKanOpprettesAndregangsbehandlingPå,
    sakErHenlagtEllerBortfalt,
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
      Api.LovligeKombinasjoner.hentBehandlingstyper(
        journalforingGjelder,
        sakstype.kode,
        sakstema.kode,
        behandlingstema,
        null,
        sisteBehandling.behandlingID
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

  if (sakErHenlagtEllerBortfalt) {
    return (
      <div className="knyttTilSak__behandlingspanel">
        {erJournalføring ? (
          <Nav.AlertStripeInfo className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på en eksisterende sak som er henlagt/bortfalt i Melosys, men du kan
            knytte dokumentet til den avsluttede behandlingen
          </Nav.AlertStripeInfo>
        ) : (
          <Nav.AlertStripeAdvarsel className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak som er henlagt/bortfalt i Melosys
          </Nav.AlertStripeAdvarsel>
        )}
      </div>
    );
  }

  if (sisteBehandlingKanOpprettesAndregangsbehandlingPå) {
    return (
      <div className="knyttTilSak__panelramme">
        {sisteBehandlingErPågåendeArtikkel16Sak ? (
          <Nav.AlertStripeAdvarsel className="anmodningSvarSendt">
            Hvis du har mottatt svar på anmodning om unntak skal du <b>ikke</b> opprette en ny behandling.
          </Nav.AlertStripeAdvarsel>
        ) : (
          <Nav.AlertStripeInfo className="tidligereBehandlingAvsluttet">
            Tidligere behandling er avsluttet.
          </Nav.AlertStripeInfo>
        )}
        {erJournalføring && (
          <Skjema.RadioGruppe
            feltNavn="opprettBehandling"
            label={<Nav.Typo.Undertittel>Velg hva du vil gjøre med dokumentet</Nav.Typo.Undertittel>}
            className="panelElement nyBehandlingEllerUtenBehandling"
          >
            <Skjema.Radio feltNavn={feltNavn.opprettBehandling} value label="Opprett ny behandling" />
            <Skjema.Radio feltNavn={feltNavn.opprettBehandling} value={false} label="Uten å opprette behandling" />
          </Skjema.RadioGruppe>
        )}
        {opprettBehandling && (
          <div className="panelElement">
            <Nav.Typo.Undertittel className="temaTypeOverskrift">
              Velg tema og type for ny behandling
            </Nav.Typo.Undertittel>
            <Skjema.Select
              feltNavn={feltNavn.behandlingstema}
              bredde="fullbredde"
              label="Behandlingstema"
              emptyFieldDisabled={behandlingstema?.kode}
            >
              {muligeBehandlingstemaer?.map((elem) => (
                <option key={elem.kode} value={elem.kode} label={elem.term} />
              ))}
            </Skjema.Select>
            <Skjema.RadioGruppe feltNavn={feltNavn.behandlingstype} label="Behandlingstype" className="behandlingstype">
              {muligeBehandlingstyper?.map((elem) => (
                <Skjema.Radio feltNavn={feltNavn.behandlingstype} key={elem.kode} value={elem.kode} label={elem.term} />
              ))}
            </Skjema.RadioGruppe>
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
        <Nav.AlertStripeAdvarsel className="feilmelding_innrykk">
          Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling
        </Nav.AlertStripeAdvarsel>
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
