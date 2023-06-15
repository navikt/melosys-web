import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import * as Forms from "../../../../felleskomponenter/forms";
import vurdering_bestemmelse from "./vurderingBestemmelseSchema";
import * as Api from "../../../../services/api";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { TomFlytMelding, UnntakHjelpetekst } from "../../../../felleskomponenter/alertmeldinger";
import { behandlingsresultatOperations, behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import * as Utils from "../../../../utils";
import { kontrollSelectors } from "../../../../ducks/kontroll";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";
import { Feilmeldinger } from "../../../../felleskomponenter/feilmeldinger";

const UNNTAK = "UNNTAK";
const { GODKJENT, IKKE_GODKJENT } = MKV.Koder.utfallregistreringunntak;

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingBestemmelse = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const lovvalgsperiode = useSelector(lovvalgsperioderSelectors.LovvalgsperiodeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const soeknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const sakstema = useSelector(fagsakSelectors.SakstemaKodeSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const utfallRegistreringUnntak = useSelector(behandlingsresultatSelectors.UtfallRegistreringUnntakSelector);
  const ikkeYrkesaktivSituasjonstype = useSelector(mottatteOpplysningerSelectors.IkkeYrkesaktivSituasjontypeSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollfeilSelector);

  const [muligeBestemmelser, setMuligeBestemmelser] = useState<KTObject[]>([]);

  const { control, watch, formState, setValue } = useForm({
    resolver: yupResolver(vurdering_bestemmelse),
    mode: "all",
    defaultValues: {
      utfall: utfallRegistreringUnntak,
      bestemmelse: lovvalgsperiode.lovvalgsbestemmelse || "",
      ikkeYrkesaktivSituasjontype: ikkeYrkesaktivSituasjonstype,
    } as FieldValues,
  });
  const formValues = watch();

  useEffect(() => {
    oppdaterStatus(formState.isValid && formValues.utfall && formValues.bestemmelse);
  }, [formState?.isValid]);

  useEffect(() => {
    if (aktivtSteg && soeknadsland) {
      Api.Lovvalgsbestemmelser.getLovvalgsbestemmelser(sakstype, sakstema, behandlingstema, soeknadsland).then((res) =>
        setMuligeBestemmelser(res)
      );
    }
  }, [aktivtSteg, soeknadsland]);

  const lagreUtfallRegistrering = (utfall: string) => {
    dispatch(
      behandlingsresultatOperations.oppdaterUtfallRegistreringUnntak(behandlingID, utfall !== UNNTAK ? utfall : null)
    );
    setValue("bestemmelse", "");
    dispatch(lovvalgsperioderOperations.send(behandlingID, []));
  };

  const lagreLovvalgsperiodeOgKontroller = async () => {
    await dispatch(lovvalgsperioderOperations.lagre());
  };

  const lagreIkkeYrkesaktivSituasjontype = (ikkeYrkesaktivSituasjontype: string | null) => {
    dispatch(mottatteOpplysningerOperations.oppdaterIkkeYrkesaktivSituasjontype(ikkeYrkesaktivSituasjontype));
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
        lovvalgsbestemmelse: values.bestemmelse,
        lovvalgsland:
          soeknadsland.join("") === MKV.Koder.land_iso2.CA_QC ? MKV.Koder.land_iso2.CA : soeknadsland.join(""),
        medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
        trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING,
      })
    );

    debouncedLagreLovvalgsperiode();
  };

  const lagreBestemmelse = (bestemmelse: string) => {
    if (bestemmelse !== MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3E) {
      setValue("ikkeYrkesaktivSituasjontype", null);
      lagreIkkeYrkesaktivSituasjontype(null);
    }
    oppdaterOgLagreLovvalgsperiode({ ...formValues, bestemmelse });
  };

  if (!aktivtSteg) return null;
  return (
    <div className="vurderingBestemmelse">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Bestemmelse og vurdering</Nav.Typo.Innholdstittel>

      {sakstype === MKV.Koder.sakstyper.EU_EOS && (
        <Nav.AlertStripeInfo>
          Du må vurdere om søknaden oppfyller inngangsvilkårene for EU/EØS-saker etter forordning 883/2004
        </Nav.AlertStripeInfo>
      )}

      <Nav.Fieldset legend="Hva er din vurdering av søknaden?">
        <Forms.Radio
          name="utfall"
          control={control}
          label="Jeg vil innvilge søknaden"
          value={GODKJENT}
          onChange={lagreUtfallRegistrering}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="utfall"
          control={control}
          label="Jeg vil søke om unntak"
          value={UNNTAK}
          onChange={lagreUtfallRegistrering}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="utfall"
          control={control}
          label="Jeg vil avslå søknaden"
          value={IKKE_GODKJENT}
          onChange={lagreUtfallRegistrering}
          disabled={!redigerbart}
        />
      </Nav.Fieldset>

      {formValues.utfall === GODKJENT && (
        <>
          <Nav.Fieldset className="select" legend="Velg bestemmelse">
            <Nav.Row>
              <Nav.Column xs="7">
                <Forms.Select
                  name="bestemmelse"
                  control={control}
                  label=""
                  disabled={!redigerbart}
                  onChange={lagreBestemmelse}
                  emptyFieldDisabled={!!formValues.bestemmelse}
                >
                  {muligeBestemmelser.map((muligBestemmelse) => (
                    <option value={muligBestemmelse.kode} key={muligBestemmelse.kode}>
                      {muligBestemmelse.term}
                    </option>
                  ))}
                </Forms.Select>
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
          {formValues.bestemmelse ===
            MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3E && (
            <Nav.Fieldset legend="Velg brukers situasjon ">
              {MKV.KTObjects.begrunnelser.ikkeyrkesaktivsituasjontype.map((value: KTObject) => (
                <Forms.Radio
                  name="ikkeYrkesaktivSituasjontype"
                  control={control}
                  label={value.term || ""}
                  value={value.kode}
                  disabled={!redigerbart}
                  onChange={lagreIkkeYrkesaktivSituasjontype}
                  key={value.kode}
                />
              ))}
            </Nav.Fieldset>
          )}

          {formState.isValid && (
            <Feilmeldinger
              className="vurderingUnntakMedlemskap__feilmelding"
              feilmeldinger={feilmeldinger}
              kontrollfeil={kontrollfeil}
            />
          )}
        </>
      )}

      {formValues.utfall === UNNTAK && sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE && (
        <Nav.Row>
          <Nav.Column xs="10" className="unntakTekst">
            <UnntakHjelpetekst />
          </Nav.Column>
        </Nav.Row>
      )}

      {formValues.utfall === UNNTAK && sakstype === MKV.Koder.sakstyper.EU_EOS && (
        <Nav.Row>
          <Nav.Column xs="10" className="unntakTekst">
            <Nav.EtikettBase type="info">
              <ul>
                <li>Opprett LA_BUC_01 i &quot;Opprett ny BUC&quot;-menyen</li>
                <li>Fyll ut og send A001 direkte i Rina</li>
                <li>Send orienteringsbrev til bruker/fullmektig i &quot;Send brev&quot;-menyen</li>
                <li>Endre behandlingsstatus til &quot;Avventer svar fra utenlandsk trygdemyndighet&quot;</li>
                <li>Registrer perioden i MEDL som uavklart</li>
              </ul>
              <p>
                Når du får svar fra utenlandsk trygdemyndighet, må du endre valget på dette steget, og fatte vedtak.
              </p>
            </Nav.EtikettBase>
          </Nav.Column>
        </Nav.Row>
      )}

      {formValues.utfall === IKKE_GODKJENT && <TomFlytMelding />}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !formState?.isValid || !redigerbart || formValues.utfall !== GODKJENT,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
