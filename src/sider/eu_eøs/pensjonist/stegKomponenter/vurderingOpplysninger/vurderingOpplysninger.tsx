import { useDispatch, useSelector } from "react-redux";
import * as Nav from "../../../../../navFrontend";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Utils from "../../../../../utils";

import { PeriodeOgLandVelger } from "./komponenter/periodeVelger/periodeVelger";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import vurdering_opplysninger from "./vurderingOpplysningerSchema";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import "./vurderingOpplysninger.css";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import {
  helseutgiftDekkesPeriodeOperations,
  helseutgiftDekkesPeriodeSelector,
} from "../../../../../ducks/helseutgiftdekkesperiode";
import { HelseutgiftDekkesPeriodeDto } from "../../../../../services/modules/helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";
import { useEffect } from "react";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export function VurderingOpplysninger({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) {
  const dispatch = useDispatch();
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const behandlingId = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const helseutgiftDekkesPeriode = useSelector(helseutgiftDekkesPeriodeSelector.HelseutgiftDekkesPeriode).data;
  const { fomDato, tomDato, bostedsland } = helseutgiftDekkesPeriode;

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
  });

  useEffect(() => {
    if (fomDato) setValue("fomDato", Utils.dato.formatterDatoTilNorsk(fomDato));
    if (tomDato) setValue("tomDato", Utils.dato.formatterDatoTilNorsk(tomDato));
    if (bostedsland) setValue("bostedsland", bostedsland);

    trigger(["fomDato", "tomDato", "bostedsland"]);
  }, [fomDato, tomDato, bostedsland, setValue, trigger]);

  useEffect(() => {
    dispatch(helseutgiftDekkesPeriodeOperations.hentHelseutgiftDekkesPeriode(behandlingId));
  }, [behandlingId]);

  const formValues = watch();
  const bekreftOgFortsett = async () => {
    if (formIsValid) {
      await dispatch(
        helseutgiftDekkesPeriodeOperations.opprettHelseutgiftDekkesPeriode(behandlingId, {
          fomDato: Utils.dato.formatterDatoTilISO(formValues.fomDato),
          tomDato: Utils.dato.formatterDatoTilISO(formValues.tomDato),
          bostedsland: formValues.bostedsland,
        } as HelseutgiftDekkesPeriodeDto),
      );
      bekreft();
    }
  };

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
