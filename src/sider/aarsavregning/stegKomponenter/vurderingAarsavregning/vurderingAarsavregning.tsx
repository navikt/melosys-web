import TrygdeavgiftsperioderTabell from "./trygdeavgiftsperioderTabell";
import { useAsyncCallbackState } from "../../../../hooks";
import * as Api from "../../../../services/api";
import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";
import { Alert, Button, Heading, Radio, RadioGroup, VStack } from "@navikt/ds-react";
import "./aarsavregning.css";
import { useEffect, useRef, useState } from "react";
import AarVelger from "../../../../felleskomponenter/AarVelger/aarVelger";
import { LagAarsavregningRequest } from "../../../../services/modules/aarsavregning/aarsavregning";

export const VurderingAarsavregning = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const initialRender = useRef(true);

  const [feil, setFeil] = useState<undefined | string>(undefined);

  const fetchAvregningsData = async () => {
    try {
      // TODO: use behandlingsID when it's ready
      return await Api.Aarsavregning.hentAvregningsData(1);
    } catch (error) {
      // @ts-ignore
      setFeil(error.message);
      return undefined;
    }
  };

  const [lagretTrygdeavgift, setLagretTrygdeavgift] = useAsyncCallbackState(fetchAvregningsData, undefined, []);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  useEffect(() => {
    if (initialRender.current) {
      // TODO finnes det en bedre måte å håndtere dette på?
      initialRender.current = false;
      return;
    }

    const lagNyAvregning: LagAarsavregningRequest = {
      aar: selectedYear,
      behandlingsId: 1, // TODO erstatt med faktisk behandlingsId når det er klart
    };

    Api.Aarsavregning.lagAvregningsData(lagNyAvregning)
      .then(() => fetchAvregningsData())
      .then((response) => setLagretTrygdeavgift(response));
  }, [selectedYear]);

  return (
    <VStack align="start" gap="3">
      <Heading size="large">Årsavregning</Heading>
      {feil && <Alert variant="error">{feil}</Alert>}
      <AarVelger onForandringAvAar={handleYearChange} />
      <VStack className="tabeller" gap="6" align="start">
        <MedlemskapsPerioderTabell
          perioder={lagretTrygdeavgift?.tidligereOpplysninger?.trygdeavgiftsgrunnlag.medlemskapsperioder}
        />
        <SkatteforholdsPerioderTabell
          perioder={lagretTrygdeavgift?.tidligereOpplysninger?.trygdeavgiftsgrunnlag.skatteforholdsperioder}
        />
        <TrygdeavgiftsperioderTabell
          perioder={lagretTrygdeavgift?.tidligereOpplysninger?.avgift.trygdeavgiftsperioder}
          avgift={lagretTrygdeavgift?.tidligereOpplysninger?.avgift}
        />
      </VStack>
      <RadioGroup legend="Er det avvik i opplysningene fra skatt eller bruker?">
        <Radio value="10">Ja</Radio>
        <Radio value="20">Nei</Radio>
      </RadioGroup>
      <Button variant="primary">Bekreft og fortsett</Button>
    </VStack>
  );
};
