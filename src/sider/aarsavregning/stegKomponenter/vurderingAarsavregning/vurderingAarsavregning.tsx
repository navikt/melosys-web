import TrygdeavgiftsperioderTabell from "./trygdeavgiftsperioderTabell";
import * as Api from "../../../../services/api";
import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";
import "./vurderingAarsavregning.css";
import { useEffect, useState } from "react";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import { useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import * as Nav from "../../../../navFrontend";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import { TidligereGrunnlagsopplysningerFinnesIkke } from "./tidligereGrunnlagsopplysningerFinnesIkke";

export const VurderingAarsavregning = () => {
  const [valgtÅr, setValgtÅr] = useState<number | undefined>(undefined);

  const [feil, setFeil] = useState<undefined | string>(undefined);
  const [lagretTrygdeavgift, setLagretTrygdeavgift] = useState<AarsavregningResponse | undefined>(undefined);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);

  //TODO: Kan slettes, laget for å skjule radioknapper lengre nede fram til vi har funksjonalitet for å sette endelig trygdeavgift.
  const endeligTrygdeavgift = useState(undefined);

  useEffect(() => {
    fetchAvregningsData();
  }, []);

  const fetchAvregningsData = () => {
    return Api.Aarsavregning.hentAvregningsData(behandlingID)
      .then((response: AarsavregningResponse) => {
        setLagretTrygdeavgift(response);
        setValgtÅr(response.aar);
        return response;
      })
      .catch((error: any) => {
        if (error.response?.status === 404) {
          setLagretTrygdeavgift(undefined);
          setValgtÅr(undefined);
        }
      });
  };

  const håndterEndringAvÅr = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const år = parseInt(event.target.value, 10);
    setFeil(undefined);
    setValgtÅr(år);
  };

  useEffect(() => {
    if (!valgtÅr || lagretTrygdeavgift?.aar === valgtÅr) {
      return;
    }

    Api.Aarsavregning.lagAvregningsData(behandlingID, { aar: valgtÅr })
      .then((nyAvregningsData) => setLagretTrygdeavgift(nyAvregningsData))
      .catch((error: any) => {
        setFeil(error.body?.message || error);
      });
  }, [valgtÅr]);

  return (
    <div className="vurderingAarsavregning">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Årsavregning</Nav.Typo.Innholdstittel>
      <Nav.Fieldset className="select" legend={<LabelMedHjelpetekst bold label="År" placement="left-start" />}>
        <Nav.Row>
          <Nav.Column xs="4">
            <Nav.Select label="" id="aarVelger" value={valgtÅr ?? ""} onChange={håndterEndringAvÅr}>
              <option key="" value="" disabled>
                Velg...
              </option>
              {muligeAar.map((aar) => (
                <option key={aar} value={aar}>
                  {aar}
                </option>
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>
      {feil && <Nav.Alert variant="error">{feil}</Nav.Alert>}
      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger === null && lagretTrygdeavgift.aar === valgtÅr && (
        <TidligereGrunnlagsopplysningerFinnesIkke />
      )}
      {lagretTrygdeavgift?.tidligereGrunnlagsopplysninger && (
        <>
          <MedlemskapsPerioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.medlemskapsperioder}
          />
          <SkatteforholdsPerioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.trygdeavgiftsgrunnlag.skatteforholdsperioder}
          />
          <TrygdeavgiftsperioderTabell
            perioder={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.avgift.trygdeavgiftsperioder}
            avgift={lagretTrygdeavgift.tidligereGrunnlagsopplysninger.avgift}
          />
          ;
        </>
      )}
      {lagretTrygdeavgift && endeligTrygdeavgift && (
        <Nav.RadioGroup legend="Er det avvik i opplysningene fra skatt eller bruker?">
          <Nav.Radio value="10">Ja</Nav.Radio>
          <Nav.Radio value="20">Nei</Nav.Radio>
        </Nav.RadioGroup>
      )}
      <Nav.Button variant="primary" disabled={!redigerbart}>
        Bekreft og fortsett
      </Nav.Button>
    </div>
  );
};
