import { useCallback, useEffect, useState } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";
import { FieldValues, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Feilmeldinger } from "../../../felleskomponenter/feilmeldinger";

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

import vurdering_unntak_medlemskap from "./vurderingUnntakMedlemskapSchema";
import "./vurderingUnntakMedlemskap.less";
import { BestemmelseSelect } from "./bestemmelseSelect";
import { resetKontrollFeil } from "../../../ducks/kontroll/actions";

const { EU_EOS, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { GODKJENT, DELVIS_GODKJENT, IKKE_GODKJENT } = MKV.Koder.utfallregistreringunntak;

interface VurderingUnntakMedlemskapProps {
  oppdaterStatus: (isValid: boolean) => void;
  tilbake: () => void;
  aktivtSteg: boolean;
}

function VurderingUnntakMedlemskap({ oppdaterStatus, tilbake, aktivtSteg }: VurderingUnntakMedlemskapProps) {
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
  const kontrollFeil = useSelector(kontrollSelectors.KontrollFeilSelector);

  const { control, watch, formState, setValue } = useForm({
    resolver: yupResolver<FieldValues>(vurdering_unntak_medlemskap),
    context: { sluttDato: mottatteOpplysningerPeriode.tom },
    mode: "all",
    defaultValues: {
      utfallRegistreringUnntak,
      fom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.fomDato || mottatteOpplysningerPeriode.fom),
      tom: Utils.dato.formatterDatoTilNorsk(lovvalgsperiode.tomDato || mottatteOpplysningerPeriode.tom),
      bestemmelse: lovvalgsperiode.lovvalgsbestemmelse || "",
      trygdedekning: lovvalgsperiode.trygdeDekning,
    } as FieldValues,
  });
  const formValues = watch();

  const kontrollerFerdigbehandling = (kontrollerSomSkalIgnoreres: string[] = []) => {
    dispatch(
      kontrollOperations.kontrollerFerdigbehandling({
        behandlingID,
        vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        skalRegisteropplysningerOppdateres: skalOppdatereRegisteropplysninger,
        kontrollerSomSkalIgnoreres,
      }),
    );
    if (skalOppdatereRegisteropplysninger) setSkalOppdatereRegisteropplysninger(false);
  };

  useEffect(() => {
    if (aktivtSteg && redigerbart && !Utils._isEmpty(lovvalgsperiode)) {
      kontrollerFerdigbehandling();
    }
  }, [aktivtSteg]);

  useEffect(() => {
    if (TRYGDEAVTALE === sakstype && lovvalgsland && aktivtSteg) {
      Api.Lovvalgsbestemmelser.getLovvalgsbestemmelser(TRYGDEAVTALE, sakstema, behandlingstema, lovvalgsland).then(
        (res) => setBestemmelser(res),
      );
    }
    if (EU_EOS === sakstype && aktivtSteg) {
      Api.Lovvalgsbestemmelser.getLovvalgsbestemmelser(sakstype, sakstema, behandlingstema, lovvalgsland).then((res) =>
        setBestemmelser(res),
      );
    }
  }, [lovvalgsland, aktivtSteg]);

  useEffect(() => {
    oppdaterStatus(formState.isValid);
    if (aktivtSteg && redigerbart) {
      debouncedLagreLovvalgsperiodeOgKontroller(formValues, formState?.isValid, []);
    }
  }, [formState?.isValid]);

  const lagreUtfallRegistreringUnntak = (utfall: string) => {
    dispatch(resetKontrollFeil());
    dispatch(behandlingsresultatOperations.oppdaterUtfallRegistreringUnntak(behandlingID, utfall));
    setValue("fom", Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.fom));
    setValue("tom", Utils.dato.formatterDatoTilNorsk(mottatteOpplysningerPeriode.tom));
    setValue("bestemmelse", "");
    setValue("trygdedekning", undefined);
    if (lovvalgsperiode?.periodeID)
      dispatch(lovvalgsperioderOperations.slettLovvalgsperiode(behandlingID, lovvalgsperiode.periodeID));
  };

  const lagreLovvalgsperiode = (values: FieldValues) => {
    const { fom, tom, bestemmelse, trygdedekning } = values;
    return dispatch(
      lovvalgsperioderOperations.opprettLovvalgsperiode(behandlingID, {
        fomDato: Utils.dato.formatterDatoTilISO(fom, "") as string,
        tomDato: Utils.dato.formatterDatoTilISO(tom, "") as string,
        lovvalgsbestemmelse: bestemmelse,
        trygdedekning,
      }),
    );
  };

  const lagreLovvalgsperiodeOgKontroller = async (
    values: FieldValues,
    isValid: boolean,
    kontrollerSomSkalIgnoreres: string[],
  ) => {
    if (isValid && values.utfallRegistreringUnntak !== IKKE_GODKJENT) {
      await lagreLovvalgsperiode(values);
      kontrollerFerdigbehandling(kontrollerSomSkalIgnoreres);
    }
  };

  const debouncedLagreLovvalgsperiodeOgKontroller = useCallback(
    Utils._debounce(lagreLovvalgsperiodeOgKontroller, 500),
    [],
  );

  const handleEndring = (values: FieldValues) =>
    debouncedLagreLovvalgsperiodeOgKontroller(values, formState?.isValid, []);

  const lagreFom = (fom: string) => handleEndring({ ...formValues, fom });

  const lagreTom = (tom: string) => handleEndring({ ...formValues, tom });

  const lagreBestemmelse = (bestemmelse: string) =>
    handleEndring({
      ...formValues,
      bestemmelse,
      trygdedekning: undefined,
    });

  const lagreTrygdedekning = (trygdedekning: string) => handleEndring({ ...formValues, trygdedekning });

  const handleBekreft = async () => {
    await lagreLovvalgsperiode(formValues);
    await Api.Saksflyt.Unntaksregistrering.registrerUnntakFraMedlemskap(behandlingID);
    dispatch(navigeringOperations.tilForsiden());
  };

  const harErrorFeilmelding = !Utils._isEmpty(feilmeldinger) || !Utils._isEmpty(kontrollFeil);

  const harSluttdato = !Utils._isEmpty(formValues.tom);

  const utfallErGODKJENT = formValues?.utfallRegistreringUnntak === GODKJENT;
  const utfallErDelvisGodkjent = formValues?.utfallRegistreringUnntak === DELVIS_GODKJENT;

  return (
    <div className="vurderingUnntakMedlemskap">
      <Nav.Heading level="1" className="stegvelgertittel">
        Unntak medlemskap
      </Nav.Heading>
      <Nav.Row>
        <Nav.Column xs="8">
          <Forms.RadioGroup
            legend={
              <Nav.BodyLong size="small" className="formLabel">
                Vurder unntaksperiode
              </Nav.BodyLong>
            }
            name="utfallRegistreringUnntak"
            readOnly={!redigerbart}
            onChange={lagreUtfallRegistreringUnntak}
            control={control}
          >
            <Nav.Radio value={GODKJENT} disabled={!harSluttdato}>
              Godkjenn
            </Nav.Radio>
            <Nav.Radio value={DELVIS_GODKJENT}>Godkjenn, men endre periode</Nav.Radio>
            <Nav.Radio value={IKKE_GODKJENT}>Ikke godkjenn</Nav.Radio>
          </Forms.RadioGroup>
        </Nav.Column>
      </Nav.Row>

      {utfallErGODKJENT && !harErrorFeilmelding && (
        <BestemmelseSelect
          formValues={formValues}
          control={control}
          bestemmelser={bestemmelser}
          lagreBestemmelse={lagreBestemmelse}
          lagreTrygdedekning={lagreTrygdedekning}
          redigerbart={redigerbart}
        />
      )}

      {utfallErDelvisGodkjent && (
        <>
          <Nav.Row>
            <Nav.Column xs="2">
              <Forms.Datovelger
                label="Fra og med"
                name="fom"
                readOnly={!redigerbart}
                control={control}
                onChange={lagreFom}
              />
            </Nav.Column>
            <Nav.Column xs="2">
              <Forms.Datovelger
                label="Til og med"
                name="tom"
                readOnly={!redigerbart}
                minDate={Utils.dato.norskStringTilDate(formValues?.fom)}
                control={control}
                onChange={lagreTom}
              />
            </Nav.Column>
          </Nav.Row>
          {harSluttdato && !harErrorFeilmelding && (
            <BestemmelseSelect
              formValues={formValues}
              control={control}
              bestemmelser={bestemmelser}
              lagreBestemmelse={lagreBestemmelse}
              lagreTrygdedekning={lagreTrygdedekning}
              redigerbart={redigerbart}
            />
          )}
        </>
      )}

      <Feilmeldinger />

      {[DELVIS_GODKJENT, IKKE_GODKJENT].includes(formValues.utfallRegistreringUnntak) && !harErrorFeilmelding && (
        <Nav.Alert variant="info" className="vurderingUnntakMedlemskap__alertstripe">
          Ved endring/ikke godkjenning av unntaksperiode bør det sendes informasjon til utenlandsk trygdemyndighet.
        </Nav.Alert>
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
}

export default VurderingUnntakMedlemskap;
