import { useSelector } from "react-redux";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";

import { PeriodeOgLandVelger } from "./komponenter/periodeVelger/periodeVelger";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import vurdering_opplysninger from "./vurderingOpplysningerSchema";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";

export function VurderingOpplysninger() {
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_opplysninger),
    mode: "all",
    defaultValues: {
      fomDato: "",
      tomDato: "",
      bostedsland: "",
    },
    context: { soknadsperiode },
  });

  const formValues = watch();
  const bekreft = async () => {};

  return (
    <>
      <Nav.Heading level="1" className="stegvelgertittel">
        Oppgi opplysninger fra attest/S1
      </Nav.Heading>

      <PeriodeOgLandVelger
        control={control}
        redigerbart={redigerbart}
        formValues={formValues}
        setValue={setValue}
        trigger={trigger}
      />

      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !redigerbart || !formIsValid,
          onClick: bekreft,
        }}
      />
    </>
  );
}

export default VurderingOpplysninger;
