import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Forms from "../../../../felleskomponenter/forms";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";

import { IngenFlytMelding, UnntakHjelpetekst } from "../../../../felleskomponenter/alertmeldinger";

import vurdering_bestemmelse from "./vurderingBestemmelseSchema";
import "./vurderingBestemmelse.css";

const { INNVILGET, AVSLAATT } = MKV.Koder.innvilgelsesResultat;
const { EU_EOS, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const UNNTAK = "UNNTAK";

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
  const ikkeYrkesaktivSituasjonstype = useSelector(mottatteOpplysningerSelectors.IkkeYrkesaktivSituasjontypeSelector);

  const [muligeBestemmelser, setMuligeBestemmelser] = useState<KTObject[]>([]);
  const [lagreLovvalgsperiodePending, setLagreLovvalgsperiodePending] = useState<boolean>(false);

  const { control, watch, formState, setValue } = useForm({
    resolver: yupResolver(vurdering_bestemmelse),
    mode: "all",
    defaultValues: {
      innvilgelsesResultat: lovvalgsperiode.innvilgelsesResultat,
      bestemmelse: lovvalgsperiode.lovvalgsbestemmelse,
      ikkeYrkesaktivSituasjontype: ikkeYrkesaktivSituasjonstype,
    } as FieldValues,
  });
  const formValues = watch();

  useEffect(() => {
    oppdaterStatus(formState.isValid);
  }, [formState?.isValid]);

  useEffect(() => {
    if (aktivtSteg && soeknadsland) {
      Api.Lovvalgsbestemmelser.getLovvalgsbestemmelser(sakstype, sakstema, behandlingstema, soeknadsland).then((res) =>
        setMuligeBestemmelser(res)
      );
    }
  }, [aktivtSteg, soeknadsland]);

  const resetBestemmelseOgIkkeYrkesaktivSituasjonstype = () => {
    setValue("bestemmelse", "");
    setValue("ikkeYrkesaktivSituasjontype", "");
    lagreIkkeYrkesaktivSituasjontype(null);
  };

  useEffect(() => {
    if (aktivtSteg && redigerbart && formValues) {
      resetBestemmelseOgIkkeYrkesaktivSituasjonstype();
      if (formValues.innvilgelsesResultat === UNNTAK) {
        if (lovvalgsperiode?.periodeID)
          dispatch(lovvalgsperioderOperations.slettLovvalgsperiode(behandlingID, lovvalgsperiode.periodeID));
      } else {
        lagreLovvalgsperiode(formValues.innvilgelsesResultat);
      }
    }
  }, [formValues?.innvilgelsesResultat]);

  const lagreIkkeYrkesaktivSituasjontype = (ikkeYrkesaktivSituasjontype: string | null) => {
    dispatch(mottatteOpplysningerOperations.oppdaterIkkeYrkesaktivSituasjontype(ikkeYrkesaktivSituasjontype));
  };

  const lagreLovvalgsperiode = async (innvilgelsesResultat: string, lovvalgsbestemmelse?: string) => {
    await dispatch(
      lovvalgsperioderOperations.opprettLovvalgsperiode(behandlingID, {
        innvilgelsesResultat,
        lovvalgsbestemmelse,
      })
    );
  };

  const lagreBestemmelse = (bestemmelse: string) => {
    if (bestemmelse !== MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3E) {
      setValue("ikkeYrkesaktivSituasjontype", null);
      lagreIkkeYrkesaktivSituasjontype(null);
    }
    setLagreLovvalgsperiodePending(true);
    lagreLovvalgsperiode(formValues.innvilgelsesResultat, bestemmelse).finally(() =>
      setLagreLovvalgsperiodePending(false)
    );
  };

  if (!aktivtSteg) return null;

  const innvilgelsesResultatErUNNTAK = formValues?.innvilgelsesResultat === UNNTAK;

  return (
    <div className="vurderingBestemmelse_ikkeyrkesaktiv">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Bestemmelse og vurdering</Nav.Typo.Innholdstittel>

      {sakstype === EU_EOS && (
        <Nav.Alert variant="info" className="infomelding">
          Du må vurdere om søknaden oppfyller inngangsvilkårene for EU/EØS-saker etter forordning 883/2004
        </Nav.Alert>
      )}

      <Nav.Fieldset legend="Hva er din vurdering av søknaden?" className="innvilgelsesresultat">
        <Forms.Radio
          name="innvilgelsesResultat"
          control={control}
          label="Jeg vil innvilge søknaden"
          value={INNVILGET}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="innvilgelsesResultat"
          control={control}
          label="Jeg vil søke om unntak"
          value={UNNTAK}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="innvilgelsesResultat"
          control={control}
          label="Jeg vil avslå søknaden"
          value={AVSLAATT}
          disabled={!redigerbart}
        />
      </Nav.Fieldset>

      {formValues?.innvilgelsesResultat === INNVILGET && (
        <>
          <Nav.Fieldset legend="Velg bestemmelse">
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
            <Nav.Fieldset legend="Velg brukers situasjon">
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

      {innvilgelsesResultatErUNNTAK && sakstype === TRYGDEAVTALE && (
        <Nav.Row>
          <Nav.Column xs="10">
            <UnntakHjelpetekst />
          </Nav.Column>
        </Nav.Row>
      )}

      {innvilgelsesResultatErUNNTAK && sakstype === EU_EOS && (
        <Nav.Row>
          <Nav.Column xs="12" className="unntakHjelpetekst">
            <Nav.Alert variant="info">
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
            </Nav.Alert>
          </Nav.Column>
        </Nav.Row>
      )}

      {formValues?.innvilgelsesResultat === AVSLAATT && <IngenFlytMelding />}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !formState?.isValid || !redigerbart || formValues?.innvilgelsesResultat !== INNVILGET,
          autoDisableVedSpinner: true,
          spinner: lagreLovvalgsperiodePending,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
