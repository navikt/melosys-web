/* eslint-disable */
import { ChangeEventHandler, Fragment, useCallback, useContext, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Utils from "../../../../utils";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { vilkarOperations, vilkarSelectors } from "../../../../ducks/vilkar";
import { lagVilkarbegrunnelse, lagVilkaar } from "../../../../felleskomponenter/stegvelger";
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { finnTermFraListe, termFraNestedKTObject } from "../../../../kodeverk";

import { BOOLSK_STRING } from "../../../../constants";
import "./vurderingBestemmelse.css";
import { RedigerbartSelector } from "../../../../ducks/redigerbart/selectors";
import { SaksbehandlingFTRLContext, VilkarOgBegrunnelser } from "../saksbehandlingFTRLContext";
import { FellesHandlersContext } from "../../../../contexts";
import { VilkaarSelector } from "../../../../ducks/folketrygdenkodeverk/selectors";

const komponentState = (state: RootState) => ({
  vilkarListe: vilkarSelectors.VilkarSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  bestemmelse: medlemskapsperioderSelectors.BestemmelseSelector(state),
  vilkaarKodeverk: folketrygdenkodeverkSelectors.VilkaarSelector(state),
  begrunnelserKodeverk: folketrygdenkodeverkSelectors.BegrunnelserSelector(state),
});

const komponentDispatch = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterBestemmelse: (bestemmelse: string) =>
    dispatch(medlemskapsperioderOperations.oppdaterBestemmelse(bestemmelse)),
  opprettMedlemskapsperiodeFraBestemmelse: () =>
    dispatch(medlemskapsperioderOperations.opprettMedlemskapsperiodeFraBestemmelse()),
  oppdaterVilkaar: (skjema: any) => dispatch(vilkarOperations.oppdaterState(skjema)),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  hentVilkaar: (behandlingsId: string) => dispatch(vilkarOperations.hent(behandlingsId)),
});
interface Props {
  bekreft: () => void;
  tilbake: () => void;
}

