import React, { useEffect, useState } from "react";
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
import * as Api from "../../../services/api";

import "./knyttTilSak.css";
import { useFeatureToggle } from "../../../featuretoggle";
import { formSelectors } from "../../../ducks/form";

const {
  behandlinger: { behandlingstyper: MKVBehandlingstyper, behandlingstema: MKVBehandlingstema },
  sakstyper: MKVSakstyper,
  saksstatuser: MKVSaksstatuser,
} = MKV.Koder;

const kanVelgeEndretPeriode = (sisteBehandling) =>
  [MKVBehandlingstema.UTSENDT_ARBEIDSTAKER, MKVBehandlingstema.UTSENDT_SELVSTENDIG].includes(
    sisteBehandling.behandlingstema.kode
  ) && sisteBehandling.behandlingstype.kode === MKVBehandlingstyper.FØRSTEGANG;

const valgbareBehandlingstyper = (behandlingstema, sisteBehandling) =>
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
        : MKV.Kodekombinasjoner.gyldigeBehandlingstema(sakstype, sakstema).includes(kode) // TODO: Kan denne erstattes av backend når det implementeres der?
  );

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
  const {
    sak,
    opprettBehandling,
    behandlingstema,
    behandlingstype,
    sakstemaToggleEnabled,
    changeField,
    journalforingGjelder,
  } = props;
  const { behandlingOversikter, sakstype, sakstema, saksstatus } = sak;
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");
  const [behandlingstemaer, setBehandlingstemaer] = useState();
  const [behandlingstyper, setBehandlingstyper] = useState();
  const sisteBehandling = behandlingOversikter[0];
  useEffect(() => {
    return () => {
      changeField("opprettBehandling", false);
      changeField("behandlingstema", "");
      changeField("behandlingstype", "");
    };
  }, []);
  useEffect(() => {
    if (behandleAlleSakerToggle === "enabled") {
      if (sakstema.kode && sakstype.kode) {
        Api.LovligeKombinasjoner.hentBehandlingstemaer(
          journalforingGjelder,
          sakstype.kode,
          sakstema.kode,
          sisteBehandling.behandlingstema.kode
        ).then((muligeBehandlingstemaer) => {
          setBehandlingstemaer(muligeBehandlingstemaer);
        });
      }

      if (sakstema.kode && sakstype.kode && behandlingstema) {
        Api.LovligeKombinasjoner.hentBehandlingstyper(
          journalforingGjelder,
          sakstype.kode,
          sakstema.kode,
          behandlingstema,
          sisteBehandling.behandlingstema.kode,
          sisteBehandling.behandlingstype.kode,
          saksstatus.kode
        ).then((muligeBehandlingstyper) => {
          setBehandlingstyper(muligeBehandlingstyper);
        });
      }
    }
  }, [behandleAlleSakerToggle, journalforingGjelder, sakstema.kode, sakstype.kode, behandlingstema]);

  useEffect(() => {
    if (opprettBehandling && !behandlingstema) {
      changeField("behandlingstema", sisteBehandling.behandlingstema.kode);
    }
    if (!opprettBehandling && behandlingstema) {
      changeField("behandlingstema", "");
    }
    if (!opprettBehandling && behandlingstype) {
      changeField("behandlingstype", "");
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
          <Skjema.Radio feltNavn="opprettBehandling" value label="Opprett ny behandling" />
        </Skjema.RadioGruppe>
        {opprettBehandling && (
          <>
            {sakstemaToggleEnabled ? (
              <div className="panelElement">
                <Nav.Typo.Undertittel className="temaTypeOverskrift">
                  Velg tema og type for ny behandling
                </Nav.Typo.Undertittel>
                {journalforingGjelder !== MKV.Koder.aktoersroller.VIRKSOMHET && (
                  <Skjema.Select
                    feltNavn="behandlingstema"
                    bredde="fullbredde"
                    label="Behandlingstema"
                    emptyFieldDisabled={behandlingstema?.kode}
                  >
                    {(behandleAlleSakerToggle === "enabled"
                      ? behandlingstemaer
                      : valgbareBehandlingstema(sakstype?.kode, sakstema?.kode, behandlingstema?.kode)
                    )?.map((elem) => (
                      <option key={elem.kode} value={elem.kode} label={elem.term} />
                    ))}
                  </Skjema.Select>
                )}
                <Skjema.RadioGruppe feltNavn="behandlingstype" label="Behandlingstype" className="behandlingstype">
                  {(behandleAlleSakerToggle === "enabled"
                    ? behandlingstyper
                    : valgbareBehandlingstyper(behandlingstema?.kode, sisteBehandling)
                  )?.map((elem) => (
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
  behandlingstype: PT.string,
  journalforingGjelder: PT.string,
  sakstemaToggleEnabled: PT.bool.isRequired,
  changeField: PT.func.isRequired,
};
KnyttTilSak.defaultProps = {
  behandlingstema: "",
  behandlingstype: "",
  journalforingGjelder: "BRUKER",
};

const selector = formValueSelector(KV.Form.JOURNALFORING);

const mapStateToProps = (state) => ({
  opprettBehandling: selector(state, "opprettBehandling"),
  behandlingstema: selector(state, "behandlingstema"),
  behandlingstype: selector(state, "behandlingstype"),
  journalforingGjelder: formSelectors.JournalforingFormSelector(state).values?.journalforingGjelder,
});
const mapDispatchToProps = (dispatch) => ({
  changeField: (felt, verdi) => dispatch(change(KV.Form.JOURNALFORING, felt, verdi)),
});

export default connect(mapStateToProps, mapDispatchToProps)(KnyttTilSak);
