import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "AppTypes";
import { Medlemskapsperiode, OppdaterMedlemskapsperiode } from "Domene";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValues, useForm } from "react-hook-form";

import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as Ikoner from "../../../../../resources/images";
import * as KV from "../../../../../kodeverk";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";

import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../../ducks/folketrygdenkodeverk";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";

import { useAsyncCallbackState } from "../../../../../hooks";

import { PeriodeElementer } from "./komponenter/periodeElementer";
import { Feilmelding, finnAktivFeilmelding } from "./komponenter/feilmeldinger";
import vurderingPerioderSchema from "./vurderingPerioderSchema";
import "./vurderingPerioder.css";

export type MedlemskapsperiodeProp = Medlemskapsperiode & { ny: boolean; feil: string | undefined };

export const sorterPerioder = (a: Medlemskapsperiode, b: Medlemskapsperiode) => a.fomDato.localeCompare(b.fomDato);

const mapTilMedlemskapsperiodeProps = (medlemskapsperiode: Medlemskapsperiode): MedlemskapsperiodeProp => ({
  ...medlemskapsperiode,
  fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
  tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
  ny: false,
  feil: undefined,
});

const mapInitialMedlemskapsperioder = (
  medlemskapsperioder: Medlemskapsperiode[] | undefined
): MedlemskapsperiodeProp[] =>
  medlemskapsperioder ? [...medlemskapsperioder].sort(sorterPerioder).map(mapTilMedlemskapsperiodeProps) : [];

