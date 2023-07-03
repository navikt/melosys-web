import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "AppTypes";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldValue, FieldValues, useFieldArray, useForm } from "react-hook-form";

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

export type MedlemskapsperiodeProp = {
  ny: boolean;
  feil?: string;
  periodeId: number;
  fomDato: string;
  tomDato: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
};

export interface FieldArrayProps {
  medlemskapsperioder: MedlemskapsperiodeProp[];
}

export type FormValuesProps = FieldValues & FieldArrayProps;

const mapTilMedlemskapsperiodeProps = (
  medlemskapsperiode: Api.Medlemskapsperioder.Medlemskapsperiode
): MedlemskapsperiodeProp => ({
  ...medlemskapsperiode,
  fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
  tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
  ny: false,
  feil: undefined,
  periodeId: medlemskapsperiode.id,
});

const mapInitialMedlemskapsperioder = (
  medlemskapsperioder: Api.Medlemskapsperioder.Medlemskapsperiode[] | undefined
): MedlemskapsperiodeProp[] =>
  medlemskapsperioder
    ? [...medlemskapsperioder]
        .sort(
          (a, b) =>
            new Date(a.fomDato).getTime() - new Date(b.fomDato).getTime() ||
            (a.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT ? -1 : 1)
        )
        .map(mapTilMedlemskapsperiodeProps)
    : [];

const komponentState = (state: RootState) => ({
  valgtTrygdedekning: mottatteOpplysningerSelectors.TrygdedekningSelector(state),
  lagredeMedlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
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
    lagredeMedlemskapsperioder,
    trygdedekninger,
    behandlingID,
    innvilgelsesResultater,
    soknadsperiode,
  } = useSelector(komponentState);
  const [{ mottaksdato }] = useAsyncCallbackState(() => Api.Behandlinger.aarsak.hentMottaksdato(behandlingID), {}, [
    behandlingID,
  ]);

  const {
    control,
    watch,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingPerioderSchema),
    mode: "all",
    context: { soknadsperiode },
    values: {
      medlemskapsperioder: mapInitialMedlemskapsperioder(lagredeMedlemskapsperioder),
    } as FieldValue<FormValuesProps>,
  });
  const { fields, append, remove, update } = useFieldArray<FieldArrayProps, "medlemskapsperioder", "id">({
    control,
    name: "medlemskapsperioder",
  });
  const formValues = watch();

  useEffect(() => {
    oppdaterStatus(formIsValid);
  }, [formIsValid]);

  const lagreMedlemskapsperiode = async (medlemskapsperiode: MedlemskapsperiodeProp, index: number) => {
    const periodeRequest = {
      fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato),
      tomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato),
      trygdedekning: medlemskapsperiode.trygdedekning,
      innvilgelsesResultat: medlemskapsperiode.innvilgelsesResultat,
    };

    await (medlemskapsperiode.ny
      ? Api.Medlemskapsperioder.postMedlemskapsperioder(behandlingID, periodeRequest)
      : Api.Medlemskapsperioder.putMedlemskapsperioder(behandlingID, medlemskapsperiode.periodeId, periodeRequest)
    )
      .then((response) => {
        update(index, mapTilMedlemskapsperiodeProps(response));
      })
      .catch((error) => {
        update(index, { ...formValues.medlemskapsperioder[index], feil: error.body?.message || error });
      });
  };

  const debouncedLagreMedlemskapsperioder = useCallback(
    Utils._debounce(
      async (medlemskapsperioder, isValid, overskrevetIndex) => {
        if (isValid) {
          // eslint-disable-next-line no-restricted-syntax
          for (const [index, medlemskapsperiode] of medlemskapsperioder.entries()) {
            // eslint-disable-next-line no-await-in-loop
            await lagreMedlemskapsperiode(
              medlemskapsperiode,
              overskrevetIndex !== undefined ? overskrevetIndex : index
            );
          }
        }
      },

      500
    ),
    []
  );

  const aktivFeilmeldingType = finnAktivFeilmelding(formValues?.medlemskapsperioder, soknadsperiode.fom);

  useEffect(() => {
    if (redigerbart && aktivtSteg) {
      debouncedLagreMedlemskapsperioder(
        formValues.medlemskapsperioder,
        formIsValid && !aktivFeilmeldingType,
        undefined
      );
    }
  }, [formIsValid, aktivFeilmeldingType]);

  const antallMedlemskapsperioder = formValues.medlemskapsperioder?.length;

  const ingenMedlemskapsperioder = antallMedlemskapsperioder === undefined || antallMedlemskapsperioder === 0;

  if (!aktivtSteg || !formValues) return null;

  const handleSlett = (index: number) => {
    const medlemskapsperiode = formValues.medlemskapsperioder[index];

    if (medlemskapsperiode.ny) {
      remove(index);
    } else {
      Api.Medlemskapsperioder.deleteMedlemskapsperioder(behandlingID, medlemskapsperiode.periodeId)
        .then(() => {
          remove(index);
        })
        .catch((error) => {
          update(index, { ...medlemskapsperiode, feil: error.body?.message || error });
        });
    }
  };

  const handleLeggTil = () => {
    const nyMedlemskapsperiode = {
      periodeId: Utils._uuid(),
      ny: true,
      fomDato: "",
      tomDato: "",
      innvilgelsesResultat: "",
      trygdedekning: "",
    };
    append(nyMedlemskapsperiode);
  };

  const handleBekreft = () => {
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    bekreft();
  };

  const visLeggTilNyPeriode =
    redigerbart &&
    !ingenMedlemskapsperioder &&
    !formValues.medlemskapsperioder.some(
      (periode: MedlemskapsperiodeProp) =>
        Utils._isEmpty(periode.fomDato) ||
        Utils._isEmpty(periode.tomDato) ||
        Utils._isEmpty(periode.trygdedekning) ||
        Utils._isEmpty(periode.innvilgelsesResultat)
    );

  return (
    <div className="vurderingPerioder">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Kontroller medlemskapsperioder</Nav.Typo.Innholdstittel>

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
        fields={fields}
        handleSlett={handleSlett}
        redigerbart={redigerbart}
        formIsValid={formIsValid && !aktivFeilmeldingType}
        handleChange={debouncedLagreMedlemskapsperioder}
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
