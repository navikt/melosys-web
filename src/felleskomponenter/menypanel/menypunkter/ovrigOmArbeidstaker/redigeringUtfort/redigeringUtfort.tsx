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

const RedigeringUtfort = ({ arbeidssituasjonOgOevrig }: PropsFromRedux) => {
  return (
    <div className="ovrig-om-arbeidstaker__redigering-utfort">
      <LabelOgSvar
        label={Sporsmal.harLoennetArbeidMinstEnMndFoerUtsending}
        svar={<JaNeiSvar svar={arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending} />}
      />
      <Beskrivelse
        className="beskrivelse"
        label={Sporsmal.beskrivelseArbeidSisteMnd}
        tekst={arbeidssituasjonOgOevrig.beskrivelseArbeidSisteMnd}
      />
      <LabelOgSvar
        label={Sporsmal.harAndreArbeidsgivereIUtsendingsperioden}
        svar={<JaNeiSvar svar={arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden} />}
      />
      <Beskrivelse
        className="beskrivelse"
        label={Sporsmal.beskrivelseAnnetArbeid}
        tekst={arbeidssituasjonOgOevrig.beskrivelseAnnetArbeid}
      />
      <LabelOgSvar
        label={Sporsmal.erSkattepliktig}
        svar={<JaNeiSvar svar={arbeidssituasjonOgOevrig.erSkattepliktig} />}
      />
      <LabelOgSvar
        label={Sporsmal.mottarYtelserNorge}
        svar={<JaNeiSvar svar={arbeidssituasjonOgOevrig.mottarYtelserNorge} />}
      />
      <LabelOgSvar
        label={Sporsmal.mottarYtelserUtlandet}
        svar={<JaNeiSvar svar={arbeidssituasjonOgOevrig.mottarYtelserUtlandet} />}
      />
    </div>
  );
};

export default connector(RedigeringUtfort);
