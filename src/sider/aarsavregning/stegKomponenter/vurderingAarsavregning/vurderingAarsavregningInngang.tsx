import * as Api from "../../../../services/api";
import "./vurderingAarsavregningInngang.css";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { AarsavregningResponse } from "../../../../services/modules/aarsavregning/aarsavregning";
import { useDispatch, useSelector } from "react-redux";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import * as Nav from "../../../../navFrontend";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import MKV from "../../../../melosyskodeverk";
import { OK } from "../../../../ducks/aarsavregning/types";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { NyBehandlingForTidligereAarsavregningMelding } from "../../../../felleskomponenter/alertmeldinger/alertmeldinger";

import { behandlingsresultatOperations } from "../../../../ducks/behandlingsresultat";
import { AarsavregningMedGrunnlag } from "./aarsavregningMedGrunnlag/aarsavregningMedGrunnlag";
import { AarsavregningUtenEllerDeltGrunnlag } from "./aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { FellesHandlersContext } from "../../../../contexts";
import { tilbakestillMedlemskapsperioder } from "../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

interface Props {
  bekreft: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

const { FASTSATT_TRYGDEAVGIFT, IKKE_FASTSATT } = MKV.Koder.behandlinger.behandlingsresultattyper;

const DELT_GRUNNLAG_HJELPETEKST = (
  <>
    <p>Du skal kun legge til informasjon fra Avgiftssystemet hvis:</p>
    <ul>
      <li>perioden er sammenhengende med perioden i Melosys</li>
      <li>vedtaket er fattet på samme vilkår som i Melosys</li>
      <li>vedtaket gjelder samme arbeidsforhold/-situasjon</li>
    </ul>
    <p>For mer veiledning se rutiner for årsavregning.</p>
  </>
);

export function VurderingAarsavregningInngang({ bekreft, oppdaterStatus, aktivtSteg }: Props) {
  const [valgtÅr, setValgtÅr] = useState<number | null>(null);
  const [initieltÅr, setInitieltÅr] = useState<number | null>(null);
  const [apiFeil, setApiFeil] = useState<string | null>(null);

  const [harGrunnlag, setHarGrunnlag] = useState<boolean | undefined>(undefined);
  const [harDeltGrunnlag, setHarDeltGrunnlag] = useState<boolean | undefined>(undefined);
  const [visDeltGrunnlagRadioGroup, setVisDeltGrunnlagRadioGroup] = useState(false);
  const [nyVurderingÅrsavregning, setNyVurderingÅrsavregning] = useState<boolean>(false);
  const [flereAktiveAarsavregninger, setFlereAktiveAarsavregninger] = useState<boolean>(false);
  const [aarsavregningID, setAarsavregningID] = useState<number | undefined>(undefined);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector) as any;
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);
  const dispatch = useDispatch();
  const { oppfriskOgLastInnSaksopplysningerForAarsavregning } = useContext(FellesHandlersContext) as any;

  const utledGrunnlagstypeForAarsavregning = (res: AarsavregningResponse) => {
    if (res.tidligereGrunnlagsopplysninger === null) {
      setHarGrunnlag(false);
    } else {
      setHarGrunnlag(true);
      if (res.aar === 2023 || res.aar === 2024) {
        setVisDeltGrunnlagRadioGroup(true);
        setHarDeltGrunnlag(res.harDeltGrunnlag);
      } else {
        setVisDeltGrunnlagRadioGroup(false);
        setHarDeltGrunnlag(false);
      }
    }
  };

  useEffect(() => {
    Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer).then((res) => {
      if (res?.find((aarsavregning) => aarsavregning.behandlingID === behandlingID)) {
        Api.Aarsavregning.hentAarsavregning(behandlingID).then((aarsavregning) => {
          setAarsavregningID(aarsavregning.aarsavregningID);
          setInitieltÅr(aarsavregning.aar);
          dispatch({ type: OK, data: aarsavregning });
          utledGrunnlagstypeForAarsavregning(aarsavregning);
        });
      }
    });
  }, []);

  useEffect(() => {
    if (redigerbart && valgtÅr) {
      setHarGrunnlag(undefined);
      Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer, FASTSATT_TRYGDEAVGIFT, valgtÅr).then((res) => {
        setNyVurderingÅrsavregning(res.length > 0);
      });
      Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer, IKKE_FASTSATT, valgtÅr).then((res) => {
        setFlereAktiveAarsavregninger(res.length > 0);
      });

      Api.Aarsavregning.lagAarsavregning(behandlingID, { aar: valgtÅr })
        .then(async (res) => {
          setAarsavregningID(res.aarsavregningID);
          utledGrunnlagstypeForAarsavregning(res);
          // Benyttes for innhenting av saksopplysninger ifm. årsavregningsbehandlinger
          dispatch({ type: OK, data: res });
          await oppfriskOgLastInnSaksopplysningerForAarsavregning();
          dispatch(behandlingsresultatOperations.hent(behandlingID));
        })
        .catch((error) => {
          setApiFeil(error.body.message);
        });
    }
  }, [valgtÅr]);

  const håndterEndringAvÅr = (event: ChangeEvent<HTMLSelectElement>) => {
    setApiFeil(null);
    setVisDeltGrunnlagRadioGroup(false);
    setHarGrunnlag(undefined);
    setHarDeltGrunnlag(undefined);

    const år = event.target.value ? parseInt(event.target.value, 10) : undefined;
    setValgtÅr(år || null);
  };

  const håndterDeltGrunnlag = async (value: boolean) => {
    if (harDeltGrunnlag && !value) {
      await Api.Aarsavregning.oppdaterAarsavregning(
        behandlingID,
        { avregning: { tidligereFakturertBeloepAvgiftssystem: 0 } },
        aarsavregningID,
      );
    }
    if (!value) {
      await Api.MedlemAvFolketrygden.Medlemskapsperioder.tilbakestillMedlemskapsperioder(behandlingID);
    }
    Api.Aarsavregning.oppdaterHarDeltGrunnlag(behandlingID, { harDeltGrunnlag: value }, aarsavregningID).then((res) =>
      setHarDeltGrunnlag(res.harDeltGrunnlag),
    );
  };

  return (
    <div className="vurderingAarsavregning">
      <Nav.Heading level="1" className="stegvelgertittel">
        Årsavregning
      </Nav.Heading>
      <Nav.Row>
        <Nav.Column xs="4">
          <Nav.Select
            label="År"
            id="aarVelger"
            value={(valgtÅr || initieltÅr)?.toString() ?? ""}
            onChange={håndterEndringAvÅr}
            readOnly={!redigerbart}
          >
            <option value="" disabled>
              Velg...
            </option>
            {muligeAar.map((aar) => (
              <option key={aar} value={aar.toString()}>
                {aar}
              </option>
            ))}
          </Nav.Select>
        </Nav.Column>
      </Nav.Row>
      {visDeltGrunnlagRadioGroup && (
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.RadioGroup
              onChange={håndterDeltGrunnlag}
              legend={
                <LabelMedHjelpetekst
                  label="Skal du legge til informasjon fra Avgiftssystemet til denne årsavregningen?"
                  hjelpetekst={DELT_GRUNNLAG_HJELPETEKST}
                />
              }
              value={harDeltGrunnlag}
              readOnly={!redigerbart || flereAktiveAarsavregninger}
            >
              <Nav.HStack gap="6">
                <Nav.Radio value>Ja</Nav.Radio>
                <Nav.Radio value={false}>Nei</Nav.Radio>
              </Nav.HStack>
            </Nav.RadioGroup>
          </Nav.Column>
        </Nav.Row>
      )}
      {nyVurderingÅrsavregning && (
        <Nav.Row>
          <NyBehandlingForTidligereAarsavregningMelding />
        </Nav.Row>
      )}
      {apiFeil && (
        <Nav.Row>
          <Nav.Alert variant="error" className="alertstripe_feilmelding">
            {apiFeil}
          </Nav.Alert>
        </Nav.Row>
      )}
      {harGrunnlag === true && harDeltGrunnlag === false && (
        <AarsavregningMedGrunnlag bekreft={bekreft} aktivtSteg={aktivtSteg} oppdaterStatus={oppdaterStatus} />
      )}
      {(harGrunnlag === false || harDeltGrunnlag) && (
        <AarsavregningUtenEllerDeltGrunnlag
          bekreft={bekreft}
          aktivtSteg={aktivtSteg}
          oppdaterStatus={oppdaterStatus}
          harDeltGrunnlag={Boolean(harDeltGrunnlag)}
        />
      )}
    </div>
  );
}
