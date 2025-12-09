import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Mui from "../../../../felleskomponenter/ui";

import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";

import {
  konverterLovvalgsbestemmelseTilStegData,
  lagLovvalgsbestemmelse,
  lagLovvalgsperiode,
  lagTilleggBestemmelse,
  slettTilleggBestemmelse,
} from "../../../../felleskomponenter/stegvelger";

import VurderingPeriodeSchema from "./vurderingPeriodeSchema";
import "./vurderingPeriode.less";

interface FormValues {
  lovvalgsbestemmelse?: string;
  forkortLovvalgsperiode?: boolean;
  fomDato?: string;
  tomDato?: string;
}

interface Props {
  redigerbart: boolean;
  byggLovvalgsperioder: () => void;
  lovvalgsbestemmelseSomSkalLagres?: string;
  lovvalgsbestemmelseSomSkalVises?: string;
  oppdaterData: (data: unknown) => void;
  slettData: (data?: unknown) => void;
  tilbake: () => void;
  bekreftOgFortsett: () => void;
  aktivtSteg: boolean;
}

export function VurderingPeriode({
  redigerbart,
  byggLovvalgsperioder: gjenopprettOpprinneligLovvalgsperiode,
  lovvalgsbestemmelseSomSkalLagres = "",
  lovvalgsbestemmelseSomSkalVises = "",
  oppdaterData,
  slettData,
  tilbake,
  bekreftOgFortsett,
  aktivtSteg,
}: Props) {
  const mottatteOpplysningerFom = useSelector(mottatteOpplysningerSelectors.PeriodeFomSelector);
  const mottatteOpplysningerTom = useSelector(mottatteOpplysningerSelectors.PeriodeTomSelector);
  const soknadsperiode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const lovvalgsFomDato = useSelector(lovvalgsperioderSelectors.FomDatoSelector);
  const lovvalgsTomDato = useSelector(lovvalgsperioderSelectors.TomDatoSelector);

  const forkortLovvalgsperiode =
    !redigerbart && Utils.dato.datoDiffPure(mottatteOpplysningerTom, lovvalgsTomDato, "days") !== 0;

  // Utled checkbox-state: hvis lovvalgsperioden er ulik søknadsperioden, er den forkortet
  const harForkortetPeriode =
    lovvalgsFomDato &&
    lovvalgsTomDato &&
    (lovvalgsFomDato !== mottatteOpplysningerFom || lovvalgsTomDato !== mottatteOpplysningerTom);

  const { control, watch, formState, handleSubmit, reset } = useForm<FormValues>({
    // @ts-expect-error - yup schema nullable() matcher ikke FormValues optional field perfekt
    resolver: yupResolver(VurderingPeriodeSchema),
    mode: "onChange",
    context: {
      soknadsperiode,
    },
    defaultValues: {
      forkortLovvalgsperiode: harForkortetPeriode || forkortLovvalgsperiode,
      tomDato: Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerTom),
      fomDato: Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerFom),
      lovvalgsbestemmelse: lovvalgsbestemmelseSomSkalVises || undefined,
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (lovvalgsbestemmelseSomSkalLagres) {
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelseSomSkalLagres));
    }
    return () => {
      slettData();
    };
  }, []);

  // Oppdater form-verdiene hvis det finnes en eksisterende forkortet lovvalgsperiode
  useEffect(() => {
    if (
      lovvalgsFomDato &&
      lovvalgsTomDato &&
      (lovvalgsFomDato !== mottatteOpplysningerFom || lovvalgsTomDato !== mottatteOpplysningerTom)
    ) {
      // Det finnes en eksisterende forkortet periode - oppdater form
      reset({
        forkortLovvalgsperiode: true,
        fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsFomDato),
        tomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsTomDato),
        lovvalgsbestemmelse: lovvalgsbestemmelseSomSkalVises || undefined,
      });
    }
  }, [lovvalgsFomDato, lovvalgsTomDato]);

  const valgbareLovvalgsbestemmelser = [
    ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.filter(
      ({ kode }: { kode: string }) =>
        kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
    ),
    ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.filter(
      ({ kode }: { kode: string }) =>
        kode === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
    ),
  ];

  useEffect(() => {
    if (
      formValues.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
    ) {
      oppdaterData(
        lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A),
      );
      oppdaterData(
        lagTilleggBestemmelse(MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5),
      );
    } else if (formValues.lovvalgsbestemmelse) {
      oppdaterData(lagLovvalgsbestemmelse(formValues.lovvalgsbestemmelse));
      slettData(slettTilleggBestemmelse());
    }
  }, [formValues.lovvalgsbestemmelse]);

  // Oppdater lovvalgsperioden når brukeren endrer datoer eller checkbox
  useEffect(() => {
    if (redigerbart) {
      const fomDato =
        formValues.forkortLovvalgsperiode && formValues.fomDato
          ? Utils.dato.formatterDatoTilISO(formValues.fomDato, null)
          : mottatteOpplysningerFom;
      const tomDato =
        formValues.forkortLovvalgsperiode && formValues.tomDato
          ? Utils.dato.formatterDatoTilISO(formValues.tomDato, null)
          : mottatteOpplysningerTom;

      // Bare oppdater hvis vi har gyldige datoer
      if (fomDato && tomDato) {
        oppdaterData(
          lagLovvalgsperiode({
            fomDato,
            tomDato,
          }),
        );
      }
    }
  }, [formValues.forkortLovvalgsperiode, formValues.fomDato, formValues.tomDato, redigerbart]);

  const onCheckboxClick = (checked: boolean) => {
    if (!checked && gjenopprettOpprinneligLovvalgsperiode) {
      gjenopprettOpprinneligLovvalgsperiode();
    }
  };

  const onSubmit = () => {
    bekreftOgFortsett();
  };

  const fomDatoErGyldig = formValues.fomDato && Utils.dato.formatterDatoTilISO(formValues.fomDato, null);
  const tomDatoErGyldig = formValues.tomDato && Utils.dato.formatterDatoTilISO(formValues.tomDato, null);

  const fom = Utils.dato.formatterDatoTilNorsk(
    (formValues.forkortLovvalgsperiode && fomDatoErGyldig && formValues.fomDato) || soknadsperiode.fom,
  );
  const tom = Utils.dato.formatterDatoTilNorsk(
    (formValues.forkortLovvalgsperiode && tomDatoErGyldig && formValues.tomDato) || soknadsperiode.tom,
  );

  const stegErGyldig = redigerbart && formState.isValid && !!formValues.lovvalgsbestemmelse;

  if (!aktivtSteg) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vurderingPeriode">
      <Nav.Heading level="1" className="stegvelgertittel">
        Lovvalgsbestemmelse og -periode
      </Nav.Heading>
      <Nav.Row className="velgLovvalgsbestemmelse">
        <Nav.Column xs="7">
          <Forms.RadioGroup
            legend="Velg en lovvalgsbestemmelse"
            name="lovvalgsbestemmelse"
            control={control}
            readOnly={!redigerbart}
          >
            {valgbareLovvalgsbestemmelser.map((bestemmelse) => (
              <Nav.Radio key={bestemmelse.kode} value={bestemmelse.kode}>
                {bestemmelse.term}
              </Nav.Radio>
            ))}
          </Forms.RadioGroup>
        </Nav.Column>
      </Nav.Row>
      {redigerbart && (
        <>
          <Nav.BodyLong weight="semibold" size="small" className="undertittel">
            Lovvalgsperiode
          </Nav.BodyLong>
          <Nav.Row className="lovvalgsperiode">
            <Nav.Column xs="6">
              {fom} - {tom}
            </Nav.Column>
          </Nav.Row>
        </>
      )}
      <div className="periodeForkorter">
        <Nav.Row className="forkortLovvalgsperiode">
          <Nav.Column xs="8">
            <Forms.Checkbox
              name="forkortLovvalgsperiode"
              control={control}
              label="Lovvalget innvilges for en kortere periode"
              readOnly={!redigerbart}
              onChange={onCheckboxClick}
            />
          </Nav.Column>
        </Nav.Row>
        {formValues.forkortLovvalgsperiode && (
          <Nav.Row>
            <Nav.Column xs="3">
              <Forms.Datovelger label="Startdato" name="fomDato" control={control} readOnly={!redigerbart} />
            </Nav.Column>
            <Nav.Column xs="3">
              <Forms.Datovelger
                label="Sluttdato"
                name="tomDato"
                control={control}
                readOnly={!redigerbart}
                minDate={Utils.dato.isoStringTilDate(soknadsperiode.fom) || new Date()}
                maxDate={Utils.dato.isoStringTilDate(soknadsperiode.tom)}
              />
            </Nav.Column>
          </Nav.Row>
        )}
      </div>

      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !stegErGyldig,
        }}
        tilbakeKnappProps={{
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            tilbake();
          },
          disabled: !redigerbart,
        }}
      />
    </form>
  );
}

export default VurderingPeriode;
