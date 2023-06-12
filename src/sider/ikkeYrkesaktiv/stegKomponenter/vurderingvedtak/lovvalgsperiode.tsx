import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import MKV from "../../../../melosyskodeverk";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";

import * as Ikoner from "../../../../resources/images";
import * as Utils from "../../../../utils";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Nav from "../../../../navFrontend";

import { PERIODE_HJELPETEKST } from "./tekster";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import vurdering_vedtak from "./vurderingVedtakSchema";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";

import bem from "../../../../bemUtils";
import "./vurderingVedtakIkkeYrkesaktiv.css";

export const Lovvalgsperiode = () => {
  const dispatch = useDispatch();

  const vurderingVedtakCls = bem("vurderingVedtakIkkeYrkesaktiv");

  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const mottatteOpplysningerPeriode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const soeknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);

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

  const kontrollerFerdigbehandling = () =>
    dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        skalRegisteropplysningerOppdateres: false,
      })
    );

  const lagreLovvalgsperiodeOgKontroller = async () => {
    await dispatch(lovvalgsperioderOperations.lagre());
    kontrollerFerdigbehandling();
  };

  const debouncedLagreLovvalgsperiode = useCallback(Utils._debounce(lagreLovvalgsperiodeOgKontroller, 500), []);

  const oppdaterOgLagreLovvalgsperiode = (values: FieldValues) => {
    dispatch(
      lovvalgsperioderOperations.oppdaterLovvalgsperioderState({
        lovvalgsperiode: {
          fomDato: Utils.dato.formatterDatoTilISO(values.fom, null, ""),
          tomDato: Utils.dato.formatterDatoTilISO(values.tom, null, ""),
        },
        innvilgelsesResultat: "",
        lovvalgsbestemmelse: lovvalgsperiode.lovvalgsbestemmelse,
        lovvalgsland:
          soeknadsland.join("") === MKV.Koder.land_iso2.CA_QC ? MKV.Koder.land_iso2.CA : soeknadsland.join(""),
        medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
        trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING,
      })
    );

    debouncedLagreLovvalgsperiode();
  };

  const [visPeriodeEndringFelter, setVisPeriodeEndringFelter] = useState(false);

  const EndrePeriodeKnapp = () =>
    redigerbart ? (
      <div
        role="button"
        className={vurderingVedtakCls.element("endrePeriode")}
        tabIndex={0}
        onClick={() => setVisPeriodeEndringFelter(true)}
        onKeyDown={(event) => {
          if ([" ", "Enter"].includes(event.key)) {
            event.preventDefault();
            setVisPeriodeEndringFelter(true);
          }
        }}
      >
        <Ikoner.BlyantActive className={vurderingVedtakCls.element("ikon")} />
        <span className={vurderingVedtakCls.element("endrePeriodeTekst")}>Endre</span>
      </div>
    ) : (
      <div className={vurderingVedtakCls.elementWithModifier("endrePeriode", "disabled")}>
        <Ikoner.BlyantDisabled className={vurderingVedtakCls.element("ikon")} />
      </div>
    );

  const handleLagrePeriodeEndring = async () => {
    oppdaterOgLagreLovvalgsperiode({ fom: formValues.fom, tom: formValues.tom });
    setVisPeriodeEndringFelter(false);
  };

  return (
    <Nav.Row className={vurderingVedtakCls.element("infolinje")}>
      <Nav.Column>
        <Nav.Typo.Element className={vurderingVedtakCls.element("info")} tag="div">
          <LabelMedHjelpetekst
            label="Periode"
            hjelpetekst={PERIODE_HJELPETEKST}
            hjelpetekstClassName="vurderingVedtak__hjelpetekst"
          />
        </Nav.Typo.Element>
        <Nav.Typo.Normaltekst className={vurderingVedtakCls.element("datofelt_wrapper")} tag="div">
          {visPeriodeEndringFelter ? (
            <>
              <span className={vurderingVedtakCls.element("datofelt")}>
                <Forms.Datovelger
                  label="Fra og med"
                  name="fom"
                  disabled={!redigerbart}
                  control={control}
                  onChange={() => trigger("tom")}
                />
              </span>
              <span className={vurderingVedtakCls.element("datofelt")}>
                <Forms.Datovelger label="Til og med" name="tom" disabled={!redigerbart} control={control} />
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
    </Nav.Row>
  );
};
