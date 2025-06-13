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

interface VurderingOpplysningerProps {
  bekreftOgFortsett: () => void;
  redigerbart: boolean;
  oppfyllerInngangsvilkar: boolean;
  inngangsvilkaar: Api.Vilkar.Vilkaar | undefined;
}

export function VurderingOpplysninger({
  bekreftOgFortsett,
  redigerbart,
  oppfyllerInngangsvilkar,
}: VurderingOpplysningerProps) {
  const dispatch = useDispatch();
  const behandlingID: number = useSelector(behandlingerSelectors.BehandlingIDSelector) as number;
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_opplysninger),
    mode: "onChange",
    context: { soknadsperiode },
  });

  const formValues = watch();

  const bekreft = async () => {
    if (!oppfyllerInngangsvilkar) {
      await Api.Vilkar.overstyrInngangvilkaar(behandlingID);
      await dispatch(vilkarOperations.hent(behandlingID));
    }

    // Kall til api så bekreft

    bekreftOgFortsett();
  };

  return (
    <>
      <Nav.Heading level="1" className="stegvelgertittel">
        Oppgi opplysninger fra attesten
      </Nav.Heading>

      <PeriodeOgLandVelger control={control} redigerbart={redigerbart} formValues={formValues} />
    </>
  );
}

export default VurderingOpplysninger;
