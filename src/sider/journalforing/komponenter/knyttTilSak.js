import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { change } from "redux-form";
import classNames from "classnames";
import PT from "prop-types";

import MKV, { MKVUtils } from "../../../melosyskodeverk";
import * as MPT from "../../../proptypes";
import * as Ikoner from "../../../resources/images";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";

import "./knyttTilSak.css";

const {
  behandlinger: { behandlingstyper: MKVBehandlingstyper, behandlingstema: MKVBehandlingstema },
  sakstyper: MKVSakstyper,
  saksstatuser: MKVSaksstatuser,
} = MKV.Koder;

const behandlingstyper_gammel = (sakstype, behtema) => {
  switch (sakstype) {
    case MKVSakstyper.EU_EOS:
      return MKV.KTObjects.behandlinger.behandlingstyper.filter(
        ({ kode }) =>
          (behtema === MKVBehandlingstema.UTSENDT_ARBEIDSTAKER && kode === MKVBehandlingstyper.ENDRET_PERIODE) ||
          kode === MKVBehandlingstyper.NY_VURDERING
      );
    case MKVSakstyper.TRYGDEAVTALE:
      return MKV.KTObjects.behandlinger.behandlingstyper.filter(
        ({ kode }) => kode === MKVBehandlingstyper.NY_VURDERING
      );
    default:
      return [];
  }
};

export const KnyttTilSak = (props) => {
  const { sak, behandleAlleSakerToggleEnabled, erOpprettNySak, changeField, feltNavn, formValues } = props;

  const { behandlingstema, behandlingstype, journalforingGjelder, opprettBehandling } = {
    opprettBehandling: formValues.opprettBehandling,
    behandlingstema: formValues[feltNavn.behandlingstema],
    behandlingstype: formValues[feltNavn.behandlingstype],
    journalforingGjelder: formValues[feltNavn.hovedpart],
  };
  console.log({ formValues });
  const { behandlingOversikter, sakstype, sakstema } = sak;
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState();
  const [muligeBehandlingstyper, setMuligeBehandlingstyper] = useState();
  const sisteBehandling = behandlingOversikter[0];

  useEffect(() => {
    return () => {
      changeField(feltNavn.formNavn, "opprettBehandling", feltNavn.formNavn === KV.Form.OPPRETT_NY_SAK);
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, "");
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    };
  }, []);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;

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
  }, [behandleAlleSakerToggleEnabled, journalforingGjelder, sakstema.kode, sakstype.kode]);

  useEffect(() => {
    if (!behandleAlleSakerToggleEnabled) return;
    if (sakstema.kode && sakstype.kode && behandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyper(
        journalforingGjelder,
        sakstype.kode,
        sakstema.kode,
        behandlingstema,
        sisteBehandling.behandlingID
      ).then((alleMuligeBehandlingstyper) => {
        setMuligeBehandlingstyper(alleMuligeBehandlingstyper);
      });
    }
  }, [behandleAlleSakerToggleEnabled, journalforingGjelder, sakstema.kode, sakstype.kode, behandlingstema]);

  useEffect(() => {
    if (opprettBehandling && !behandlingstema) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, sisteBehandling.behandlingstema.kode);
    }
    if (!opprettBehandling && behandlingstema) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstema, "");
    }
    if (!opprettBehandling && behandlingstype) {
      changeField(feltNavn.formNavn, feltNavn.behandlingstype, "");
    }
  }, [opprettBehandling, behandlingstema, behandlingstype]);

  const sisteBehandlingErInaktiv = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(
    sisteBehandling.behandlingsstatus.kode
  );
  const sakErHenlagtEllerBortfalt = [MKVSaksstatuser.HENLAGT, MKVSaksstatuser.HENLAGT_BORTFALT].includes(
    sak.saksstatus.kode
  );

  const visKnyttTilEksisterende =
    sisteBehandlingErInaktiv && (!behandleAlleSakerToggleEnabled || !sakErHenlagtEllerBortfalt);

  const visOpprettNyBehandling = behandleAlleSakerToggleEnabled
    ? sisteBehandlingErInaktiv
    : behandlingOversikter.some((behandling) => behandling.behandlingstype.kode === MKVBehandlingstyper.SOEKNAD);

  const visUtenOpprettNyBehandling = behandleAlleSakerToggleEnabled ? true : !visOpprettNyBehandling;

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
              label={behandleAlleSakerToggleEnabled ? "" : "Knytt til sak"}
              className={classNames("panelElement", { "nyBehandling-utenBehandling": behandleAlleSakerToggleEnabled })}
            >
              {visOpprettNyBehandling && (
                <Skjema.Radio feltNavn="opprettBehandling" value label="Opprett ny behandling" />
              )}
              {visUtenOpprettNyBehandling && (
                <Skjema.Radio feltNavn="opprettBehandling" value={false} label="Uten å opprette behandling" />
              )}
            </Skjema.RadioGruppe>
          </>
        )}
        {opprettBehandling && (
          <>
            {behandleAlleSakerToggleEnabled ? (
              <div className="panelElement">
                <Nav.Typo.Undertittel className="temaTypeOverskrift">
                  {erOpprettNySak
                    ? "Tidligere behandling er avsluttet. Velg behandlingstema og -type for den nye behandlingen"
                    : "Velg tema og type for ny behandling"}
                </Nav.Typo.Undertittel>
                {journalforingGjelder === MKV.Koder.aktoersroller.BRUKER && (
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
                )}
                <Skjema.RadioGruppe
                  feltNavn={feltNavn.behandlingstype}
                  label="Behandlingstype"
                  className="behandlingstype"
                >
                  {muligeBehandlingstyper?.map((elem) => (
                    <Skjema.Radio
                      feltNavn={feltNavn.behandlingstype}
                      key={elem.kode}
                      value={elem.kode}
                      label={elem.term}
                    />
                  ))}
                </Skjema.RadioGruppe>
              </div>
            ) : (
              <Skjema.Select
                feltNavn={feltNavn.behandlingstype}
                bredde="fullbredde"
                label="Velg behandlingstype"
                className="panelElement"
                emptyFieldDisabled={false}
              >
                {behandlingstyper_gammel(sakstype?.kode, sisteBehandling.behandlingstema?.kode)?.map((elem) => (
                  <option key={elem.kode} value={elem.kode} label={elem.term} />
                ))}
              </Skjema.Select>
            )}
          </>
        )}
      </div>
    );
  }

  const visUtenVidereBehandling = behandleAlleSakerToggleEnabled ? sakstype.kode === MKVSakstyper.EU_EOS : true;

  return (
    <div className="knyttTilSak__behandlingspanel">
      {erOpprettNySak ? (
        <div className="innrykk">
          <Nav.AlertStripeInfo>
            Du kan ikke opprette en ny behandling hvis forrige behandling ikke er avsluttet
          </Nav.AlertStripeInfo>
        </div>
      ) : (
        visUtenVidereBehandling && (
          <Skjema.Checkbox
            className="knyttTilSak"
            feltNavn="ingenVurdering"
            label="Journalfør uten videre behandling"
          />
        )
      )}
    </div>
  );
};
KnyttTilSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  behandleAlleSakerToggleEnabled: PT.bool.isRequired,
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
