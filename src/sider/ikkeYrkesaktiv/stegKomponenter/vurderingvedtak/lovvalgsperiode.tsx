import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";

import * as Ikoner from "../../../../resources/images";
import * as Utils from "../../../../utils";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Nav from "../../../../navFrontend";

import { PERIODE_HJELPETEKST } from "./tekster";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import vurdering_vedtak from "./vurderingVedtakSchema";

import "./vurderingVedtakIkkeYrkesaktiv.css";

interface LovvalgsperiodeProps {
  kontrollerFerdigbehandling: () => void;
}
export const Lovvalgsperiode = ({ kontrollerFerdigbehandling }: LovvalgsperiodeProps) => {
  const dispatch = useDispatch();

  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const mottatteOpplysningerPeriode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);

  const { control, watch, formState, trigger } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    context: {
      soknadsperiode: mottatteOpplysningerPeriode,
    },
    mode: "all",
    values: {
      fom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato),
      tom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato),
    } as FieldValues,
  });
  const formValues = watch();

  const lagreLovvalgsperiodeOgKontroller = async () => {
    await dispatch(lovvalgsperioderOperations.lagre());
    kontrollerFerdigbehandling();
  };

  const debouncedLagreLovvalgsperiode = useCallback(Utils._debounce(lagreLovvalgsperiodeOgKontroller, 500), []);

  const oppdaterOgLagreLovvalgsperiode = (values: FieldValues) => {
    dispatch(
      lovvalgsperioderOperations.oppdaterLovvalgsperioderState({
        ...lovvalgsperiode,
        lovvalgsperiode: {
          fomDato: Utils.dato.formatterDatoTilISO(values.fom, null, ""),
          tomDato: Utils.dato.formatterDatoTilISO(values.tom, null, ""),
        },
      })
    );

    debouncedLagreLovvalgsperiode();
  };

  const [visPeriodeEndringFelter, setVisPeriodeEndringFelter] = useState(false);

  const EndrePeriodeKnapp = () =>
    redigerbart ? (
      <div
        role="button"
        className="endrePeriode"
        tabIndex={0}
        onClick={() => setVisPeriodeEndringFelter(true)}
        onKeyDown={(event) => {
          if ([" ", "Enter"].includes(event.key)) {
            event.preventDefault();
            setVisPeriodeEndringFelter(true);
          }
        }}
      >
        <Ikoner.BlyantActive className="ikon" />
        <span className="endrePeriodeTekst">Endre</span>
      </div>
    ) : (
      <div className="endrePeriode--disabled">
        <Ikoner.BlyantDisabled className="ikon" />
      </div>
    );

  const handleLagrePeriodeEndring = async () => {
    oppdaterOgLagreLovvalgsperiode({ fom: formValues.fom, tom: formValues.tom });
    setVisPeriodeEndringFelter(false);
  };

  return (
    <Nav.Column>
      <Nav.Typo.Element className="info" tag="div">
        <LabelMedHjelpetekst
          label="Periode"
          hjelpetekst={PERIODE_HJELPETEKST}
          hjelpetekstClassName="vurderingVedtak__hjelpetekst"
        />
      </Nav.Typo.Element>
      <Nav.Typo.Normaltekst className="datofelt_wrapper" tag="div">
        {visPeriodeEndringFelter ? (
          <>
            <span className="datofelt">
              <Forms.Datovelger
                label="Fra og med"
                name="fom"
                disabled={!redigerbart}
                control={control}
                onChange={() => trigger("tom")}
              />
            </span>
            <span className="datofelt">
              <Forms.Datovelger
                label="Til og med"
                name="tom"
                minDate={Utils.dato.norskStringTilDate(formValues.fom)}
                disabled={!redigerbart}
                control={control}
              />
              <Nav.Hovedknapp mini disabled={!redigerbart || !formState.isValid} onClick={handleLagrePeriodeEndring}>
                Lagre
              </Nav.Hovedknapp>
            </span>
          </>
        ) : (
          `${Utils.dato.formatterDatoTilNorsk(lovvalgsperiode?.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
            lovvalgsperiode?.tomDato
          )}`
        )}
        {!visPeriodeEndringFelter && <EndrePeriodeKnapp />}
      </Nav.Typo.Normaltekst>
    </Nav.Column>
  );
};
