import { useCallback, useEffect, useState } from "react";
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
import { kontrollOperations, kontrollSelectors } from "../../../ducks/kontroll";
import { feiletResponsSelectors } from "../../../ducks/feiletRespons";

import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_LOVVALGSBESTEMMELSE_API_EOS_UNNTAK } from "../../../featuretoggle/toggleNavn";

import vurdering_unntak_medlemskap from "./vurderingUnntakMedlemskapSchema";
import "./vurderingUnntakMedlemskap.css";

const { EU_EOS, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { GODKJENT, DELVIS_GODKJENT, IKKE_GODKJENT } = MKV.Koder.utfallregistreringunntak;
const { OVERLAPPENDE_UNNTAK_PERIODER, INGEN_SLUTTDATO } = MKV.Koder.begrunnelser.kontroll_begrunnelser;

interface VurderingUnntakMedlemskapProps {
  oppdaterStatus: (isValid: boolean) => void;
  tilbake: () => void;
  aktivtSteg: boolean;
}

const VurderingUnntakMedlemskap = ({ oppdaterStatus, tilbake, aktivtSteg }: VurderingUnntakMedlemskapProps) => {
  const [bestemmelser, setBestemmelser] = useState<KTObject[] | undefined>(undefined);
  const [skalOppdatereRegisteropplysninger, setSkalOppdatereRegisteropplysninger] = useState(true);

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
  const kontrollfeil = useSelector(kontrollSelectors.KontrollfeilSelector);
  const lovvalgsApiAktivert = useFeatureToggle(MELOSYS_LOVVALGSBESTEMMELSE_API_EOS_UNNTAK);

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

  const kontrollerFerdigbehandling = (lovvalgsperiodeErLagret: boolean = false) => {
    if (lovvalgsperiodeErLagret || !Utils._isEmpty(lovvalgsperiode)) {
      dispatch(
        kontrollOperations.kontrollerFerdigbehandling({
          behandlingID,
          vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
          skalRegisteropplysningerOppdateres: skalOppdatereRegisteropplysninger,
        })
      );
      if (skalOppdatereRegisteropplysninger) setSkalOppdatereRegisteropplysninger(false);
    }
  };

  useEffect(() => {
    if (aktivtSteg && redigerbart) {
      kontrollerFerdigbehandling();
    }
  }, [aktivtSteg]);

  useEffect(() => {
    if (TRYGDEAVTALE === sakstype && lovvalgsland && aktivtSteg) {
      Api.Lovvalgsbestemmelser.getLovvalgsbestemmelser(TRYGDEAVTALE, sakstema, behandlingstema, lovvalgsland).then(
        (res) => setBestemmelser(res)
      );
    }
    if (EU_EOS === sakstype && aktivtSteg) {
      if (lovvalgsApiAktivert) {
        Api.Lovvalgsbestemmelser.getLovvalgsbestemmelser(sakstype, sakstema, behandlingstema, lovvalgsland).then(
          (res) => setBestemmelser(res)
        );
      } else {
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
    }
  }, [lovvalgsland, aktivtSteg]);

  useEffect(() => {
    oppdaterStatus(formState.isValid);
    if (aktivtSteg && redigerbart) {
      debouncedLagreLovvalgsperiodeOgKontroller(formValues, formState?.isValid);
    }
  }, [formState?.isValid]);

  const lagreUtfallRegistreringUnntak = (utfall: string) => {
    dispatch(behandlingsresultatOperations.oppdaterUtfallRegistreringUnntak(behandlingID, utfall));
    setValue("fom", Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.fom));
    setValue("tom", Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.tom));
    setValue("bestemmelse", "");
    if (lovvalgsperiode?.periodeID)
      dispatch(lovvalgsperioderOperations.slettLovvalgsperiode(behandlingID, lovvalgsperiode.periodeID));
  };

  const lagreLovvalgsperiode = (values: FieldValues) =>
    dispatch(
      lovvalgsperioderOperations.opprettLovvalgsperiode(behandlingID, {
        fomDato: Utils.dato.formatterDatoTilISO(values.fom, null, ""),
        tomDato: Utils.dato.formatterDatoTilISO(values.tom, null, ""),
        lovvalgsbestemmelse: values.bestemmelse,
      })
    );

  const lagreLovvalgsperiodeOgKontroller = async (values: FieldValues, isValid: boolean) => {
    if (isValid) {
      await lagreLovvalgsperiode(values);
      kontrollerFerdigbehandling(true);
    } else {
      kontrollerFerdigbehandling();
    }
  };

  const debouncedLagreLovvalgsperiodeOgKontroller = useCallback(
    Utils._debounce(lagreLovvalgsperiodeOgKontroller, 500),
    []
  );

  const handleEndring = (values: FieldValues) => debouncedLagreLovvalgsperiodeOgKontroller(values, formState?.isValid);

  const lagreFom = (fom: string) => handleEndring({ ...formValues, fom });

  const lagreTom = (tom: string) => handleEndring({ ...formValues, tom });

  const lagreBestemmelse = (bestemmelse: string) => handleEndring({ ...formValues, bestemmelse });

  const handleBekreft = async () => {
    await lagreLovvalgsperiode(formValues);
    await Api.Saksflyt.Unntaksregistrering.registrerUnntakFraMedlemskap(behandlingID);
    dispatch(navigeringOperations.tilForsiden());
  };

  const kontrollFeilOverlappendeUnntakperiode = kontrollfeil?.filter(
    (value) => value.kode === OVERLAPPENDE_UNNTAK_PERIODER
  );

  const harErrorFeilmelding =
    !Utils._isEmpty(feilmeldinger) ||
    !Utils._isEmpty(kontrollfeil?.filter((value) => value.kode !== OVERLAPPENDE_UNNTAK_PERIODER));

  const harSluttdato = !Utils._isEmpty(formValues.tom);

  const utfallErGODKJENT = formValues?.utfallRegistreringUnntak === GODKJENT;
  const utfallErDelvisGodkjent = formValues?.utfallRegistreringUnntak === DELVIS_GODKJENT;
  const utfallValgt = formValues?.utfallRegistreringUnntak;

  return (
    <div className="vurderingUnntakMedlemskap">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Unntak medlemskap</Nav.Typo.Innholdstittel>
      <Nav.Row>
        <Nav.Column xs="8">
          <Nav.Typo.Normaltekst className="formLabel">Vurder unntaksperiode</Nav.Typo.Normaltekst>
          <Forms.Radio
            name="utfallRegistreringUnntak"
            control={control}
            label="Godkjenn"
            value={GODKJENT}
            onChange={lagreUtfallRegistreringUnntak}
            disabled={!redigerbart || !harSluttdato}
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
        </Nav.Column>
      </Nav.Row>

      {utfallErGODKJENT && !harErrorFeilmelding && (
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
      )}

      {formValues.utfallRegistreringUnntak === DELVIS_GODKJENT && (
        <>
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
                minDate={Utils.dato.norskStringTilDate(formValues?.fom)}
                control={control}
                onChange={lagreTom}
              />
            </Nav.Column>
          </Nav.Row>
          {harSluttdato && !harErrorFeilmelding && (
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
          )}
        </>
      )}

      <Feilmeldinger
        className="vurderingUnntakMedlemskap__feilmelding"
        exclude={[OVERLAPPENDE_UNNTAK_PERIODER, INGEN_SLUTTDATO]}
      />

      {(utfallErGODKJENT || utfallErDelvisGodkjent) && !harErrorFeilmelding && (
        <Alertmeldinger
          className="vurderingUnntakMedlemskap__alertmeldinger"
          meldinger={kontrollFeilOverlappendeUnntakperiode}
        />
      )}

      {!harSluttdato && !utfallValgt && (
        <Nav.AlertStripeAdvarsel className="vurderingUnntakMedlemskap__ikke_godkjent_advarsel">
          Du kan ikke godkjenne en unntaksperiode med åpen sluttdato
        </Nav.AlertStripeAdvarsel>
      )}

      {[DELVIS_GODKJENT, IKKE_GODKJENT].includes(formValues.utfallRegistreringUnntak) && !harErrorFeilmelding && (
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
            (harErrorFeilmelding && formValues.utfallRegistreringUnntak !== IKKE_GODKJENT) ||
            !redigerbart,
        }}
        bekreftTekst="Bekreft og avslutt"
      />
    </div>
  );
};

export default VurderingUnntakMedlemskap;
