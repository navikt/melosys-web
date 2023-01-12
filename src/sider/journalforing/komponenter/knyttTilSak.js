import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { change } from "redux-form";
import PT from "prop-types";

import MKV, { MKVUtils } from "../../../melosyskodeverk";
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
    opprettBehandling: formValues.opprettBehandling,
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
      changeField(feltNavn.formNavn, "opprettBehandling", undefined);
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, "");
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    };
  }, []);

  const sisteBehandlingErInaktiv = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(
    sisteBehandling.behandlingsstatus.kode
  );
  const sakErHenlagtEllerBortfalt = MKVUtils.erHenlagtEllerHenlagtBortfalt(sak.saksstatus.kode);

  const visKnyttTilEksisterende =
    (sisteBehandlingErInaktiv || sisteBehandlingHarSendtAnmodningUnntakTilUtland) && !sakErHenlagtEllerBortfalt;

  useEffect(() => {
    changeField(feltNavn.formNavn, "opprettBehandling", visKnyttTilEksisterende);
  }, [visKnyttTilEksisterende]);

  useEffect(() => {
    const erAnmodningsperiodeSendt = (anmodningsperiode) => anmodningsperiode.sendtUtland;

    Api.Anmodningsperioder.hent(sisteBehandling.behandlingID).then((response) => {
      setSendtAnmodningUnntakTilUtland(response?.anmodningsperioder?.some(erAnmodningsperiodeSendt));
    });
  }, [sisteBehandling]);

  useEffect(() => {
    if (sakstema.kode && sakstype.kode) {
      Api.LovligeKombinasjoner.hentBehandlingstemaer(
        journalforingGjelder,
        sakstype.kode,
        sakstema.kode,
        sisteBehandling.behandlingstema.kode
      ).then((alleMuligeBehandlingstemaer) => {
        setMuligeBehandlingstemaer(alleMuligeBehandlingstemaer);
      });
    }
  }, [journalforingGjelder, sakstema.kode, sakstype.kode]);

  useEffect(() => {
    if (sakstema.kode && sakstype.kode && behandlingstema) {
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
  }, [journalforingGjelder, sakstema.kode, sakstype.kode, behandlingstema]);

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
  }, [opprettBehandling, behandlingstema, behandlingstype]);

  useEffect(() => {
    changeField(feltNavn.formNavn, feltNavn.kanOppretteAndregangsbehandling, visKnyttTilEksisterende);
  }, [visKnyttTilEksisterende]);

  if (visKnyttTilEksisterende) {
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
              <Skjema.Radio feltNavn="opprettBehandling" value label="Opprett ny behandling" />
              <Skjema.Radio feltNavn="opprettBehandling" value={false} label="Uten å opprette behandling" />
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

  const visUtenVidereBehandling = sakstype.kode === MKV.Koder.sakstyper.EU_EOS && !sakErHenlagtEllerBortfalt;

  const kanIkkeOppretteAndregangGrunn = sakErHenlagtEllerBortfalt
    ? "Du kan ikke opprette en ny behandling på eksisterende sak som er henlagt/bortfalt i Melosys"
    : "Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling";

  return (
    <div className="knyttTilSak__behandlingspanel">
      {erOpprettNySak ? (
        <div className="innrykk">
          <Nav.AlertStripeAdvarsel>{kanIkkeOppretteAndregangGrunn}</Nav.AlertStripeAdvarsel>
        </div>
      ) : (
        <>
          {sakErHenlagtEllerBortfalt && (
            <div className="innrykk">
              <Nav.AlertStripeInfo>
                Du kan ikke opprette en ny behandling på en sak som er henlagt/bortfalt i Melosys, men du kan knytte
                dokumentet til den avsluttede behandlingen
              </Nav.AlertStripeInfo>
            </div>
          )}
          {visUtenVidereBehandling && (
            <Skjema.Checkbox
              className="knyttTilSak"
              feltNavn="ingenVurdering"
              label="Journalfør uten videre behandling"
            />
          )}
        </>
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
