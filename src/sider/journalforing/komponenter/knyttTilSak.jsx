import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { change } from "redux-form";
import PT from "prop-types";

import { MKVUtils } from "../../../melosyskodeverk";
import * as MPT from "../../../proptypes";
import * as Ikoner from "../../../resources/images";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as Api from "../../../services/api";
import * as Utils from "../../../utils";

import "./knyttTilSak.css";

export const KnyttTilSak = (props) => {
  const { sak, erOpprettNySak, changeField, feltNavn, formValues } = props;
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
      if (!erOpprettNySak) changeField(feltNavn.formNavn, "vurderDokument", undefined);
      changeField(feltNavn.formNavn, feltNavn.opprettBehandling, undefined);
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, "");
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    };
  }, []);

  const sisteBehandlingErInaktiv = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(
    sisteBehandling.behandlingsstatus.kode
  );
  const sakErHenlagtEllerBortfalt = MKVUtils.erHenlagtEllerHenlagtBortfalt(sak.saksstatus.kode);

  const sisteBehandlingKanOpprettesAndregangsbehandlingPå =
    sisteBehandlingErInaktiv || sisteBehandlingHarSendtAnmodningUnntakTilUtland;

  useEffect(() => {
    const kanOppretteAndregangsbehandling =
      sisteBehandlingKanOpprettesAndregangsbehandlingPå && !sakErHenlagtEllerBortfalt;
    changeField(feltNavn.formNavn, feltNavn.opprettBehandling, kanOppretteAndregangsbehandling);
    if (!erOpprettNySak) {
      const skalIkkeVurdereDokument = sisteBehandlingKanOpprettesAndregangsbehandlingPå || sakErHenlagtEllerBortfalt;
      changeField(feltNavn.formNavn, "vurderDokument", !skalIkkeVurdereDokument);
    }
  }, [sisteBehandlingKanOpprettesAndregangsbehandlingPå, sakErHenlagtEllerBortfalt]);

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

  if (sakErHenlagtEllerBortfalt) {
    return (
      <div className="knyttTilSak__behandlingspanel">
        {erOpprettNySak ? (
          <Nav.AlertStripeAdvarsel className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på eksisterende sak som er henlagt/bortfalt i Melosys
          </Nav.AlertStripeAdvarsel>
        ) : (
          <Nav.AlertStripeInfo className="feilmelding_innrykk">
            Du kan ikke opprette en ny behandling på en eksisterende sak som er henlagt/bortfalt i Melosys, men du kan
            knytte dokumentet til den avsluttede behandlingen
          </Nav.AlertStripeInfo>
        )}
      </div>
    );
  }

  if (sisteBehandlingKanOpprettesAndregangsbehandlingPå) {
    return (
      <div className="knyttTilSak__panelramme">
        {!erOpprettNySak && (
          <>
            <Mui.Elementskrift
              tekst="Tidligere behandling er avsluttet. Velg hva du vil gjøre med dokumentet"
              ikon={Ikoner.InformationCircle}
              className="elementTittel oversteUndertittel"
              style={{ "border-bottom": "none" }}
            />
            <Skjema.RadioGruppe
              feltNavn="opprettBehandling"
              label=""
              className="panelElement nyBehandling-utenBehandling"
            >
              <Skjema.Radio feltNavn={feltNavn.opprettBehandling} value label="Opprett ny behandling" />
              <Skjema.Radio feltNavn={feltNavn.opprettBehandling} value={false} label="Uten å opprette behandling" />
            </Skjema.RadioGruppe>
          </>
        )}
        {opprettBehandling && (
          <div className="panelElement">
            <Nav.Typo.Undertittel className="temaTypeOverskrift">
              {erOpprettNySak
                ? "Tidligere behandling er avsluttet. Velg behandlingstema og -type for den nye behandlingen"
                : "Velg tema og type for ny behandling"}
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
      </div>
    );
  }

  return (
    <div className="knyttTilSak__behandlingspanel">
      {erOpprettNySak ? (
        <Nav.AlertStripeAdvarsel className="feilmelding_innrykk">
          Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling
        </Nav.AlertStripeAdvarsel>
      ) : (
        <Skjema.Checkbox feltNavn="vurderDokument" label={`Oppdater behandlingsstatus til "Vurder dokument"`} />
      )}
    </div>
  );
};
KnyttTilSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  erOpprettNySak: PT.bool,
  changeField: PT.func.isRequired,
  feltNavn: PT.object.isRequired,
  formValues: PT.object.isRequired,
};
KnyttTilSak.defaultProps = {
  erOpprettNySak: false,
};

const mapDispatchToProps = (dispatch) => ({
  changeField: (feltNavn, felt, verdi) => dispatch(change(feltNavn, felt, verdi)),
});

export default connect(null, mapDispatchToProps)(KnyttTilSak);
