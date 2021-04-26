import React from "react";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import * as KV from "../../../../../kodeverk";

import Sporsmal from "../sporsmal";
import LabelOgEditerbartSvar, { RadioknappSvar } from "./labelOgEditerbartSvar";
import Beskrivelse from "../beskrivelse";

import "./redigerer.css";

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => {
  const arbeidssituasjonOgOevrig = soknadFormValueSelector(
    state,
    "arbeidssituasjonOgOevrig"
  ) as KV.Form.ArbeidssituasjonOgOevrig;

  return {
    arbeidssituasjonOgOevrig,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const Redigerer = ({ arbeidssituasjonOgOevrig }: PropsFromRedux) => {
  return (
    <div className="ovrig-om-arbeidstaker__redigerer">
      <LabelOgEditerbartSvar
        label={Sporsmal.harLoennetArbeidMinstEnMndFoerUtsending}
        svar={<RadioknappSvar feltNavn="arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending" />}
      />
      <Beskrivelse
        className="beskrivelse"
        label={Sporsmal.beskrivelseArbeidSisteMnd}
        tekst={arbeidssituasjonOgOevrig.beskrivelseArbeidSisteMnd}
      />
      <LabelOgEditerbartSvar
        label={Sporsmal.harAndreArbeidsgivereIUtsendingsperioden}
        svar={<RadioknappSvar feltNavn="arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden" />}
      />
      <Beskrivelse
        className="beskrivelse"
        label={Sporsmal.beskrivelseAnnetArbeid}
        tekst={arbeidssituasjonOgOevrig.beskrivelseAnnetArbeid}
      />
      <LabelOgEditerbartSvar
        label={Sporsmal.erSkattepliktig}
        svar={<RadioknappSvar feltNavn="arbeidssituasjonOgOevrig.erSkattepliktig" />}
      />
      <LabelOgEditerbartSvar
        label={Sporsmal.mottarYtelserNorge}
        svar={<RadioknappSvar feltNavn="arbeidssituasjonOgOevrig.mottarYtelserNorge" />}
      />
      <LabelOgEditerbartSvar
        label={Sporsmal.mottarYtelserUtlandet}
        svar={<RadioknappSvar feltNavn="arbeidssituasjonOgOevrig.mottarYtelserUtlandet" />}
      />
    </div>
  );
};

export default connector(Redigerer);
