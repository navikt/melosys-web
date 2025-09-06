import { useSelector } from "react-redux";

import { formSelectors } from "../../../../../ducks/form";
import Sporsmal from "../sporsmal";
import Beskrivelse from "../beskrivelse";
import { JaNeiSvar, LabelOgSvar } from "./labelOgSvar";

import "./redigeringUtfort.less";

function RedigeringUtfort() {
  const arbeidssituasjonOgOevrig = useSelector(formSelectors.SoknadFormValuesSelector)?.arbeidssituasjonOgOevrig ?? {};
  return (
    <div className="ovrig-om-arbeidstaker__redigering-utfort">
      <LabelOgSvar
        label={Sporsmal.harLoennetArbeidMinstEnMndFoerUtsending}
        svar={<JaNeiSvar svar={arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending} />}
      />
      {arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending === false && (
        <Beskrivelse
          className="beskrivelse"
          label={Sporsmal.beskrivelseArbeidSisteMnd}
          tekst={arbeidssituasjonOgOevrig.beskrivelseArbeidSisteMnd}
        />
      )}
      <LabelOgSvar
        label={Sporsmal.harAndreArbeidsgivereIUtsendingsperioden}
        svar={<JaNeiSvar svar={arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden} />}
      />
      {arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden === true && (
        <Beskrivelse
          className="beskrivelse"
          label={Sporsmal.beskrivelseAnnetArbeid}
          tekst={arbeidssituasjonOgOevrig.beskrivelseAnnetArbeid}
        />
      )}
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
}

export default RedigeringUtfort;
