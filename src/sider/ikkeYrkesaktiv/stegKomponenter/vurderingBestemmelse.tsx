import React, { useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { useDispatch, useSelector } from "react-redux";

import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KTObject } from "@navikt/melosys-kodeverk";
import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";

import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../ducks/folketrygdenkodeverk";
import { vilkarOperations, vilkarSelectors } from "../../../ducks/vilkar";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import * as Forms from "../../../felleskomponenter/forms";
import vurdering_bestemmelse from "./vurderingBestemmelseSchema";
import * as Api from "../../../services/api";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import UnntakHjelpetekst from "../../trygdeavtale/stegKomponenter/vurderingBestemmelse/unntakHjelpetekst/unntakHjelpetekst";
import { FlytFinnesIkke } from "../../ftrl/saksbehandling/stegKomponenter/vurderingBestemmelse/komponenter/flytFinnesIkke";

const INNVILGE = "INNVILGE";
const UNNTAK = "UNNTAK";
const AVSLAG = "AVSLAG";

const komponentState = (state: RootState) => ({
  vilkarListe: vilkarSelectors.VilkarSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  bestemmelse: medlemskapsperioderSelectors.BestemmelseSelector(state),
  vilkaarKodeverk: folketrygdenkodeverkSelectors.VilkaarSelector(state),
  begrunnelserKodeverk: folketrygdenkodeverkSelectors.BegrunnelserSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  soeknadsland: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
});

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export const VurderingBestemmelse = ({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) => {
  const dispatch = useDispatch();
  const { bestemmelse, redigerbart, soeknadsland } = useSelector(komponentState);
  const fagsak = useSelector(fagsakSelectors.FagsakSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const [muligeBestemmelser, setMuligeBestemmelser] = useState<KTObject[]>([]);

  const { control, watch, formState, setValue } = useForm({
    resolver: yupResolver(vurdering_bestemmelse),
    mode: "all",
    defaultValues: {
      utfall: "",
      bestemmelse: bestemmelse || "",
      brukers_situasjon: "",
    } as FieldValues,
  });
  const formValues = watch();

  useEffect(() => {
    oppdaterStatus(formState.isValid && formValues.utfall && formValues.bestemmelse);
  }, [formState?.isValid]);

  useEffect(() => {
    setValue("bestemmelse", "");
    setValue("brukers_situasjon", "");
  }, [formValues.utfall]);

  useEffect(() => {
    setValue("brukers_situasjon", "");
  }, [formValues.bestemmelse]);

  useEffect(() => {
    Api.Lovvalgsbestemmelser.hent({
      sakstype: fagsak.sakstype.kode,
      sakstema: fagsak.sakstema.kode,
      behandlingstema,
      land: soeknadsland,
    }).then((res) => setMuligeBestemmelser(res));
  }, [fagsak, behandlingstema]);

  const handleEndreBestemmelse = (nyBestemmelse: string) => {
    dispatch(medlemskapsperioderOperations.oppdaterBestemmelse(nyBestemmelse));
  };

  const handleBekreft = () => {
    dispatch(vilkarOperations.lagre());
    setTimeout(() => {
      dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiodeFraBestemmelse());
      bekreft();
    }, 1000);
  };

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingBestemmelse">
      <Nav.Typo.Undertittel className="undertittel">Bestemmelse og vurdering</Nav.Typo.Undertittel>

      {fagsak.sakstype.kode === MKV.Koder.sakstyper.EU_EOS && (
        <Nav.AlertStripeInfo>
          Du må vurdere om søknaden oppfyller inngangsvilkårene for EU/EØS-saker etter forordning 883/2004
        </Nav.AlertStripeInfo>
      )}

      <Nav.Fieldset legend="Hva er din vurdering av søknaden?">
        <Forms.Radio
          name="utfall"
          control={control}
          label="Jeg vil innvilge søknaden"
          value={INNVILGE}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="utfall"
          control={control}
          label="Jeg vil søke om unntak"
          value={UNNTAK}
          disabled={!redigerbart}
        />
        <Forms.Radio
          name="utfall"
          control={control}
          label="Jeg vil avslå søknaden"
          value={AVSLAG}
          disabled={!redigerbart}
        />
      </Nav.Fieldset>

      {formValues.utfall === INNVILGE && (
        <>
          <Nav.Fieldset className="select" legend="Velg bestemmelse">
            <Nav.Row>
              <Nav.Column xs="7">
                <Forms.Select
                  name="bestemmelse"
                  control={control}
                  label=""
                  disabled={!redigerbart}
                  onChange={(value) => handleEndreBestemmelse(value)}
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
              <Forms.Radio
                name="brukers_situasjon"
                control={control}
                label="Medfølgende familiemedlem"
                value={UNNTAK}
                disabled={!redigerbart}
              />
              <Forms.Radio
                name="brukers_situasjon"
                control={control}
                label="Student"
                value={UNNTAK}
                disabled={!redigerbart}
              />
              <Forms.Radio
                name="brukers_situasjon"
                control={control}
                label="Praktikant uten ordinær lønn"
                value={UNNTAK}
                disabled={!redigerbart}
              />
              <Forms.Radio
                name="brukers_situasjon"
                control={control}
                label="Andre som ikke er i ordinært arbeid"
                value={UNNTAK}
                disabled={!redigerbart}
              />
            </Nav.Fieldset>
          )}
        </>
      )}

      {formValues.utfall === UNNTAK && fagsak.sakstype.kode === MKV.Koder.sakstyper.TRYGDEAVTALE && (
        <Nav.Row>
          <Nav.Column xs="10" className="unntakTekst">
            <UnntakHjelpetekst />
          </Nav.Column>
        </Nav.Row>
      )}

      {formValues.utfall === UNNTAK && fagsak.sakstype.kode === MKV.Koder.sakstyper.EU_EOS && (
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
                <strong>
                  Når du får svar fra utenlandsk trygdemyndighet, må du endre valget på dette steget, og fatte vedtak.
                </strong>
              </p>
            </Nav.EtikettBase>
          </Nav.Column>
        </Nav.Row>
      )}

      {formValues.utfall === AVSLAG && <FlytFinnesIkke />}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: handleBekreft,
          disabled: !formState?.isValid || !redigerbart || formValues.utfall !== INNVILGE,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
