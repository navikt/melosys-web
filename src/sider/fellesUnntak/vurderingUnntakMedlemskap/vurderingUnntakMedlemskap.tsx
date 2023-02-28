import React, { useCallback, useEffect, useState } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Forms from "../../../felleskomponenter/forms";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";
import * as Utils from "../../../utils";

import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { navigeringOperations } from "../../../ducks/navigering";
import { fagsakSelectors } from "../../../ducks/fagsaker";

import vurdering_unntak_medlemskap from "./vurderingUnntakMedlemskapSchema";
import "./vurderingUnntakMedlemskap.css";

const { GODKJENT, DELVIS_GODKJENT, IKKE_GODKJENT } = MKV.Koder.utfallregistreringunntak;
const { UNNTATT, DELVIS_UNNTATT } = MKV.Koder.medlemskapstyper;
const { UTEN_DEKNING, UNNTATT_CAN_7_5_B, UNNTATT_USA_5_2_G } = MKV.Koder.trygdedekninger;

interface VurderingUnntakMedlemskapProps {
  oppdaterStatus: (isValid: boolean) => void;
  tilbake: () => void;
}

const VurderingUnntakMedlemskap = ({ oppdaterStatus, tilbake }: VurderingUnntakMedlemskapProps) => {
  const dispatch = useDispatch();
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const lovvalgsland = useSelector(mottatteOpplysningerSelectors.LovvalgslandSelector);
  const mottatteOpplysningerPeriode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const utfallRegistreringUnntak = useSelector(behandlingsresultatSelectors.UtfallRegistreringUnntakSelector);
  const sisteOpplysningerHentetDato = useSelector(behandlingerSelectors.SisteOpplysningerHentetDatoSelector);
  const [initialSisteOpplysningerHentet, setInitialSisteOpplysningerHentet] = useState(sisteOpplysningerHentetDato);

  const { control, watch, formState, setValue } = useForm({
    resolver: yupResolver(vurdering_unntak_medlemskap),
    context: { sluttDato: mottatteOpplysningerPeriode.tom },
    mode: "all",
    defaultValues: {
      utfallRegistreringUnntak,
      fom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato || mottatteOpplysningerPeriode.fom),
      tom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato || mottatteOpplysningerPeriode.tom),
      bestemmelse: lovvalgsperiode.lovvalgsbestemmelse || "",
    } as FieldValues,
  });
  const formValues = watch();

  useEffect(() => {
    oppdaterStatus(formState.isValid);
  }, [formState?.isValid]);

  const resetFeltVedOppfriskning = () => {
    setValue("utfallRegistreringUnntak", utfallRegistreringUnntak);
    setValue("fom", Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.fom));
    setValue("tom", Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.tom));
    setValue("bestemmelse", lovvalgsperiode.lovvalgsbestemmelse);
  };

  useEffect(() => {
    if (!utfallRegistreringUnntak && initialSisteOpplysningerHentet !== sisteOpplysningerHentetDato) {
      setInitialSisteOpplysningerHentet(initialSisteOpplysningerHentet);
      resetFeltVedOppfriskning();
    }
  }, [utfallRegistreringUnntak, sisteOpplysningerHentetDato]);

  const lagreUtfallRegistreringUnntak = (utfall: string) => {
    dispatch(behandlingsresultatOperations.oppdaterUtfallRegistreringUnntak(behandlingID, utfall));
  };

  const debouncedLagreLovvalgsperiode = useCallback(
    Utils._debounce(() => dispatch(lovvalgsperioderOperations.lagre()), 1500),
    []
  );

  const oppdaterOgLagreLovvalgsperiode = (values: FieldValues) => {
    const harMedlemskapstypeDelvisUnntatt =
      sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE &&
      [
        MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca.CAN_ART7,
        MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us.USA_ART5_2,
      ].includes(values.bestemmelse);

    const trygdedekningUnntatt =
      MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca.CAN_ART7 === values.bestemmelse
        ? UNNTATT_CAN_7_5_B
        : UNNTATT_USA_5_2_G;

    dispatch(
      lovvalgsperioderOperations.oppdaterLovvalgsperioderState({
        lovvalgsperiode: {
          fom: Utils.dato.formatterDatoTilISO(values.fom, null, ""),
          tom: Utils.dato.formatterDatoTilISO(values.tom, null, ""),
        },
        innvilgelsesResultat: "",
        lovvalgsbestemmelse: values.bestemmelse,
        lovvalgsland: lovvalgsland === MKV.Koder.land_iso2.CA_QC ? MKV.Koder.land_iso2.CA : lovvalgsland,
        medlemskapstype: harMedlemskapstypeDelvisUnntatt ? DELVIS_UNNTATT : UNNTATT,
        trygdeDekning: harMedlemskapstypeDelvisUnntatt ? trygdedekningUnntatt : UTEN_DEKNING,
      })
    );
    debouncedLagreLovvalgsperiode();
  };

  const lagreFom = (fom: string) => oppdaterOgLagreLovvalgsperiode({ ...formValues, fom });

  const lagreTom = (tom: string) => oppdaterOgLagreLovvalgsperiode({ ...formValues, tom });

  const lagreBestemmelse = (bestemmelse: string) => oppdaterOgLagreLovvalgsperiode({ ...formValues, bestemmelse });

  const gyldigeBestemmelser = () => {
    if (sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE) {
      return MKV.KTObjects.lovvalgsbestemmelser.trygdeavtale[
        `lovvalgsbestemmelser_trygdeavtale_${lovvalgsland?.toLowerCase()}`
      ];
    }
    return [
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
      ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
      ...MKV.KTObjects.lovvalgsbestemmelser.overgangsregelbestemmelser,
    ].filter(
      (kt: KTObject) =>
        ![
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_1,
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ANNET,
          MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART87_8,
          MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART87A,
        ].includes(kt.kode)
    );
  };

  const handleBekreft = async () => {
    await Api.Saksflyt.Unntaksregistrering.registrerUnntakFraMedlemskap(behandlingID);
    dispatch(navigeringOperations.tilForsiden());
  };

  return (
    <div className="vurderingUnntakMedlemskap">
      <Nav.Typo.Undertittel className="undertittel">Vurder unntaksperioder</Nav.Typo.Undertittel>
      <Nav.Fieldset legend="Vurder unntaksperiode">
        <Forms.Radio
          name="utfallRegistreringUnntak"
          control={control}
          label="Godkjenn unntaksperiode"
          value={GODKJENT}
          onChange={lagreUtfallRegistreringUnntak}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="utfallRegistreringUnntak"
          control={control}
          label="Godkjenn, men endre periode"
          value={DELVIS_GODKJENT}
          onChange={lagreUtfallRegistreringUnntak}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="utfallRegistreringUnntak"
          control={control}
          label="Ikke godkjenn"
          value={IKKE_GODKJENT}
          onChange={lagreUtfallRegistreringUnntak}
          disabled={!redigerbart}
        />
      </Nav.Fieldset>

      {formValues.utfallRegistreringUnntak === GODKJENT && (
        <>
          <Nav.Row>
            <Nav.Column xs="4">
              <Forms.Select
                name="bestemmelse"
                control={control}
                label="Bestemmelse"
                emptyFieldText="Velg"
                emptyFieldDisabled={!!formValues.bestemmelse}
                disabled={!redigerbart}
                onChange={lagreBestemmelse}
              >
                {gyldigeBestemmelser().map((item: KTObject) => (
                  <option key={item.kode} value={item.kode}>
                    {item.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>
          </Nav.Row>
          {Utils._isEmpty(mottatteOpplysningerPeriode.tom) && (
            <Nav.AlertStripeAdvarsel className="vurderingUnntakMedlemskap__alertstripe">
              Du kan ikke godkjenne en unntaksperiode med åpen sluttdato
            </Nav.AlertStripeAdvarsel>
          )}
        </>
      )}

      {formValues.utfallRegistreringUnntak === DELVIS_GODKJENT && (
        <Nav.Fieldset legend="Lovvalgsperiode">
          <Nav.Row>
            <Nav.Column xs="2">
              <Forms.Datovelger
                label="Fra og med"
                name="fom"
                disabled={!redigerbart}
                control={control}
                onChange={lagreFom}
              />
            </Nav.Column>
            <Nav.Column xs="2">
              <Forms.Datovelger
                label="Til og med"
                name="tom"
                disabled={!redigerbart}
                control={control}
                onChange={lagreTom}
              />
            </Nav.Column>
            <Nav.Column xs="4">
              <Forms.Select
                name="bestemmelse"
                control={control}
                label="Bestemmelse"
                emptyFieldText="Velg"
                emptyFieldDisabled={!!formValues.bestemmelse}
                disabled={!redigerbart}
                onChange={lagreBestemmelse}
              >
                {gyldigeBestemmelser().map((item: KTObject) => (
                  <option key={item.kode} value={item.kode}>
                    {item.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>
          </Nav.Row>
          <Nav.AlertStripeInfo className="vurderingUnntakMedlemskap__alertstripe">
            Ved endring av unntaksperiode bør det sendes informasjon til utenlandsk myndighet. Benytt fritekstbrev i
            brevmenyen.
          </Nav.AlertStripeInfo>
        </Nav.Fieldset>
      )}

      {formValues.utfallRegistreringUnntak === IKKE_GODKJENT && (
        <Nav.AlertStripeInfo className="vurderingUnntakMedlemskap__alertstripe">
          {sakstype === MKV.Koder.sakstyper.EU_EOS
            ? "Ved endring av unntaksperiode bør det sendes informasjon til utenlandsk myndighet. Benytt SED."
            : "Ved endring av unntaksperiode bør det sendes informasjon til utenlandsk myndighet. Benytt fritekstbrev i brevmenyen."}
        </Nav.AlertStripeInfo>
      )}

      <Mui.StegKnapper
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !formState?.isValid || !redigerbart,
        }}
        bekreftTekst="Bekreft og avslutt"
      />
    </div>
  );
};

export default VurderingUnntakMedlemskap;
