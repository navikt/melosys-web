import { MouseEventHandler } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import { useSelector } from "react-redux";
import { formValueSelector } from "redux-form";

import MKV from "../../../../../melosyskodeverk";
import * as Skjema from "../../../../skjema";
import * as KV from "../../../../../kodeverk";
import * as Mui from "../../../../ui";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import LabelMedHjelpetekst from "../../../../labelMedHjelpetekst";

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

interface RedigererProps {
  lagre: MouseEventHandler;
}

const Redigerer = ({ lagre }: RedigererProps) => {
  const { landkoder, flereLandUkjentHvilke } = useSelector((state) => soknadFormValueSelector(state, "soknadsland"));
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const minstEttLandValgt = landkoder.length > 0;

  return (
    <>
      {behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND && (
        <Skjema.Checkbox
          feltNavn="soknadsland.flereLandUkjentHvilke"
          label={
            <LabelMedHjelpetekst
              label="Flere EØS-land/Sveits. Ikke kjent hvilke."
              hjelpetekst="Når søker ikke vet hvilke land arbeidet/næringen skal utføres i, krysser du av her. Det er ikke mulig å legge til andre land i tillegg."
            />
          }
          disabled={minstEttLandValgt}
        />
      )}
      <Skjema.MultiSelect
        label=""
        feltNavn="soknadsland.landkoder"
        redigerbart={!flereLandUkjentHvilke}
        options={MKV.KTObjects.landkoder.map(({ kode, term }: KTObject) => ({ value: kode, label: term }))}
      />
      <Mui.Knapp onClick={lagre} className="lagreknapp">
        Lagre
      </Mui.Knapp>
    </>
  );
};

export default Redigerer;
