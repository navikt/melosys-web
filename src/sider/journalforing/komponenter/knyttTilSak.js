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

export const KnyttTilSak = (props) => {
  const { sak, behandlingstyper, opprettBehandling, behandlingstema, sakstemaToggleEnabled, changeField } = props;
  const { behandlingOversikter, sakstype, sakstema } = sak;

  const sisteBehandling = behandlingOversikter[0];

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

  if (sisteBehandlingErInaktiv) {
    const sakInneholderSoeknad = behandlingOversikter.some(
      (behandling) => behandling.behandlingstype.kode === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD
    );
    const visUtenOppretteBehandling = !sakInneholderSoeknad;

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
          {sakInneholderSoeknad && <Skjema.Radio feltNavn="opprettBehandling" value label="Opprett ny behandling" />}
          {visUtenOppretteBehandling && (
            <Skjema.Radio feltNavn="opprettBehandling" value={false} label="Uten å opprette behandling" />
          )}
        </Skjema.RadioGruppe>
        {opprettBehandling && (
          <>
            {sakstemaToggleEnabled ? (
              <div className="panelElement">
                <Nav.Typo.Undertittel className="temaTypeOverskrift">
                  Velg type og tema for ny behandling
                </Nav.Typo.Undertittel>
                <Skjema.RadioGruppe feltNavn="behandlingstype" label="Behandlingstype" className="behandlingstype">
                  {behandlingstyper?.map((elem) => (
                    <Skjema.Radio feltNavn="behandlingstype" key={elem.kode} value={elem.kode} label={elem.term} />
                  ))}
                </Skjema.RadioGruppe>
                <Skjema.Select
                  feltNavn="behandlingstema"
                  bredde="fullbredde"
                  label="Behandlingstema"
                  emptyFieldDisabled={false}
                >
                  {MKV.Kodekombinasjoner.gyldigeBehandlingstema(sakstype.kode, sakstema.kode)?.map((elem) => (
                    <option
                      key={elem}
                      value={elem}
                      label={KV.finnTermFraListe(MKV.KTObjects.behandlinger.behandlingstema, elem)}
                    />
                  ))}
                </Skjema.Select>
              </div>
            ) : (
              <Skjema.Select
                feltNavn="behandlingstype"
                bredde="fullbredde"
                label="Velg behandlingstype"
                className="panelElement"
                emptyFieldDisabled={false}
              >
                {behandlingstyper?.map((elem) => (
                  <option key={elem.kode} value={elem.kode} label={elem.term} />
                ))}
              </Skjema.Select>
            )}
          </>
        )}
      </div>
    );
  }

  const visUtenVidereBehandling = sakstemaToggleEnabled ? sakstype.kode === MKV.Koder.sakstyper.EU_EOS : true;

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
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
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
