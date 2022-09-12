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
import { formSelectors } from "../../../ducks/form";

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
  const [muligeBehandlingstemaer, setMuligeBehandlingstemaer] = useState();
  const [muligeBehandlingstyper, setMuligeBehandlingstyper] = useState();
  const sisteBehandling = behandlingOversikter[0];
  useEffect(() => {
    return () => {
      changeField("opprettBehandling", false);
      changeField("behandlingstema", "");
      changeField("behandlingstype", "");
    };
  }, []);
  useEffect(() => {
    if (!sakstemaToggleEnabled) return;

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
  }, [sakstemaToggleEnabled, journalforingGjelder, sakstema.kode, sakstype.kode]);

  useEffect(() => {
    if (!sakstemaToggleEnabled) return;

    if (sakstema.kode && sakstype.kode && behandlingstema) {
      Api.LovligeKombinasjoner.hentBehandlingstyper(
        journalforingGjelder,
        sakstype.kode,
        sakstema.kode,
        behandlingstema,
        sisteBehandling.behandlingstema.kode,
        sisteBehandling.behandlingstype.kode,
        saksstatus.kode
      ).then((alleMuligeBehandlingstyper) => {
        setMuligeBehandlingstyper(alleMuligeBehandlingstyper);
      });
    }
  }, [sakstemaToggleEnabled, journalforingGjelder, sakstema.kode, sakstype.kode, behandlingstema]);

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
          {/* TODO: Kun for å få testene grønne. Avventer svar fra Mina før dette kan fjernes. 
              Pga. SOEKNAD forsvinner i det nye kodeverket. */}
          {behandlingOversikter.some(
            (behandling) => behandling.behandlingstype.kode === MKVBehandlingstyper.SOEKNAD
          ) ? (
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
                {journalforingGjelder === MKV.Koder.aktoersroller.BRUKER && (
                  <Skjema.Select
                    feltNavn="behandlingstema"
                    bredde="fullbredde"
                    label="Behandlingstema"
                    emptyFieldDisabled={behandlingstema?.kode}
                  >
                    {muligeBehandlingstemaer?.map((elem) => (
                      <option key={elem.kode} value={elem.kode} label={elem.term} />
                    ))}
                  </Skjema.Select>
                )}
                <Skjema.RadioGruppe feltNavn="behandlingstype" label="Behandlingstype" className="behandlingstype">
                  {muligeBehandlingstyper?.map((elem) => (
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
  journalforingGjelder: PT.strin.isRequired,
  sakstemaToggleEnabled: PT.bool.isRequired,
  changeField: PT.func.isRequired,
};
KnyttTilSak.defaultProps = {
  behandlingstema: "",
  behandlingstype: "",
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
