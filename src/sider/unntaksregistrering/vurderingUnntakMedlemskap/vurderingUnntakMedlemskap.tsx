import React, { useCallback, useEffect, useState } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import { FieldValues, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { Feilmeldinger } from "../../../felleskomponenter/feilmeldinger";
import { Alertmeldinger } from "../../../felleskomponenter/alertmeldinger";

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
import { kontrollOperations } from "../../../ducks/kontroll";
import { feiletResponsSelectors } from "../../../ducks/feiletRespons";

import vurdering_unntak_medlemskap from "./vurderingUnntakMedlemskapSchema";

import "./vurderingUnntakMedlemskap.css";
import { getLovvalgsbestemmelser } from "../../../services/modules/lovvalgsbestemmelser";
import { Feilkode } from "../../../@types";

const { GODKJENT, DELVIS_GODKJENT, IKKE_GODKJENT } = MKV.Koder.utfallregistreringunntak;
const { UNNTATT, DELVIS_UNNTATT } = MKV.Koder.medlemskapstyper;
const { UTEN_DEKNING, UNNTATT_CAN_7_5_B, UNNTATT_USA_5_2_G } = MKV.Koder.trygdedekninger;
const { OVERLAPPENDE_UNNTAK_PERIODER, INGEN_SLUTTDATO } = MKV.Koder.begrunnelser.kontroll_begrunnelser;

interface VurderingUnntakMedlemskapProps {
  oppdaterStatus: (isValid: boolean) => void;
  tilbake: () => void;
  aktivtSteg: boolean;
}

const VurderingUnntakMedlemskap = ({ oppdaterStatus, tilbake, aktivtSteg }: VurderingUnntakMedlemskapProps) => {
  const [bestemmelser, setBestemmelser] = useState<KTObject[] | undefined>(undefined);

  const dispatch = useDispatch();
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const lovvalgsland = useSelector(mottatteOpplysningerSelectors.LovvalgslandSelector);
  const mottatteOpplysningerPeriode = useSelector(mottatteOpplysningerSelectors.PeriodeSelector);
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const utfallRegistreringUnntak = useSelector(behandlingsresultatSelectors.UtfallRegistreringUnntakSelector);
  const sakstema = useSelector(fagsakSelectors.SakstemaKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);

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

  const kontrollerFerdigbehandling = (skalRegisteropplysningerOppdateres: boolean) =>
    dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        skalRegisteropplysningerOppdateres,
      })
    );

  useEffect(() => {
    if (aktivtSteg) {
      oppdaterOgLagreLovvalgsperiode(formValues, true);
    }
  }, [aktivtSteg]);

  useEffect(() => {
    if (MKV.Koder.sakstyper.TRYGDEAVTALE === sakstype && lovvalgsland && aktivtSteg) {
      getLovvalgsbestemmelser(MKV.Koder.sakstyper.TRYGDEAVTALE, sakstema, behandlingstema, lovvalgsland).then((res) => {
        setBestemmelser(res);
      });
    }
    if (MKV.Koder.sakstyper.EU_EOS === sakstype && aktivtSteg) {
      const eos_bestemmelser = [
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
      setBestemmelser(eos_bestemmelser);
    }
  }, [lovvalgsland, aktivtSteg]);

  useEffect(() => {
    oppdaterStatus(formState.isValid);
  }, [formState?.isValid]);

  const lagreUtfallRegistreringUnntak = (utfall: string) => {
    dispatch(behandlingsresultatOperations.oppdaterUtfallRegistreringUnntak(behandlingID, utfall));
    setValue("fom", Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.fom));
    setValue("tom", Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.tom));
    setValue("bestemmelse", "");
    dispatch(lovvalgsperioderOperations.send(behandlingID, []));
  };

  const lagreLovvalgsperiodeOgKontroller = async (skalRegisteropplysningerOppdateres: boolean) => {
    await dispatch(lovvalgsperioderOperations.lagre());
    kontrollerFerdigbehandling(skalRegisteropplysningerOppdateres);
  };

  const debouncedLagreLovvalgsperiode = useCallback(
    Utils._debounce(
      (skalRegisteropplysningerOppdateres) => lagreLovvalgsperiodeOgKontroller(skalRegisteropplysningerOppdateres),
      500
    ),
    []
  );

  const oppdaterOgLagreLovvalgsperiode = (values: FieldValues, skalRegisteropplysningerOppdateres: boolean = false) => {
    const harMedlemskapstypeDelvisUnntatt =
      sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE &&
      [
        MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca.CAN_ART7,
        MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca.CAN_ART11,
        MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us.USA_ART5_2,
        MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us.USA_ART5_9,
      ].includes(values.bestemmelse);

    const trygdedekningUnntatt = () => {
      switch (values.bestemmelse) {
        case MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca.CAN_ART7:
        case MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca.CAN_ART11:
          return UNNTATT_CAN_7_5_B;
        case MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us.USA_ART5_2:
        case MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us.USA_ART5_9:
          return UNNTATT_USA_5_2_G;
        default:
          return null;
      }
    };

    dispatch(
      lovvalgsperioderOperations.oppdaterLovvalgsperioderState({
        lovvalgsperiode: {
          fomDato: Utils.dato.formatterDatoTilISO(values.fom, null, ""),
          tomDato: Utils.dato.formatterDatoTilISO(values.tom, null, ""),
        },
        innvilgelsesResultat: "",
        lovvalgsbestemmelse: values.bestemmelse,
        lovvalgsland: lovvalgsland === MKV.Koder.land_iso2.CA_QC ? MKV.Koder.land_iso2.CA : lovvalgsland,
        medlemskapstype: harMedlemskapstypeDelvisUnntatt ? DELVIS_UNNTATT : UNNTATT,
        trygdeDekning: harMedlemskapstypeDelvisUnntatt ? trygdedekningUnntatt() : UTEN_DEKNING,
      })
    );
    debouncedLagreLovvalgsperiode(skalRegisteropplysningerOppdateres);
  };

  const lagreFom = (fom: string) => oppdaterOgLagreLovvalgsperiode({ ...formValues, fom });

  const lagreTom = (tom: string) => oppdaterOgLagreLovvalgsperiode({ ...formValues, tom });

  const lagreBestemmelse = (bestemmelse: string) => oppdaterOgLagreLovvalgsperiode({ ...formValues, bestemmelse });

  const handleBekreft = async () => {
    await dispatch(lovvalgsperioderOperations.lagre());
    await Api.Saksflyt.Unntaksregistrering.registrerUnntakFraMedlemskap(behandlingID);
    dispatch(navigeringOperations.tilForsiden());
  };

  const harErrorFeilmelding = () => {
    if (typeof feilmeldinger === "string") {
      return !Utils._isEmpty(feilmeldinger);
    }
    return feilmeldinger.filter((value) => value.kode !== OVERLAPPENDE_UNNTAK_PERIODER).length > 0;
  };

  const feilmeldingerKunUnntaksperioder = (feil: Feilkode[] | string) => {
    if (typeof feil === "string") {
      return "";
    }
    return feil.filter((value) => value.kode === OVERLAPPENDE_UNNTAK_PERIODER);
  };

  const manglerSluttdato = Utils._isEmpty(formValues.tom);

  return (
    <div className="vurderingUnntakMedlemskap">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Unntak medlemskap</Nav.Typo.Innholdstittel>
      <Nav.Fieldset legend="Vurder unntaksperiode">
        <Forms.Radio
          name="utfallRegistreringUnntak"
          control={control}
          label="Godkjenn"
          value={GODKJENT}
          onChange={lagreUtfallRegistreringUnntak}
          disabled={!redigerbart || manglerSluttdato}
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

      {formValues.utfallRegistreringUnntak === GODKJENT && !harErrorFeilmelding() && (
        <Nav.Fieldset legend="">
          <Nav.Row>
            <Nav.Column xs="8">
              <Forms.Select
                name="bestemmelse"
                control={control}
                label="Bestemmelse"
                emptyFieldDisabled={!!formValues.bestemmelse}
                disabled={!redigerbart}
                onChange={lagreBestemmelse}
              >
                {bestemmelser?.map((item: KTObject) => (
                  <option key={item.kode} value={item.kode}>
                    {item.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
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
            <Nav.Column xs="8">
              <Forms.Select
                name="bestemmelse"
                control={control}
                label="Bestemmelse"
                emptyFieldDisabled={!!formValues.bestemmelse}
                disabled={!redigerbart}
                onChange={lagreBestemmelse}
              >
                {bestemmelser?.map((item: KTObject) => (
                  <option key={item.kode} value={item.kode}>
                    {item.term}
                  </option>
                ))}
              </Forms.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      )}

      <Feilmeldinger
        className="vurderingUnntakMedlemskap__feilmelding"
        feilmeldinger={feilmeldinger}
        exclude={[OVERLAPPENDE_UNNTAK_PERIODER, INGEN_SLUTTDATO]}
      />

      {![IKKE_GODKJENT, DELVIS_GODKJENT].includes(formValues.utfallRegistreringUnntak) && (
        <Alertmeldinger
          className="vurderingUnntakMedlemskap__alertmeldinger"
          meldinger={feilmeldingerKunUnntaksperioder(feilmeldinger)}
        />
      )}

      {manglerSluttdato && ![IKKE_GODKJENT, DELVIS_GODKJENT].includes(formValues.utfallRegistreringUnntak) && (
        <Nav.AlertStripeAdvarsel className="vurderingUnntakMedlemskap__ikke_godkjent_advarsel">
          Du kan ikke godkjenne en unntaksperiode med åpen sluttdato
        </Nav.AlertStripeAdvarsel>
      )}

      {[DELVIS_GODKJENT, IKKE_GODKJENT].includes(formValues.utfallRegistreringUnntak) && (
        <Nav.AlertStripeInfo className="vurderingUnntakMedlemskap__alertstripe">
          Ved endring/ikke godkjenning av unntaksperiode bør det sendes informasjon til utenlandsk trygdemyndighet.
        </Nav.AlertStripeInfo>
      )}

      <Mui.StegKnapper
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled:
            !formState?.isValid ||
            (harErrorFeilmelding() && formValues.utfallRegistreringUnntak !== IKKE_GODKJENT) ||
            !redigerbart,
        }}
        bekreftTekst="Bekreft og avslutt"
      />
    </div>
  );
};

export default VurderingUnntakMedlemskap;
