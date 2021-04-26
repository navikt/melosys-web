import React from "react";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import * as KV from "../../../../../kodeverk";

import Sporsmal from "../sporsmal";
import Beskrivelse from "../beskrivelse";
import { LabelOgSvar, JaNeiSvar } from "./labelOgSvar";

import "./redigeringUtfort.css";

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => {
  const oevrigOmArbeidstaker = soknadFormValueSelector(state, "oevrigOmArbeidstaker") as KV.Form.OevrigOmArbeidstaker;

  return {
    oevrigOmArbeidstaker,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const RedigeringUtfort = ({ oevrigOmArbeidstaker }: PropsFromRedux) => {
  return (
    <div className="ovrig-om-arbeidstaker__redigering-utfort">
      <LabelOgSvar
        label={Sporsmal.harLoennetArbeidMinstEnMndFoerUtsending}
        svar={<JaNeiSvar svar={oevrigOmArbeidstaker.harLoennetArbeidMinstEnMndFoerUtsending} />}
      />
      <Beskrivelse
        className="beskrivelse"
        label={Sporsmal.beskrivelseArbeidSisteMnd}
        tekst={oevrigOmArbeidstaker.beskrivelseArbeidSisteMnd}
      />
      <LabelOgSvar
        label={Sporsmal.harAndreArbeidsgivereIUtsendingsperioden}
        svar={<JaNeiSvar svar={oevrigOmArbeidstaker.harAndreArbeidsgivereIUtsendingsperioden} />}
      />
      <Beskrivelse
        className="beskrivelse"
        label={Sporsmal.beskrivelseAnnetArbeid}
        tekst={oevrigOmArbeidstaker.beskrivelseAnnetArbeid}
      />
      <LabelOgSvar label={Sporsmal.erSkattepliktig} svar={<JaNeiSvar svar={oevrigOmArbeidstaker.erSkattepliktig} />} />
      <LabelOgSvar
        label={Sporsmal.mottarYtelserNorge}
        svar={<JaNeiSvar svar={oevrigOmArbeidstaker.mottarYtelserNorge} />}
      />
      <LabelOgSvar
        label={Sporsmal.mottarYtelserUtlandet}
        svar={<JaNeiSvar svar={oevrigOmArbeidstaker.mottarYtelserUtlandet} />}
      />
    </div>
  );
};

export default connector(RedigeringUtfort);
