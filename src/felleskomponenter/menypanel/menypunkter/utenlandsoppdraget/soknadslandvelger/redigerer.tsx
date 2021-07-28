import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { formValueSelector } from "redux-form";

import * as Skjema from "../../../../skjema";
import * as Nav from "../../../../../utils/navFrontend";
import * as KV from "../../../../../kodeverk";

import MKV from "../../../../../melosyskodeverk";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => ({
  soknadsland: soknadFormValueSelector(state, "soknadsland"),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const Redigerer = ({ soknadsland: { erUkjenteEllerAlleEosLand, landkoder }, behandlingstema }: PropsFromRedux) => {
  const minstEttLandValgt = landkoder.length > 0;

  return (
    <Nav.Fieldset legend="Land">
      {behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND && (
        <Skjema.Checkbox
          feltNavn="soknadsland.erUkjenteEllerAlleEosLand"
          label={
            <Nav.Typo.Normaltekst>
              Flere EØS-land/Sveits. Ikke kjent hvilke.{" "}
              <Nav.Hjelpetekst>
                Når søker ikke vet hvilke land arbeidet/næringen skal utføres i, krysser du av her. Det er ikke mulig å
                legge til andre land i tillegg.
              </Nav.Hjelpetekst>
            </Nav.Typo.Normaltekst>
          }
          disabled={minstEttLandValgt}
        />
      )}
      <Skjema.MultiSelect
        label=""
        feltNavn="soknadsland.landkoder"
        redigerbart={!erUkjenteEllerAlleEosLand}
        options={MKV.KTObjects.landkoder.map(({ kode, term }: KTObject) => ({ value: kode, label: term }))}
      />
    </Nav.Fieldset>
  );
};

export default connector(Redigerer);
