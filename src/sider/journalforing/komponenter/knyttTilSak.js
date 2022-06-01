import React from "react";
import { connect } from "react-redux";
import { formValueSelector } from "redux-form";
import PT from "prop-types";

import MKV from "../../../melosyskodeverk";
import * as MPT from "../../../proptypes";
import * as Ikoner from "../../../resources/images";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Mui from "../../../felleskomponenter/ui";

import "./knyttTilSak.css";
import { useFeatureToggle } from "../../../featuretoggle";

export const KnyttTilSak = (props) => {
  const { sak, behandlingstyper, opprettBehandling } = props;
  const { behandlingOversikter } = sak;
  const sisteBehandling = behandlingOversikter[0];
  const sakInneholderSoeknad = behandlingOversikter.some(
    (behandling) => behandling.behandlingstype.kode === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD
  );

  const clsElementskrift = { "border-bottom": "none" };

  const alltidNyBehandlingToggle = useFeatureToggle("melosys.api.journalfoering.alltid.opprett.ny.behandling");

  const visUtenOppretteBehandling =
    alltidNyBehandlingToggle === "enabled" ? !sakInneholderSoeknad : sak.sakstype.kode === MKV.Koder.sakstyper.EU_EOS;

  if (sisteBehandling.behandlingsstatus.kode === MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET) {
    return (
      <div className="panelramme">
        <Mui.Elementskrift
          tekst="Tidligere behandling er avsluttet. Velg hva du vil gjøre med dokumentet"
          ikon={Ikoner.InformationCircle}
          className="elementTittel oversteUndertittel"
          style={clsElementskrift}
        />
        <Skjema.RadioGruppe feltNavn="opprettBehandling" label="Knytt til sak">
          {sakInneholderSoeknad && <Skjema.Radio feltNavn="opprettBehandling" value label="Opprett ny behandling" />}
          {visUtenOppretteBehandling && (
            <Skjema.Radio feltNavn="opprettBehandling" value={false} label="Uten å opprette behandling" />
          )}
        </Skjema.RadioGruppe>
        {opprettBehandling() && (
          <Skjema.Select
            feltNavn="behandlingstype"
            bredde="fullbredde"
            label="Velg behandlingstype"
            emptyFieldDisabled={false}
          >
            {behandlingstyper?.map((elem) => (
              <option key={elem.kode} value={elem.kode} label={elem.term} />
            ))}
          </Skjema.Select>
        )}
      </div>
    );
  }
  return (
    <div className="behandlingspanel">
      <Skjema.Checkbox className="knyttTilSak" feltNavn="ingenVurdering" label="Journalfør uten videre behandling" />
    </div>
  );
};
KnyttTilSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  opprettBehandling: PT.func.isRequired,
};
KnyttTilSak.defaultProps = {};
const selector = formValueSelector("journalforing");
const mapStateToProps = (state) => ({
  opprettBehandling: () => selector(state, "opprettBehandling"),
});
export default connect(mapStateToProps)(KnyttTilSak);
