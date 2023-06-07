import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RootState } from "AppTypes";
import { useDispatch, useSelector } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import MKV from "../../../melosyskodeverk";
import LabelMedHjelpetekst from "../../../felleskomponenter/labelMedHjelpetekst";
import { PERIODE_HJELPETEKST } from "../../trygdeavtale/stegKomponenter/vurderingVedtak/tekster";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import * as Ikoner from "../../../resources/images";
import * as Utils from "../../../utils";
import * as Forms from "../../../felleskomponenter/forms";
import bem from "../../../bemUtils";
import * as Nav from "../../../navFrontend";
import vurdering_vedtak from "./vurderingVedtakSchema";
import { kontrollOperations } from "../../../ducks/kontroll";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import "./vurderingVedtakIkkeYrkesaktiv.css";

const komponentState = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  soeknadsland: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  mottatteOpplysningerPeriode: mottatteOpplysningerSelectors.PeriodeSelector(state),
  sakstema: fagsakSelectors.SakstemaKodeSelector(state),
  vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
});
export const VurderingVedtak = () => {
  const dispatch = useDispatch();

  const vurderingVedtakCls = bem("vurderingVedtakIkkeYrkesaktiv");

  const {
    sakstype,
    lovvalgsperiode,
    redigerbart,
    mottatteOpplysningerPeriode,
    soeknadsland,
    vedtakstype,
    behandlingID,
  } = useSelector(komponentState);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { control, watch, formState, setValue, trigger } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    context: {
      sluttDato: mottatteOpplysningerPeriode.tom,
      soknadsperiode: mottatteOpplysningerPeriode,
    },
    mode: "all",
    defaultValues: {
      fom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato || mottatteOpplysningerPeriode.fom),
      tom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato || mottatteOpplysningerPeriode.tom),
    } as FieldValues,
  });
  const formValues = watch();

  const lovvalgsperiodeErGyldig = useMemo(() => {
    return !formState.errors.fom && !formState.errors.tom;
  }, [formState.errors.fom, formState.errors.tom]);

  useEffect(() => {
    trigger("tom");
  }, [formValues.fom, trigger]);

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
    if (lovvalgsperiodeErGyldig) {
      oppdaterOgLagreLovvalgsperiode({ fom: formValues.fom, tom: formValues.tom });
      setVisPeriodeEndringFelter(false);
    }
  };

  return (
    <div className={vurderingVedtakCls.block}>
      {sakstype === MKV.Koder.sakstyper.EU_EOS && (
        <Nav.Typo.Innholdstittel className="stegvelgertittel">
          Omfattet av norsk trygdelovgivning - trygdeforordning 883/2004
        </Nav.Typo.Innholdstittel>
      )}
      {sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE && (
        <Nav.Typo.Innholdstittel className="stegvelgertittel">
          Omfattet av norsk trygdelovgivning - trygdeavtale
        </Nav.Typo.Innholdstittel>
      )}

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
                  <Forms.Datovelger label="Fra og med" name="fom" disabled={!redigerbart} control={control} />
                </span>
                <span className={vurderingVedtakCls.element("datofelt")}>
                  <Forms.Datovelger label="Til og med" name="tom" disabled={!redigerbart} control={control} />
                  <Nav.Hovedknapp
                    mini
                    disabled={!redigerbart || !lovvalgsperiodeErGyldig}
                    onClick={handleLagrePeriodeEndring}
                  >
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
    </div>
  );
};