export const VurderingBestemmelse = ({ bekreft, tilbake }: Props) => {
  const redigerbart = useSelector((state: RootState) => RedigerbartSelector(state));
  const { bestemmelseVilkar } = useContext(SaksbehandlingFTRLContext);
  const dispatch = useDispatch();
  const { behandlingID, vilkarListe, bestemmelse, vilkaarKodeverk, begrunnelserKodeverk } = useSelector(
    (state: RootState) => komponentState(state)
  );
  const { hentVilkaar, oppdaterVilkaar, oppdaterBestemmelse, opprettMedlemskapsperiodeFraBestemmelse, lagreVilkar } =
    komponentDispatch(dispatch);
  const [valgtBestemmelse, setValgtBestemmelse] = useState("");
  const [valgteBegrunnelser, setValgteBegrunnelser] = useState(new Map());
  const [valgteVilkar, setValgteVilkar] = useState(new Map());
  const [erAlleValgGjort, setErAlleValgGjort] = useState(false);
  const SAERLIG_GRUNN = "SAERLIG_GRUNN";

  const hjelpetekster = new Map([
    [
      SAERLIG_GRUNN,
      "Nedtrekksmenyen inneholder grupper av personer som kan tas opp etter en rimelighetsvurdering i tilfeller der en søknad om medlemskap vurderes etter § 2-8 andre ledd.",
    ],
    [
      MKV.Koder.vilkaar.FTRL_2_8_FORUTGÅENDE_TRYGDETID,
      "Husk at perioder med trygdetid fra andre EØS-land sidestilles med norsk trygdetid.",
    ],
  ]);

  const handleEndreBestemmelse = async (nyBestemmelse: string) => {
    setValgtBestemmelse(nyBestemmelse);
    await oppdaterBestemmelse(nyBestemmelse);
  };

  useEffect(() => {
    hentVilkaar(behandlingID);
  }, [behandlingID]);

  const debouncedLagreVilkar = useCallback(Utils._debounce(lagreVilkar, 1000), []);
  useEffect(() => {
    handleEndreBestemmelse(bestemmelse);
    vilkarListe.forEach((vilkar: any) => {
      valgteVilkar.set(vilkar.vilkaar, vilkar.oppfylt ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN);
      if (vilkar.begrunnelseKoder && vilkar.begrunnelseKoder.length === 1) {
        valgteBegrunnelser.set(vilkar.vilkaar, vilkar.begrunnelseKoder[0]);
      }
    });
    setValgteVilkar(new Map(valgteVilkar));
    setValgteBegrunnelser(new Map(valgteBegrunnelser));
    return () => debouncedLagreVilkar.cancel();
  }, [vilkarListe]);

  useEffect(() => {
    const valgteBestemmelseVilkar = bestemmelseVilkar.find((element) => element.bestemmelse === valgtBestemmelse);
    const alleVilkarHarSvarJaOgvalgtBegrunnelse =
      valgteBestemmelseVilkar &&
      valgteBestemmelseVilkar.vilkårOgBegrunnelser.filter(
        (vilkar) =>
          valgteVilkar.get(vilkar.vilkaar) === BOOLSK_STRING.SANN &&
          (vilkar.muligeBegrunnelser.length > 0 ? valgteBegrunnelser.get(vilkar.vilkaar) : true)
      ).length === valgteBestemmelseVilkar.vilkårOgBegrunnelser.length;

    setErAlleValgGjort(!!alleVilkarHarSvarJaOgvalgtBegrunnelse);
    if (alleVilkarHarSvarJaOgvalgtBegrunnelse && redigerbart) {
      debouncedLagreVilkar();
    }
  }, [valgteBegrunnelser, valgtBestemmelse, valgteVilkar]);

  const handleBekreft = () => {
    opprettMedlemskapsperiodeFraBestemmelse();
    bekreft();
  };

  const handleEndreVilkar: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValgteVilkar(new Map(valgteVilkar.set(event.target.name, event.target.value)));
    oppdaterVilkaar({
      ...{ ...valgteVilkar },
      [event.target.name]: event.target.value === BOOLSK_STRING.USANN ? false : true,
    });
    if (event.target.value === BOOLSK_STRING.USANN && valgteBegrunnelser.get(event.target.name)) {
      valgteBegrunnelser.delete(event.target.name);
      setValgteBegrunnelser(new Map(valgteBegrunnelser));
      oppdaterVilkaar({ ...{ ...valgteBegrunnelser }, [event.target.name]: [] });
    }
  };

  const handleEndreBegrunnelse: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setValgteBegrunnelser(new Map(valgteBegrunnelser.set(event.target.name, event.target.value)));
    oppdaterVilkaar({
      ...{ ...valgteBegrunnelser },
      [event.target.name]: [event.target.value === BOOLSK_STRING.USANN ? false : true],
    });
  };

  const Alert = () => (
    <Nav.AlertStripe type="feil" className="alerstripe">
      Søknaden kan foreløpig ikke behandles i Melosys. Avslutt saken som bortfalt.
    </Nav.AlertStripe>
  );

  const Vilkaar = ({ vilkaar, muligeBegrunnelser }: VilkarOgBegrunnelser) => {
    const hjelpetekstForVilkaar = hjelpetekster.get(vilkaar);
    const valgteVilkarForVilkaar = valgteVilkar.get(`${vilkaar}`);
    return (
      <Fragment>
        <Nav.Fieldset
          className="radio"
          legend={
            <LabelMedHjelpetekst
              label={finnTermFraListe(vilkaarKodeverk, vilkaar)}
              hjelpetekst={hjelpetekstForVilkaar}
            />
          }
        >
          <Nav.Row>
            <Nav.Column xs="1">
              <Nav.Radio
                label="Ja"
                name={vilkaar}
                onChange={handleEndreVilkar}
                checked={valgteVilkarForVilkaar === BOOLSK_STRING.SANN}
                value={BOOLSK_STRING.SANN}
                key={BOOLSK_STRING.SANN}
                disabled={!redigerbart}
              />
            </Nav.Column>
            <Nav.Column xs="1">
              <Nav.Radio
                label="Nei"
                name={vilkaar}
                onChange={handleEndreVilkar}
                checked={valgteVilkarForVilkaar === BOOLSK_STRING.USANN}
                value={BOOLSK_STRING.USANN}
                key={BOOLSK_STRING.USANN}
                disabled={!redigerbart}
              />
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
        {valgteVilkarForVilkaar === BOOLSK_STRING.USANN && <Alert />}
        {muligeBegrunnelser.length > 0 && valgteVilkarForVilkaar === BOOLSK_STRING.SANN && (
          <Nav.Fieldset
            className="select"
            legend={<LabelMedHjelpetekst label="Velg særlig grunn" hjelpetekst={hjelpetekster.get(SAERLIG_GRUNN)} />}
          >
            <Nav.Row>
              <Nav.Column xs="7">
                <Nav.Select
                  label=""
                  bredde="fullbredde"
                  onChange={handleEndreBegrunnelse}
                  name={vilkaar}
                  value={valgteBegrunnelser.get(`${vilkaar}`)}
                  disabled={!redigerbart}
                >
                  <option key="" value="" disabled={!!valgteBegrunnelser.get(`${vilkaar}`)}>
                    Velg
                  </option>
                  {muligeBegrunnelser.map((begrunnelse) => (
                    <option key={begrunnelse} value={begrunnelse}>
                      {termFraNestedKTObject(begrunnelserKodeverk, begrunnelse)}
                    </option>
                  ))}
                </Nav.Select>
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
        )}
      </Fragment>
    );
  };

  return (
    <div className="vurderingBestemmelse">
      <Nav.Typo.Undertittel className="undertittel">
        Hvilken bestemmelse skal søknaden vurderes etter?
      </Nav.Typo.Undertittel>

      <Nav.Fieldset className="select" legend="Velg bestemmelse">
        <Nav.Row>
          <Nav.Column xs="7">
            <Nav.Select
              label=""
              disabled={!redigerbart}
              // eslint-disable-next-line no-return-await
              onChange={async (event) => await handleEndreBestemmelse(event.target.value)}
              value={valgtBestemmelse}
            >
              <option disabled={!!valgtBestemmelse} value="" key="">
                Velg
              </option>
              {bestemmelseVilkar.map((bestemmelseMedVilkar) => (
                <option key={bestemmelseMedVilkar.bestemmelse} value={bestemmelseMedVilkar.bestemmelse}>
                  {finnTermFraListe(MKV.KTObjects.folketrygdloven_kap2_bestemmelser, bestemmelseMedVilkar.bestemmelse)}
                </option>
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      {bestemmelseVilkar
        .filter((bestemmelseMedVilkar) => bestemmelseMedVilkar.bestemmelse === valgtBestemmelse)
        .map((bestemmelseMedVilkar) =>
          bestemmelseMedVilkar.vilkårOgBegrunnelser.map((vilkaarMedBegrunnelser) => (
            <Vilkaar
              key={vilkaarMedBegrunnelser.vilkaar}
              vilkaar={vilkaarMedBegrunnelser.vilkaar}
              muligeBegrunnelser={vilkaarMedBegrunnelser.muligeBegrunnelser}
            />
          ))
        )}

      <Mui.StegKnapper
        bekreftKnappProps={{ onClick: handleBekreft, disabled: !erAlleValgGjort || !redigerbart }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
