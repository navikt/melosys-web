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
import { useEffect, useMemo, useState } from "react";
import { UkjentSluttdatoMedlemskapsperiode } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/ukjentSluttdatoMedlemskapsperiode";
import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../../ducks/oppsummertfakta";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export function VurderingOpplysninger({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) {
  const dispatch = useDispatch();
  const [ukjentSluttdatoKey, setUkjentSluttdatoKey] = useState("");

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const helseutgiftDekkesPeriode = useSelector(helseutgiftDekkesPeriodeSelector.HelseutgiftDekkesPeriode).data;
  const { fomDato, tomDato, bostedLandkode } = helseutgiftDekkesPeriode;
  const ukjentSluttdatoMedlemskapsperiode = useSelector(
    oppsummertfaktaSelectors.UkjentSluttdatoMedlemskapsperiodeSelector,
  );

  const initialValues = useMemo(
    () => ({
      fomDato: Utils.dato.formatterDatoTilNorsk(fomDato, false, undefined),
      tomDato: Utils.dato.formatterDatoTilNorsk(tomDato, false, undefined),
      bostedLandkode: bostedLandkode || "",
    }),
    [fomDato, tomDato, bostedLandkode],
  );

  const {
    control,
    watch,
    trigger,
    reset,
    formState: { isValid: formIsValid, isDirty },
  } = useForm({
    resolver: yupResolver(vurdering_opplysninger),
    mode: "all",
    values: initialValues,
  });
  const formValues = watch();

  const debouncedLagreHelseutgiftPeriode = useMemo(
    () =>
      Utils._debounce(async () => {
        const latestValues = watch();
        const isValid = await trigger();
        if (isValid) {
          await oppdaterEllerOpprettHelseutgiftDekkesPeriode(latestValues);
        }
      }, 500),
    [watch(), trigger],
  );

  const oppdaterSluttdato = async (ukjentSluttdato: boolean) => {
    if (ukjentSluttdato) {
      const fomISODate = Utils.dato.formatterDatoTilISO(formValues.fomDato, "");
      if (fomISODate) {
        const fomDato = new Date(fomISODate);
        const tomDato = new Date(fomDato);
        tomDato.setFullYear(tomDato.getFullYear() + 10);
        const newTomDato = Utils.dato.formatterDatoTilNorsk(tomDato.toISOString());
        reset({
          ...formValues,
          tomDato: newTomDato,
        });

        await debouncedLagreHelseutgiftPeriode();
        setUkjentSluttdatoKey(newTomDato);
      }
    } else {
      setUkjentSluttdatoKey("");
    }
    await dispatch(oppsummertfaktaOperations.lagreUkjentSluttdatoMedlemskapsperiode(behandlingID, ukjentSluttdato));
  };

  const oppdaterEllerOpprettHelseutgiftDekkesPeriode = async (formValues: any) => {
    await dispatch(
      helseutgiftDekkesPeriodeOperations.oppdaterEllerOpprettHelseutgiftDekkesPeriode(
        behandlingID,
        {
          fomDato: Utils.dato.formatterDatoTilISO(formValues.fomDato),
          tomDato: Utils.dato.formatterDatoTilISO(formValues.tomDato),
          bostedLandkode: formValues.bostedLandkode,
        } as HelseutgiftDekkesPeriodeDto,
        Utils._isEmpty(helseutgiftDekkesPeriode),
      ),
    );
  };

  const stegErGyldig = formIsValid;

  useEffect(() => {
    oppdaterStatus(stegErGyldig);
  }, [stegErGyldig]);

  const bekreftOgFortsett = async () => {
    if (formIsValid && isDirty) {
      oppdaterEllerOpprettHelseutgiftDekkesPeriode(formValues);
      dispatch(helseutgiftDekkesPeriodeOperations.hentHelseutgiftDekkesPeriode(behandlingID));
    }
    bekreft();
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
        ukjentSluttdato={ukjentSluttdatoMedlemskapsperiode}
        handleChange={async () => {
          await debouncedLagreHelseutgiftPeriode();
        }}
        ukjentSluttdatoKey={ukjentSluttdatoKey}
      />

      <UkjentSluttdatoMedlemskapsperiode
        ukjentSluttdatoMedlemskapsperiode={ukjentSluttdatoMedlemskapsperiode || false}
        onUkjentSluttdatoChange={oppdaterSluttdato}
        erEøsPensjonist={true}
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
