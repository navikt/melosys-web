import React, { useEffect } from "react";
import { connect } from "react-redux";
import { change, formValueSelector } from "redux-form";
import classNames from "classnames";
import PT from "prop-types";

import MKV, { MKVUtils } from "../../../melosyskodeverk";
import * as MPT from "../../../proptypes";
import * as Ikoner from "../../../resources/images";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";

import "./knyttTilSak.css";

const {
  behandlinger: { behandlingstyper: MKVBehandlingstyper, behandlingstema: MKVBehandlingstema },
  sakstyper: MKVSakstyper,
  saksstatuser: MKVSaksstatuser,
} = MKV.Koder;

const kanVelgeEndretPeriode = (sisteBehandling) =>
  [MKVBehandlingstema.UTSENDT_ARBEIDSTAKER, MKVBehandlingstema.UTSENDT_SELVSTENDIG].includes(
    sisteBehandling.behandlingstema.kode
  ) && sisteBehandling.behandlingstype.kode === MKVBehandlingstyper.FØRSTEGANG;

const valgbareBehandlingstyper = (sakstype, behandlingstema, sisteBehandling) =>
  MKV.KTObjects.behandlinger.behandlingstyper.filter(
    ({ kode }) =>
      (kanVelgeEndretPeriode(sisteBehandling) && kode === MKVBehandlingstyper.ENDRET_PERIODE) ||
      MKV.Kodekombinasjoner.gyldigeBehandlingstyper(behandlingstema).includes(kode)
  );

const behandlingstemaSomIkkeKanEndres = [
  MKVBehandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  MKVBehandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  MKVBehandlingstema.BESLUTNING_LOVVALG_NORGE,
  MKVBehandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
  MKVBehandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL,
];

const valgbareBehandlingstema = (sakstype, sakstema, behandlingstema) =>
  MKV.KTObjects.behandlinger.behandlingstema.filter(
    ({ kode }) =>
      behandlingstemaSomIkkeKanEndres.includes(behandlingstema)
        ? behandlingstema === kode
        : MKV.Kodekombinasjoner.gyldigeBehandlingstema(sakstype.kode, sakstema.kode).includes(kode) // TODO: Kan denne erstattes av backend når det implementeres der?
  );

const behandlingstyper = (sakstype, behtema) => {
  switch (sakstype) {
    case MKVSakstyper.EU_EOS:
      return MKV.KTObjects.behandlinger.behandlingstyper.filter(
        ({ kode }) =>
          (behtema.kode === MKVBehandlingstema.UTSENDT_ARBEIDSTAKER && kode === MKVBehandlingstyper.ENDRET_PERIODE) ||
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
  const { sak, opprettBehandling, behandlingstema, sakstemaToggleEnabled, changeField } = props;
  const { behandlingOversikter, sakstype, sakstema } = sak;

  const sisteBehandling = behandlingOversikter[0];

  useEffect(() => {
    return () => {
      changeField("opprettBehandling", false);
      changeField("behandlingstema", "");
      changeField("behandlingstype", "");
    };
  }, []);

  useEffect(() => {
    if (opprettBehandling && !behandlingstema) {
      changeField("behandlingstema", sisteBehandling.behandlingstema.kode);
    }
    if (!opprettBehandling && behandlingstema) {
      changeField("behandlingstema", "");
    }
  }, [opprettBehandling]);

  const sisteBehandlingErInaktiv = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(
    sisteBehandling.behandlingsstatus.kode
  );
  const sakErHenlagtEllerBortfalt = [MKVSaksstatuser.HENLAGT, MKVSaksstatuser.HENLAGT_BORTFALT].includes(
    sak.saksstatus.kode
  );

  const visKnyttTilEksisterende = sisteBehandlingErInaktiv && (!sakstemaToggleEnabled || !sakErHenlagtEllerBortfalt);

  if (visKnyttTilEksisterende) {
    const sakInneholderSoeknad = behandlingOversikter.some(
      (behandling) => behandling.behandlingstype.kode === MKVBehandlingstyper.SOEKNAD
    );

    return (
      <div className="knyttTilSak__panelramme">
        <Mui.Elementskrift
          tekst="Tidligere behandling er avsluttet. Velg hva du vil gjøre med dokumentet"
          ikon={Ikoner.InformationCircle}
          className="elementTittel oversteUndertittel"
          style={{ "border-bottom": "none" }}
        />
        <Skjema.RadioGruppe
          feltNavn="opprettBehandling"
          label={sakstemaToggleEnabled ? "" : "Knytt til sak"}
          className={classNames("panelElement", { "nyBehandling-utenBehandling": sakstemaToggleEnabled })}
        >
          {sakInneholderSoeknad ? (
            <Skjema.Radio feltNavn="opprettBehandling" value label="Opprett ny behandling" />
          ) : (
            <Skjema.Radio feltNavn="opprettBehandling" value={false} label="Uten å opprette behandling" />
          )}
        </Skjema.RadioGruppe>
        {opprettBehandling && (
          <>
            {sakstemaToggleEnabled ? (
              <div className="panelElement">
                <Nav.Typo.Undertittel className="temaTypeOverskrift">
                  Velg tema og type for ny behandling
                </Nav.Typo.Undertittel>
                <Skjema.Select
                  feltNavn="behandlingstema"
                  bredde="fullbredde"
                  label="Behandlingstema"
                  emptyFieldDisabled={behandlingstema}
                >
                  {valgbareBehandlingstema(sakstype, sakstema, behandlingstema)?.map((elem) => (
                    <option key={elem.kode} value={elem.kode} label={elem.term} />
                  ))}
                </Skjema.Select>
                <Skjema.RadioGruppe feltNavn="behandlingstype" label="Behandlingstype" className="behandlingstype">
                  {valgbareBehandlingstyper(sakstype, behandlingstema, sisteBehandling)?.map((elem) => (
                    <Skjema.Radio feltNavn="behandlingstype" key={elem.kode} value={elem.kode} label={elem.term} />
                  ))}
                </Skjema.RadioGruppe>
              </div>
            ) : (
              <Skjema.Select
                feltNavn="behandlingstype"
                bredde="fullbredde"
                label="Velg behandlingstype"
                className="panelElement"
                emptyFieldDisabled={false}
              >
                {behandlingstyper(sakstype, sisteBehandling.behandlingstype)?.map((elem) => (
                  <option key={elem.kode} value={elem.kode} label={elem.term} />
                ))}
              </Skjema.Select>
            )}
          </>
        )}
      </div>
    );
  }

  const visUtenVidereBehandling = sakstemaToggleEnabled ? sakstype.kode === MKVSakstyper.EU_EOS : true;

  return (
    <div className="knyttTilSak__behandlingspanel">
      {visUtenVidereBehandling && (
        <Skjema.Checkbox className="knyttTilSak" feltNavn="ingenVurdering" label="Journalfør uten videre behandling" />
      )}
    </div>
  );
};
KnyttTilSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  opprettBehandling: PT.bool.isRequired,
  behandlingstema: PT.string,
  sakstemaToggleEnabled: PT.bool.isRequired,
  changeField: PT.func.isRequired,
};
KnyttTilSak.defaultProps = {
  behandlingstema: "",
};

const selector = formValueSelector(KV.Form.JOURNALFORING);

const mapStateToProps = (state) => ({
  opprettBehandling: selector(state, "opprettBehandling"),
  behandlingstema: selector(state, "behandlingstema"),
});
const mapDispatchToProps = (dispatch) => ({
  changeField: (felt, verdi) => dispatch(change(KV.Form.JOURNALFORING, felt, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(KnyttTilSak);
