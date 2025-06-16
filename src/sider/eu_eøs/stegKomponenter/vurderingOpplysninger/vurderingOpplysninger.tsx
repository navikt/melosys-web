import { useDispatch, useSelector } from "react-redux";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import * as Mui from "../../../../felleskomponenter/ui";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { vilkarOperations } from "../../../../ducks/vilkar";
import { PeriodeOgLandVelger } from "../felles/periodeVelger/periodeVelger";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import vurdering_opplysninger from "./vurderingOpplysningerSchema";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";

export function VurderingOpplysninger() {
  const dispatch = useDispatch();
  const behandlingID: number = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const {
    control,
    watch,
    setValue,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_opplysninger),
    mode: "onChange",
    context: { soknadsperiode },
  });

  const formValues = watch();
  const bekreft = async () => {};

  return (
    <>
      <Nav.Heading level="1" className="stegvelgertittel">
        Oppgi opplysninger fra attesten
      </Nav.Heading>

      <PeriodeOgLandVelger
        control={control}
        redigerbart={redigerbart}
        formValues={formValues}
        onUkjentDato={setValue}
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
