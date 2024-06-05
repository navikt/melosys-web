import TrygdeavgiftsperioderTabell from "./trygdeavgiftsperioderTabell";
import { useAsyncCallbackState } from "../../../../hooks";
import * as Api from "../../../../services/api";
import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";
import { Button, Radio, UNSAFE_Combobox, VStack } from "@navikt/ds-react";
import "./aarsavregning.css";

export const VurderingAarsavregning = () => {
  const [lagretTrygdeavgift] = useAsyncCallbackState(
    () => Api.Aarsavregning.hentAvregningsData(1), // TODO hvor skal vi hente avregningsid?
    undefined,
    []
  );

  const initialOptions = ["2023", "2022", "2021", "2020"]; // TODO det kan hende årsvelger blir en del av opprettelse

  return (
    <VStack align="start" gap="5">
      <h1>Årsavregning</h1>
      {/* eslint-disable-next-line react/jsx-pascal-case */}
      <UNSAFE_Combobox className="aarVelger" options={initialOptions} label="År:" />
      <VStack className="tabeller" gap="6" align="start">
        <MedlemskapsPerioderTabell
          perioder={lagretTrygdeavgift?.tidligereOpplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder}
        />
        <SkatteforholdsPerioderTabell
          perioder={lagretTrygdeavgift?.tidligereOpplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder}
        />
        <TrygdeavgiftsperioderTabell
          perioder={lagretTrygdeavgift?.tidligereOpplysninger?.avgift.trygdeavgiftsperioder}
        />
      </VStack>
      <div className="avvik">
        <b>Er det avvik i opplysningene fra skatt eller bruker?</b>
        <Radio value="10">Ja</Radio>
        <Radio value="20">Nei</Radio>
      </div>
      <Button variant="primary">Bekreft og fortsett</Button>
    </VStack>
  );
};