const komponentState = (state: RootState) => ({
  valgtTrygdedekning: mottatteOpplysningerSelectors.TrygdedekningSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  trygdedekninger: folketrygdenkodeverkSelectors.TrygdedekningerSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

interface VurderingPerioderProps {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingPerioder = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: VurderingPerioderProps) => {
  const dispatch = useDispatch();
  const {
    redigerbart,
    valgtTrygdedekning,
    medlemskapsperioder,
    trygdedekninger,
    behandlingID,
    innvilgelsesResultater,
    soknadsperiode,
  } = useSelector(komponentState);
  const [{ mottaksdato }] = useAsyncCallbackState(() => Api.Behandlinger.aarsak.hentMottaksdato(behandlingID), {}, [
    behandlingID,
  ]);

  const {
    setValue,
    control,
    watch,
    trigger: triggerValidation,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingPerioderSchema),
    mode: "all",
    context: { soknadsperiode },
    values: {
      medlemskapsperioder: mapInitialMedlemskapsperioder(medlemskapsperioder),
    } as FieldValues,
  });
  const formValues = watch();

  useEffect(() => {
    oppdaterStatus(formIsValid);
    if (redigerbart)
      debouncedLagreMedlemskapsperioder({
        medlemskapsperioder: formValues?.medlemskapsperioder,
        valid: formIsValid,
      });
  }, [formIsValid]);

  const antallMedlemskapsperioder = formValues.medlemskapsperioder?.length;

  const ingenMedlemskapsperioder = antallMedlemskapsperioder === undefined || antallMedlemskapsperioder === 0;

  const oppdaterMedlemskapsperiode = (
    oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode,
    index: number,
    medlemskapsperiodeID: number
  ) => {
    Api.Medlemskapsperioder.putMedlemskapsperioder(behandlingID, medlemskapsperiodeID, oppdatertMedlemskapsperiode)
      .then(() => {
        setValue(`medlemskapsperioder[${index}].feil`, undefined);
      })
      .catch((error) => {
        setValue(`medlemskapsperioder[${index}].feil`, error.body?.message || error);
      });
  };

  const opprettMedlemskapsperiode = (oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode, index: number) => {
    Api.Medlemskapsperioder.postMedlemskapsperioder(behandlingID, oppdatertMedlemskapsperiode)
      .then((response) => {
        setValue(`medlemskapsperioder[${index}]`, mapTilMedlemskapsperiodeProps(response));
      })
      .catch((error) => {
        setValue(`medlemskapsperioder[${index}].feil`, error.body?.message || error);
      });
  };

  const lagreMedlemskapsperioder = (data: {
    medlemskapsperioder: MedlemskapsperiodeProp[] | undefined;
    valid: boolean;
  }) => {
    if (data.medlemskapsperioder && data.valid) {
      data.medlemskapsperioder.forEach((medlemskapsperiode, index) => {
        const oppdatertMedlemskapsperiode = {
          fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato),
          tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato, null, undefined),
          trygdedekning: medlemskapsperiode.trygdedekning,
          innvilgelsesResultat: medlemskapsperiode.innvilgelsesResultat,
        };

        if (medlemskapsperiode.ny) {
          opprettMedlemskapsperiode(oppdatertMedlemskapsperiode, index);
        } else {
          oppdaterMedlemskapsperiode(oppdatertMedlemskapsperiode, index, medlemskapsperiode.id);
        }
      });
    }
  };
  const debouncedLagreMedlemskapsperioder = useCallback(Utils._debounce(lagreMedlemskapsperioder, 1000), []);

  if (!aktivtSteg || !formValues) return null;

  const handleSlett = (index: number) => {
    if (!formValues?.medlemskapsperioder) return;

    if (formValues.medlemskapsperioder[index].ny) {
      formValues.medlemskapsperioder.splice(index, 1);
    } else {
      Api.Medlemskapsperioder.deleteMedlemskapsperioder(behandlingID, formValues.medlemskapsperioder[index].id)
        .then(() => {
          formValues.medlemskapsperioder.splice(index, 1);
        })
        .catch((error) => {
          setValue(`medlemskapsperioder[${index}].feil`, error.body?.message || error);
        });
    }
    triggerValidation();
  };

  const handleLeggTil = () => {
    if (!antallMedlemskapsperioder) return;

    const nyMedlemskapsperiode = {
      id: Utils._uuid(),
      ny: true,
    };
    setValue(`medlemskapsperioder[${antallMedlemskapsperioder}]`, nyMedlemskapsperiode);
  };

  const handleBekreft = () => {
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    bekreft();
  };

  const visLeggTilNyPeriode =
    !ingenMedlemskapsperioder &&
    !formValues.medlemskapsperioder.some(
      (periode: MedlemskapsperiodeProp) =>
        Utils._isEmpty(periode.fomDato) ||
        Utils._isEmpty(periode.tomDato) ||
        Utils._isEmpty(periode.trygdedekning) ||
        Utils._isEmpty(periode.innvilgelsesResultat)
    );

  const aktivFeilmeldingType = finnAktivFeilmelding(formValues?.medlemskapsperioder);

  return (
    <div className="vurderingPerioder">
      <Nav.Typo.Undertittel className="undertittel">Kontroller medlemskapsperioder</Nav.Typo.Undertittel>

      <div>
        <Nav.Typo.Element className="info_element">Søknad mottatt: </Nav.Typo.Element>
        <Nav.Typo.Normaltekst className="info_element">
          {Utils.dato.formatterDatoTilNorsk(mottaksdato)}
        </Nav.Typo.Normaltekst>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <Nav.Typo.Element className="info_element">Trygdedekning fra søknad: </Nav.Typo.Element>
        <Nav.Typo.Normaltekst className="info_element">
          {KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, valgtTrygdedekning)}
        </Nav.Typo.Normaltekst>
      </div>

      <PeriodeElementer
        trygdedekninger={trygdedekninger}
        innvilgelsesResultater={innvilgelsesResultater}
        control={control}
        medlemskapsperioder={formValues.medlemskapsperioder}
        handleSlett={handleSlett}
        redigerbart={redigerbart}
      />

      {visLeggTilNyPeriode && (
        <div className="leggTilKnapp" title="Legg til ny periode">
          <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add}>
            Legg til periode
          </Mui.Lenkeknapp>
        </div>
      )}

      <Feilmelding type={aktivFeilmeldingType} />

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !redigerbart || !formIsValid || !!aktivFeilmeldingType,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
