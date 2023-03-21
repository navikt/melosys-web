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

import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";
import { useAsyncCallbackState } from "../../../../../hooks";

import { PeriodeElementer } from "./komponenter/periodeElementer";
import vurderingPerioderSchema from "./vurderingPerioderSchema";
import "./vurderingPerioder.css";

export type MedlemskapsperiodeProp = Medlemskapsperiode & { ny: boolean; feil: string | undefined };

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
  medlemskapsperioder
    ? [...medlemskapsperioder].sort((a, b) => a.fomDato.localeCompare(b.fomDato)).map(mapTilMedlemskapsperiodeProps)
    : [];

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
    context: {
      soknadsperiode,
      mottaksdato,
    },
    defaultValues: {
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

  const erPeriodeFørMottaksdato = (medlemskapsperiode: MedlemskapsperiodeProp) =>
    Utils.dato.erGyldigPeriode(medlemskapsperiode.fomDato, Utils.dato.formatterDatoTilNorsk(mottaksdato)) &&
    Utils.dato.erGyldigPeriode(medlemskapsperiode.tomDato, Utils.dato.formatterDatoTilNorsk(mottaksdato));

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

  const erKombinasjonGyldig = (medlemskapsperiode: MedlemskapsperiodeProp) => {
    if (erPeriodeFørMottaksdato(medlemskapsperiode)) {
      return (
        medlemskapsperiode.innvilgelsesResultat !== MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET ||
        medlemskapsperiode.trygdedekning === MKV.Koder.trygdedekninger.PENSJONSDEL
      );
    }
    return medlemskapsperiode.innvilgelsesResultat !== MKV.Koder.innvilgelsesResultat.DELVIS_INNVILGET;
  };

  const finnesUgyldigKombinasjon = formValues?.medlemskapsperioder?.some(
    (medlemskapsperiode: MedlemskapsperiodeProp) => !erKombinasjonGyldig(medlemskapsperiode)
  );

  useEffect(() => {
    if (finnesUgyldigKombinasjon) {
      formValues?.medlemskapsperioder?.forEach((medlemskapsperiode: MedlemskapsperiodeProp, index: number) => {
        if (!erKombinasjonGyldig(medlemskapsperiode)) {
          setValue(`medlemskapsperioder[${index}].innvilgelsesResultat`, "");
        }
      });
    }
  }, [finnesUgyldigKombinasjon]);

  if (!aktivtSteg || !formValues) return null;

  const hjelpetekst =
    "Melosys har foreslått medlemskapsperioder på bakgrunn av periode og dekning det er søkt for, og tidspunktet søknaden ble mottatt. Du har mulighet til å gjøre endringer. Hvis du har mottatt opplysninger om at søknadsperiode eller trygdedekning det er søkt om er endret, må du endre dette i det inngangssteget «Inngang».";

  const handleEndreTomDato = (tomDato: string, index: number) => {
    if (antallMedlemskapsperioder === 2 && index === 0) {
      setValue(`medlemskapsperioder[1].fomDato`, Utils.dato.plussEnDag(tomDato));
    }
  };

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

    const nyPeriodeFomDato =
      antallMedlemskapsperioder > 0
        ? Utils.dato.plussEnDag(formValues.medlemskapsperioder[antallMedlemskapsperioder - 1].tomDato)
        : Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom);

    const nyMedlemskapsperiode = {
      id: Utils._uuid(),
      ny: true,
      fomDato: nyPeriodeFomDato,
    };
    setValue(`medlemskapsperioder[${antallMedlemskapsperioder}]`, nyMedlemskapsperiode);
  };

  const handleBekreft = () => {
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
    bekreft();
  };

  const visLeggTilNyPeriode =
    !ingenMedlemskapsperioder &&
    !formValues.medlemskapsperioder.some((periode: MedlemskapsperiodeProp) => Utils._isEmpty(periode.tomDato));

  const visIkkeStottetIMelosys =
    !ingenMedlemskapsperioder &&
    (formValues.medlemskapsperioder.every(
      (periode: MedlemskapsperiodeProp) => periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT
    ) ||
      formValues.medlemskapsperioder.some(
        (periode: MedlemskapsperiodeProp) =>
          !erPeriodeFørMottaksdato(periode) && periode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT
      ));

  const ingenSluttdato =
    !ingenMedlemskapsperioder && Utils._isEmpty(formValues.medlemskapsperioder[antallMedlemskapsperioder - 1].tomDato);

  return (
    <div className="vurderingPerioder">
      <Nav.Typo.Undertittel className="undertittel">
        <LabelMedHjelpetekst
          label="Kontroller medlemskapsperioder"
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

      <PeriodeElementer
        trygdedekninger={trygdedekninger}
        innvilgelsesResultater={innvilgelsesResultater}
        control={control}
        medlemskapsperioder={formValues.medlemskapsperioder}
        handleSlett={handleSlett}
        redigerbart={redigerbart}
        erPeriodeFoerSoknadMottatDato={erPeriodeFørMottaksdato}
        handleEndreTomDato={handleEndreTomDato}
      />

      {visLeggTilNyPeriode && (
        <div className="leggTilKnapp" title="Legg til ny periode">
          <Mui.Lenkeknapp onClick={handleLeggTil} ikon={Ikoner.Add}>
            Legg til periode
          </Mui.Lenkeknapp>
        </div>
      )}

      {visIkkeStottetIMelosys && (
        <Nav.AlertStripeInfo>
          Søknaden kan foreløpig ikke behandles i Melosys. Avslutt saken som bortfalt.
        </Nav.AlertStripeInfo>
      )}

      {ingenMedlemskapsperioder && (
        <Nav.AlertStripeAdvarsel>Du må legge inn minst én periode før du kan fortsette.</Nav.AlertStripeAdvarsel>
      )}

      {ingenSluttdato && (
        <Nav.AlertStripeInfo>
          Du må oppgi sluttdato for å kunne angi resultat. Dette blir sluttdatoen på vedtaket.
        </Nav.AlertStripeInfo>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: handleBekreft, disabled: !redigerbart || !formIsValid }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
