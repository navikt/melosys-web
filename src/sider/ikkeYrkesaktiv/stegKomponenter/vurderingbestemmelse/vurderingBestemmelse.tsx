import React, { useEffect, useState } from "react";
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
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}
export enum VurderingUtfall {
  INNVILGELSE = "INNVILGELSE",
  UNNTAK = "UNNTAK",
  AVSLÅTT = "AVSLÅTT",
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
  const ikkeYrkesaktivSituasjonstype = useSelector(mottatteOpplysningerSelectors.IkkeYrkesaktivSituasjontypeSelector);
  const periodeFom = useSelector(mottatteOpplysningerSelectors.PeriodeFomSelector);
  const periodeTom = useSelector(mottatteOpplysningerSelectors.PeriodeTomSelector);

  let initialVurderingUtfall = null;
  if (lovvalgsperiode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.INNVILGET) {
    initialVurderingUtfall = VurderingUtfall.INNVILGELSE;
  } else if (lovvalgsperiode.innvilgelsesResultat === MKV.Koder.innvilgelsesResultat.AVSLAATT) {
    initialVurderingUtfall = VurderingUtfall.AVSLÅTT;
  }

  const [muligeBestemmelser, setMuligeBestemmelser] = useState<KTObject[]>([]);
  const [lagreLovvalgsperiodePending, setLagreLovvalgsperiodePending] = useState<boolean>(false);
  const [vurderingUtfall, setVurderingUtfall] = useState<VurderingUtfall | null>(initialVurderingUtfall);

  const { control, watch, formState, setValue } = useForm({
    resolver: yupResolver(vurdering_bestemmelse),
    mode: "all",
    defaultValues: {
      vurderingUtfall: initialVurderingUtfall,
      bestemmelse: lovvalgsperiode.lovvalgsbestemmelse || "",
      ikkeYrkesaktivSituasjontype: ikkeYrkesaktivSituasjonstype,
    } as FieldValues,
  });
  const formValues = watch();

  useEffect(() => {
    oppdaterStatus(formState.isValid && vurderingUtfall === VurderingUtfall.INNVILGELSE && formValues.bestemmelse);
  }, [formState?.isValid, vurderingUtfall]);

  useEffect(() => {
    if (aktivtSteg && soeknadsland) {
      Api.Lovvalgsbestemmelser.getLovvalgsbestemmelser(sakstype, sakstema, behandlingstema, soeknadsland).then((res) =>
        setMuligeBestemmelser(res)
      );
    }
  }, [aktivtSteg, soeknadsland]);

  useEffect(() => {
    if (aktivtSteg) {
      if (vurderingUtfall === VurderingUtfall.AVSLÅTT) {
        setValue("bestemmelse", "");
        lagreLovvalgsperiodeOgKontroller("", MKV.Koder.innvilgelsesResultat.AVSLAATT);
      } else if (vurderingUtfall === VurderingUtfall.INNVILGELSE) {
        lagreLovvalgsperiodeOgKontroller("", MKV.Koder.innvilgelsesResultat.INNVILGELSE);
      } else {
        setValue("bestemmelse", "");
        dispatch(lovvalgsperioderOperations.send(behandlingID, []));
      }
    }
  }, [vurderingUtfall]);

  const lagreIkkeYrkesaktivSituasjontype = (ikkeYrkesaktivSituasjontype: string | null) => {
    dispatch(mottatteOpplysningerOperations.oppdaterIkkeYrkesaktivSituasjontype(ikkeYrkesaktivSituasjontype));
  };

  const lagreLovvalgsperiodeOgKontroller = async (bestemmelse: string | null, innvilgelsesresultat: string) => {
    await dispatch(
      lovvalgsperioderOperations.oppdaterLovvalgsperioderState({
        lovvalgsperiode: {
          fomDato: innvilgelsesresultat === MKV.Koder.innvilgelsesResultat.INNVILGELSE ? periodeFom : null,
          tomDato: innvilgelsesresultat === MKV.Koder.innvilgelsesResultat.INNVILGELSE ? periodeTom : null,
        },
        innvilgelsesResultat: innvilgelsesresultat,
        lovvalgsbestemmelse: bestemmelse,
        lovvalgsland: MKV.Koder.land_iso2.NO,
        medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
        trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING,
      })
    );
    await dispatch(lovvalgsperioderOperations.lagre());
  };

  const lagreBestemmelse = (bestemmelse: string) => {
    if (bestemmelse !== MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3E) {
      setValue("ikkeYrkesaktivSituasjontype", null);
      lagreIkkeYrkesaktivSituasjontype(null);
    }
    setLagreLovvalgsperiodePending(true);
    lagreLovvalgsperiodeOgKontroller(bestemmelse, MKV.Koder.innvilgelsesResultat.INNVILGELSE).then(() =>
      setLagreLovvalgsperiodePending(false)
    );
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
          name="vurderingUtfall"
          control={control}
          label="Jeg vil innvilge søknaden"
          value={VurderingUtfall.INNVILGELSE}
          onChange={setVurderingUtfall}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="vurderingUtfall"
          control={control}
          label="Jeg vil søke om unntak"
          value={VurderingUtfall.UNNTAK}
          onChange={setVurderingUtfall}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="vurderingUtfall"
          control={control}
          label="Jeg vil avslå søknaden"
          value={VurderingUtfall.AVSLÅTT}
          onChange={setVurderingUtfall}
          disabled={!redigerbart}
        />
      </Nav.Fieldset>

      {vurderingUtfall === VurderingUtfall.INNVILGELSE && (
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
        </>
      )}

      {vurderingUtfall === VurderingUtfall.UNNTAK && sakstype === MKV.Koder.sakstyper.TRYGDEAVTALE && (
        <Nav.Row>
          <Nav.Column xs="10" className="unntakTekst">
            <UnntakHjelpetekst />
          </Nav.Column>
        </Nav.Row>
      )}

      {vurderingUtfall === VurderingUtfall.UNNTAK && sakstype === MKV.Koder.sakstyper.EU_EOS && (
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
      {vurderingUtfall === VurderingUtfall.AVSLÅTT && <TomFlytMelding />}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !formState?.isValid || !redigerbart || vurderingUtfall !== VurderingUtfall.INNVILGELSE,
          autoDisableVedSpinner: true,
          spinner: lagreLovvalgsperiodePending,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
