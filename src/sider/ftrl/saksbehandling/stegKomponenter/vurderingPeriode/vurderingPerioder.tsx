import { useCallback, useEffect, useMemo } from "react";
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

import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";
import { useAsyncCallbackState } from "../../../../../hooks";

import { PeriodeElement } from "./periodeElement";
import vurderingPerioderSchema from "./vurderingPerioderSchema";
import "./vurderingPerioder.css";

export type MedlemskapsperiodeProp = Medlemskapsperiode & { ny: boolean; feil: string | undefined };

function transformInitialMedlemskapsperioder(state: RootState) {
  const medlemskapsperioder = medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state);
  return (
    medlemskapsperioder &&
    [...medlemskapsperioder]
      .sort((a, b) => a.fomDato.localeCompare(b.fomDato))
      .map((medlemskapsperiode) => ({
        ...medlemskapsperiode,
        tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
        fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
      }))
  );
}

const komponentState = (state: RootState) => ({
  valgtTrygdedekning: mottatteOpplysningerSelectors.TrygdedekningSelector(state),
  initialValues: {
    medlemskapsperioder: transformInitialMedlemskapsperioder(state),
  },
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
    initialValues,
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
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurderingPerioderSchema),
    mode: "onChange",
    context: {
      soknadsperiode,
      mottaksdato,
    },
    reValidateMode: "onChange",
    values: useMemo(() => initialValues as FieldValues, [initialValues]),
  });
  const formValues = watch();

  useEffect(() => {
    if (formValues.medlemskapsperioder.length === 0 && !Utils._isEmpty(initialValues.medlemskapsperioder)) {
      setValue("medlemskapsperioder", initialValues.medlemskapsperioder);
    }
  }, [initialValues, formValues]);

  useEffect(() => {
    oppdaterStatus(formIsValid);
  }, [formIsValid]);

  const hjelpetekst =
    "Melosys har foreslått medlemskapsperioder på bakgrunn av periode og dekning det er søkt for, og tidspunktet søknaden ble mottatt. Du har mulighet til å gjøre endringer. Hvis du har mottatt opplysninger om at søknadsperiode eller trygdedekning det er søkt om er endret, må du endre dette i det inngangssteget «start».";

  const erPeriodeFoerSoknadMottatDato = (medlemskapsperiode: MedlemskapsperiodeProp) => {
    return (
      Utils.dato.erGyldigPeriode(medlemskapsperiode.fomDato, Utils.dato.formatterDatoTilNorsk(mottaksdato)) &&
      Utils.dato.erGyldigPeriode(medlemskapsperiode.tomDato, Utils.dato.formatterDatoTilNorsk(mottaksdato))
    );
  };

  const erKombinasjonGyldig = (medlemskapsperiode: MedlemskapsperiodeProp) => {
    if (erPeriodeFoerSoknadMottatDato(medlemskapsperiode)) {
      return (
        medlemskapsperiode.innvilgelsesResultat !== MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET ||
        medlemskapsperiode.trygdedekning === MKV.Koder.trygdedekninger.PENSJONSDEL
      );
    }
    return medlemskapsperiode.innvilgelsesResultat !== MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET;
  };

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
        setValue(`medlemskapsperioder[${index}].feil`, error.body && error.body.message ? error.body.message : error);
      });
  };

  const opprettMedlemskapsperiode = (oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode, index: number) => {
    Api.Medlemskapsperioder.postMedlemskapsperioder(behandlingID, oppdatertMedlemskapsperiode)
      .then((response) => {
        setValue(`medlemskapsperioder[${index}]`, {
          ...response,
          ny: false,
          tomDato: Utils.dato.formatterDatoTilNorsk(response.tomDato),
          fomDato: Utils.dato.formatterDatoTilNorsk(response.fomDato),
          feil: undefined,
        });
      })
      .catch((error) => {
        setValue(`medlemskapsperioder[${index}].feil`, error.body && error.body.message ? error.body.message : error);
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
          tomDato: Utils._isEmpty(medlemskapsperiode.tomDato)
            ? null
            : Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato),
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

  useEffect(() => {
    if (formValues?.medlemskapsperioder?.length && formValues.medlemskapsperioder.length > 1) {
      setValue(`medlemskapsperioder[1].fomDato`, Utils.dato.plussEnDag(formValues.medlemskapsperioder[0].tomDato));
    }
    formValues?.medlemskapsperioder?.forEach((medlemskapsperiode: any, index: number) => {
      if (!erKombinasjonGyldig(medlemskapsperiode)) {
        setValue(`medlemskapsperioder[${index}].innvilgelsesResultat`, "");
      }
    });
    if (redigerbart)
      debouncedLagreMedlemskapsperioder({
        medlemskapsperioder: formValues?.medlemskapsperioder,
        valid: formIsValid,
      });
  }, [formValues?.medlemskapsperioder, formIsValid]);

  const handleSlett = (index: number) => {
    if (!formValues || !formValues.medlemskapsperioder) return;
    if (formValues.medlemskapsperioder[index].ny) {
      formValues.medlemskapsperioder.splice(index, 1);
      return;
    }

    Api.Medlemskapsperioder.deleteMedlemskapsperioder(behandlingID, formValues.medlemskapsperioder[index].id)
      .then(() => {
        formValues.medlemskapsperioder.splice(index, 1);
      })
      .catch((error) => {
        setValue(`medlemskapsperioder[${index}].feil`, error.body && error.body.message ? error.body.message : error);
      });
  };

  const handleLeggTil = () => {
    if (!formValues || !formValues.medlemskapsperioder) return;

    const nyPeriodeFomDato =
      formValues.medlemskapsperioder.length > 0
        ? Utils.dato.plussEnDag(formValues.medlemskapsperioder[formValues.medlemskapsperioder.length - 1].tomDato)
        : Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom);

    const nyMedlemskapsperiode = {
      id: Utils._uuid(),
      ny: true,
      fomDato: nyPeriodeFomDato,
    };
    setValue(`medlemskapsperioder[${formValues.medlemskapsperioder.length}]`, nyMedlemskapsperiode);
  };

  const handleBekreft = () => {
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    bekreft();
  };

  const visLeggTilNyPeriode =
    formValues?.medlemskapsperioder?.length !== undefined &&
    !formValues.medlemskapsperioder.some((periode: any) => Utils._isEmpty(periode.tomDato));

  const ingenMedlemskapsperioder =
    formValues?.medlemskapsperioder?.length === undefined || formValues.medlemskapsperioder.length === 0;

  const visIkkeStottetIMelosys =
    !ingenMedlemskapsperioder &&
    (formValues?.medlemskapsperioder?.every(
      (medlemskapsperiode: any) => medlemskapsperiode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT
    ) ||
      formValues?.medlemskapsperioder?.find(
        (medlemskapsperiode: any) =>
          !erPeriodeFoerSoknadMottatDato(medlemskapsperiode) &&
          medlemskapsperiode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT
      ));

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingPerioder">
      <Nav.Typo.Undertittel className="undertittel">
        <LabelMedHjelpetekst
          label="Kontroller foreslåtte medlemskapsperioder"
          hjelpetekst={hjelpetekst}
          hjelpetekstClassName="hjelpetekst"
        />
      </Nav.Typo.Undertittel>

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

      {formValues &&
        formValues.medlemskapsperioder &&
        formValues.medlemskapsperioder.map((medlemskapsperiode: MedlemskapsperiodeProp, index: number) => (
          <PeriodeElement
            trygdedekninger={trygdedekninger}
            innvilgelsesResultater={innvilgelsesResultater}
            key={medlemskapsperiode.id}
            index={index}
            control={control}
            formValues={formValues}
            handleSlett={handleSlett}
            redigerbart={redigerbart}
            erPeriodeFoerSoknadMottatDato={erPeriodeFoerSoknadMottatDato}
          />
        ))}

      {visLeggTilNyPeriode && (
        <div className="leggTilKnapp" title="Legg til ny periode">
          <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add}>
            Legg til ny periode
          </Mui.Lenkeknapp>
        </div>
      )}

      {visIkkeStottetIMelosys && (
        <Nav.AlertStripe type="feil">
          Søknaden kan foreløpig ikke behandles i Melosys. Avslutt saken som bortfalt.
        </Nav.AlertStripe>
      )}

      {ingenMedlemskapsperioder && (
        <Nav.AlertStripe type="advarsel">Du må legge inn minst én periode før du kan fortsette.</Nav.AlertStripe>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: handleBekreft, disabled: !redigerbart || !formIsValid }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
