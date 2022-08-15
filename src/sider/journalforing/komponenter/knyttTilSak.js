import React from "react";
import { connect } from "react-redux";
import { formValueSelector } from "redux-form";
import classNames from "classnames";
import PT from "prop-types";

import MKV, { MKVUtils } from "../../../melosyskodeverk";
import * as MPT from "../../../proptypes";
import * as Ikoner from "../../../resources/images";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Mui from "../../../felleskomponenter/ui";

import { useFeatureToggle } from "../../../featuretoggle";

import "./knyttTilSak.css";

export const KnyttTilSak = (props) => {
  const { sak, behandlingstyper, opprettBehandling, sakstemaToggleEnabled } = props;
  const { behandlingOversikter, sakstype } = sak;
  const sisteBehandling = behandlingOversikter[0];
  const sakInneholderSoeknad = behandlingOversikter.some(
    (behandling) => behandling.behandlingstype.kode === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD
  );

  const clsElementskrift = { "border-bottom": "none" };

  const alltidNyBehandlingToggle = useFeatureToggle("melosys.api.journalfoering.alltid.opprett.ny.behandling");

  const visUtenOppretteBehandling =
    alltidNyBehandlingToggle === "enabled" ? !sakInneholderSoeknad : sak.sakstype.kode === MKV.Koder.sakstyper.EU_EOS;

  const sisteBehandlingErInaktiv = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(
    sisteBehandling.behandlingsstatus.kode
  );

  if (sisteBehandlingErInaktiv) {
    return (
      <div className="knyttTilSak__panelramme">
        <Mui.Elementskrift
          tekst="Tidligere behandling er avsluttet. Velg hva du vil gjøre med dokumentet"
          ikon={Ikoner.InformationCircle}
          className="elementTittel oversteUndertittel"
          style={clsElementskrift}
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
        {opprettBehandling() && (
          <>
            {sakstemaToggleEnabled ? (
              <Skjema.RadioGruppe feltNavn="behandlingstype" label="Velg behandlingstype" className="behandlingstype">
                {behandlingstyper?.map((elem) => (
                  <Skjema.Radio feltNavn="behandlingstype" key={elem.kode} value={elem.kode} label={elem.term} />
                ))}
              </Skjema.RadioGruppe>
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
  opprettBehandling: PT.func.isRequired,
  sakstemaToggleEnabled: PT.bool.isRequired,
};
KnyttTilSak.defaultProps = {};

const selector = formValueSelector("journalforing");
const mapStateToProps = (state) => ({
  opprettBehandling: () => selector(state, "opprettBehandling"),
});
export default connect(mapStateToProps)(KnyttTilSak);
