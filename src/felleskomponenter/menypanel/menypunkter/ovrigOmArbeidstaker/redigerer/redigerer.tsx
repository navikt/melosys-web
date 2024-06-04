import { useSelector } from "react-redux";

import { formSelectors } from "../../../../../ducks/form";
import Sporsmal from "../sporsmal";
import LabelOgEditerbartSvar from "./labelOgEditerbartSvar";
import Beskrivelse from "../beskrivelse";

import "./redigerer.css";

const Redigerer = () => {
  const arbeidssituasjonOgOevrig = useSelector(formSelectors.SoknadFormValuesSelector)?.arbeidssituasjonOgOevrig ?? {};
  return (
    <div className="ovrig-om-arbeidstaker__redigerer">
      <LabelOgEditerbartSvar
        label={Sporsmal.harLoennetArbeidMinstEnMndFoerUtsending}
        feltNavn="arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending"
      />
      {arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending === false && (
        <Beskrivelse
          className="beskrivelse"
          label={Sporsmal.beskrivelseArbeidSisteMnd}
          tekst={arbeidssituasjonOgOevrig.beskrivelseArbeidSisteMnd}
        />
      )}
      <LabelOgEditerbartSvar
        label={Sporsmal.harAndreArbeidsgivereIUtsendingsperioden}
        feltNavn="arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden"
      />
      {arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden === true && (
        <Beskrivelse
          className="beskrivelse"
          label={Sporsmal.beskrivelseAnnetArbeid}
          tekst={arbeidssituasjonOgOevrig.beskrivelseAnnetArbeid}
        />
      )}
      <LabelOgEditerbartSvar label={Sporsmal.erSkattepliktig} feltNavn="arbeidssituasjonOgOevrig.erSkattepliktig" />
      <LabelOgEditerbartSvar
        label={Sporsmal.mottarYtelserNorge}
        feltNavn="arbeidssituasjonOgOevrig.mottarYtelserNorge"
      />
      <LabelOgEditerbartSvar
        label={Sporsmal.mottarYtelserUtlandet}
        feltNavn="arbeidssituasjonOgOevrig.mottarYtelserUtlandet"
      />
    </div>
  );
};

export default Redigerer;
