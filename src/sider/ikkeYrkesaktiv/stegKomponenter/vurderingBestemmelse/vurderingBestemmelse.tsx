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
const { EU_EOS } = MKV.Koder.sakstyper;
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

      <Forms.RadioGroup
        legend="Hva er din vurdering av søknaden?"
        name="innvilgelsesResultat"
        control={control}
        readOnly={!redigerbart}
      >
        <Nav.Radio value={INNVILGET}>Jeg vil innvilge søknaden</Nav.Radio>
        <Nav.Radio value={UNNTAK}>Jeg vil søke om unntak</Nav.Radio>
        <Nav.Radio value={AVSLAATT}>Jeg vil avslå søknaden</Nav.Radio>
      </Forms.RadioGroup>

      {formValues?.innvilgelsesResultat === INNVILGET && (
        <>
          <Nav.Row className="bestemmelse__rad">
            <Nav.Column xs="7" lg="6">
              <Forms.Select
                name="bestemmelse"
                control={control}
                label="Velg bestemmelse"
                readOnly={!redigerbart}
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
          {formValues.bestemmelse ===
            MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3E && (
            <Forms.RadioGroup
              name="ikkeYrkesaktivSituasjontype"
              legend="Velg brukers situasjon"
              control={control}
              onChange={lagreIkkeYrkesaktivSituasjontype}
              readOnly={!redigerbart}
            >
              {MKV.KTObjects.begrunnelser.ikkeyrkesaktivsituasjontype.map((value: KTObject) => (
                <Nav.Radio name="ikkeYrkesaktivSituasjontype" value={value.kode} key={value.kode}>
                  {value.term || ""}
                </Nav.Radio>
              ))}
            </Forms.RadioGroup>
          )}
        </>
      )}

      {innvilgelsesResultatErUNNTAK && (
        <Nav.Row>
          <Nav.Column xs="10">
            <UnntakHjelpetekst />
          </Nav.Column>
        </Nav.Row>
      )}

      {formValues?.innvilgelsesResultat === AVSLAATT && <IngenFlytMelding />}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: bekreft,
          disabled: !formState?.isValid || !redigerbart || formValues?.innvilgelsesResultat !== INNVILGET,
          loading: lagreLovvalgsperiodePending,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
