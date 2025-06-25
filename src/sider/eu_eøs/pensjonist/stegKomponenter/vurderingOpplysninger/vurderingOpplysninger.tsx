import { useSelector } from "react-redux";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Utils from "../../../../../utils";
import { useDispatch } from "../../../../../hooks/useDispatch";

import { PeriodeOgLandVelger } from "./komponenter/periodeVelger/periodeVelger";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import vurdering_opplysninger from "./vurderingOpplysningerSchema";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import "./vurderingOpplysninger.css";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import {
  helseutgiftDekkesPeriodeOperations,
  helseutgiftDekkesPeriodeSelector,
} from "../../../../../ducks/helseutgiftdekkesperiode";
import { HelseutgiftDekkesPeriodeDto } from "../../../../../services/modules/helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";
import { useEffect } from "react";
import { oppsummertfaktaOperations } from "../../../../../ducks/oppsummertfakta";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export function VurderingOpplysninger({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) {
  const dispatch = useDispatch();
  const behandlingId = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const helseutgiftDekkesPeriode = useSelector(helseutgiftDekkesPeriodeSelector.HelseutgiftDekkesPeriode).data;
  const { fomDato, tomDato, bostedLandkode } = helseutgiftDekkesPeriode;

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
      bostedLandkode: "",
    },
  });

  useEffect(() => {
    if (fomDato) {
      setValue("fomDato", Utils.dato.formatterDatoTilNorsk(fomDato), { shouldValidate: true });
    }

    if (tomDato) {
      setValue("tomDato", Utils.dato.formatterDatoTilNorsk(tomDato), { shouldValidate: true });
    }

    if (bostedLandkode) {
      setValue("bostedLandkode", bostedLandkode, { shouldValidate: true });
    }
  }, [fomDato, tomDato, bostedLandkode, setValue, trigger]);

  useEffect(() => {
    dispatch(oppsummertfaktaOperations.hentOppsummertFakta(behandlingId));
    dispatch(helseutgiftDekkesPeriodeOperations.hentHelseutgiftDekkesPeriode(behandlingId));
  }, [behandlingId]);

  const formValues = watch();
  const bekreftOgFortsett = async () => {
    if (formIsValid) {
      await dispatch(
        helseutgiftDekkesPeriodeOperations.opprettHelseutgiftDekkesPeriode(behandlingId, {
          fomDato: Utils.dato.formatterDatoTilISO(formValues.fomDato),
          tomDato: Utils.dato.formatterDatoTilISO(formValues.tomDato),
          bostedLandkode: formValues.bostedLandkode,
        } as HelseutgiftDekkesPeriodeDto),
      );

      oppdaterStatus(formIsValid);
      bekreft();
    }
  };

  console.log("Selector i steg1 helse", helseutgiftDekkesPeriode);
  return (
    <>
      <Nav.Heading level="1" className="stegvelgertittel">
        Oppgi opplysninger fra attest / S1
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
          onClick: bekreftOgFortsett,
        }}
      />
    </>
  );
}

export default VurderingOpplysninger;
