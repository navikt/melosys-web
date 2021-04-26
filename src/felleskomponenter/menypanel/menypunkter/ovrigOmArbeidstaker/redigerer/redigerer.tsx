import React from "react";
import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import * as KV from "../../../../../kodeverk";

import Sporsmal from "../sporsmal";
import LabelOgEditerbartSvar, { RadioknappSvar } from "./labelOgEditerbartSvar";
import Beskrivelse from "../beskrivelse";

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => {
  const oevrigOmArbeidstaker = soknadFormValueSelector(state, "oevrigOmArbeidstaker") as KV.Form.OevrigOmArbeidstaker;

  return {
    oevrigOmArbeidstaker,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const Redigerer = ({ oevrigOmArbeidstaker }: PropsFromRedux) => {
  return (
    <div>
      <LabelOgEditerbartSvar
        label={Sporsmal.harLoennetArbeidMinstEnMndFoerUtsending}
        svar={<RadioknappSvar feltNavn="oevrigOmArbeidstaker.harLoennetArbeidMinstEnMndFoerUtsending" />}
      />
      <Beskrivelse label={Sporsmal.beskrivelseArbeidSisteMnd} tekst={oevrigOmArbeidstaker.beskrivelseArbeidSisteMnd} />
      <LabelOgEditerbartSvar
        label={Sporsmal.harAndreArbeidsgivereIUtsendingsperioden}
        svar={<RadioknappSvar feltNavn="oevrigOmArbeidstaker.harAndreArbeidsgivereIUtsendingsperioden" />}
      />
      <Beskrivelse label={Sporsmal.beskrivelseAnnetArbeid} tekst={oevrigOmArbeidstaker.beskrivelseAnnetArbeid} />
      <LabelOgEditerbartSvar
        label={Sporsmal.erSkattepliktig}
        svar={<RadioknappSvar feltNavn="oevrigOmArbeidstaker.erSkattepliktig" />}
      />
      <LabelOgEditerbartSvar
        label={Sporsmal.mottarYtelserNorge}
        svar={<RadioknappSvar feltNavn="oevrigOmArbeidstaker.mottarYtelserNorge" />}
      />
      <LabelOgEditerbartSvar
        label={Sporsmal.mottarYtelserUtlandet}
        svar={<RadioknappSvar feltNavn="oevrigOmArbeidstaker.mottarYtelserUtlandet" />}
      />
    </div>
  );
};

export default connector(Redigerer);
