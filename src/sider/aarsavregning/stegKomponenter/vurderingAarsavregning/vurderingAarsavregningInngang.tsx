import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { OK } from "../../../../ducks/aarsavregning/types";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { NyBehandlingForTidligereAarsavregningMelding } from "../../../../felleskomponenter/alertmeldinger/alertmeldinger";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Api from "../../../../services/api";
import {
  AarsavregningListResponse,
  AarsavregningResponse,
} from "../../../../services/modules/aarsavregning/aarsavregning";
import "./vurderingAarsavregningInngang.css";

import { FellesHandlersContext } from "../../../../contexts";
import { behandlingsresultatOperations } from "../../../../ducks/behandlingsresultat";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { AarsavregningMedGrunnlag } from "./aarsavregningMedGrunnlag/aarsavregningMedGrunnlag";
import { AarsavregningUtenEllerDeltGrunnlag } from "./aarsavregningUtenEllerDeltGrunnlag/aarsavregningUtenEllerDeltGrunnlag";

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

const behandlingHarÅrsavregning = (årsavregningList: AarsavregningListResponse[], behandlingID: number) => {
  return årsavregningList.find((aarsavregning) => aarsavregning.behandlingID === behandlingID);
};

const årsavregningErNyVurdering = (årsavregningList: AarsavregningListResponse[], aar: number) => {
  return årsavregningList.find(
    (aarsavregning) => aarsavregning.aar === aar && aarsavregning.resultattype.kode === FASTSATT_TRYGDEAVGIFT,
  );
};

export function VurderingAarsavregningInngang({ bekreft, oppdaterStatus, aktivtSteg }: Props) {
  const [valgtÅr, setValgtÅr] = useState<number | undefined>(undefined);
  const [initieltÅr, setInitieltÅr] = useState<number | undefined>(undefined);
  const [lagÅrsavregningFeil, setLagÅrsavregningFeil] = useState<string | undefined>(undefined);

  const [harGrunnlag, setHarGrunnlag] = useState<boolean | undefined>(undefined);
  const [harDeltGrunnlag, setHarDeltGrunnlag] = useState<boolean | undefined>(undefined);
  const [visDeltGrunnlagRadioGroup, setVisDeltGrunnlagRadioGroup] = useState(false);
  const [nyVurderingÅrsavregning, setNyVurderingÅrsavregning] = useState<boolean>(false);
  const [flereAktiveÅrsavregninger, setFlereAktiveÅrsavregninger] = useState<boolean>(false);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector) as boolean;
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector) as any;
  const sisteMuligeÅr = new Date().getFullYear() - 1;
  const antallÅrTilbakeITid = 6;
  const muligeAar = Array.from({ length: antallÅrTilbakeITid }, (_, i) => sisteMuligeÅr - i);
  const dispatch = useDispatch();
  const { oppfriskOgLastInnSaksopplysningerForAarsavregning } = useContext(FellesHandlersContext) as any;

  const utledGrunnlagstypeForÅrsavregning = (res: AarsavregningResponse) => {
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
    Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer).then((årsavregningList) => {
      if (behandlingHarÅrsavregning(årsavregningList, behandlingID)) {
        Api.Aarsavregning.hentAarsavregning(behandlingID).then((årsavregning) => {
          setInitieltÅr(årsavregning.aar);
          dispatch({ type: OK, data: årsavregning });
          if (årsavregningErNyVurdering(årsavregningList, årsavregning.aar)) {
            setNyVurderingÅrsavregning(true);
          }
          utledGrunnlagstypeForÅrsavregning(årsavregning);
        });
      }
    });
  }, []);

  const håndterEndringAvÅr = (event: ChangeEvent<HTMLSelectElement>) => {
    setLagÅrsavregningFeil(undefined);
    setNyVurderingÅrsavregning(false);
    setFlereAktiveÅrsavregninger(false);
    setVisDeltGrunnlagRadioGroup(false);
    setHarGrunnlag(undefined);
    setHarDeltGrunnlag(undefined);

    const år = Number(event.target.value);
    setValgtÅr(år);

    Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer, FASTSATT_TRYGDEAVGIFT, år).then(
      (fastsattÅrsavregningList) => {
        setNyVurderingÅrsavregning(fastsattÅrsavregningList.length > 0);
      },
    );

    Api.Aarsavregning.hentFiltrertAarsavregningList(saksnummer, IKKE_FASTSATT, år).then((res) => {
      if (res.length === 0) {
        Api.Aarsavregning.lagAarsavregning(behandlingID, { aar: år })
          .then((årsavregning) => {
            utledGrunnlagstypeForÅrsavregning(årsavregning);
            dispatch({ type: OK, data: årsavregning });
            oppfriskOgLastInnSaksopplysningerForAarsavregning().then(() => {
              dispatch(behandlingsresultatOperations.hent(behandlingID));
            });
          })
          .catch((error: any) => {
            setLagÅrsavregningFeil(error.body.message);
          });
      } else {
        setFlereAktiveÅrsavregninger(true);
      }
    });
  };

  const håndterDeltGrunnlag = async (value: boolean) => {
    Api.Aarsavregning.oppdaterHarDeltGrunnlag(behandlingID, { harDeltGrunnlag: value }).then((res) =>
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
            value={valgtÅr || initieltÅr || ""}
            onChange={håndterEndringAvÅr}
            readOnly={!redigerbart}
          >
            <option value="" disabled>
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

      {flereAktiveÅrsavregninger && (
        <Nav.Alert variant="error">
          <Nav.BodyLong size="small">Året {valgtÅr} har allerede en aktiv årsavregning.</Nav.BodyLong>
        </Nav.Alert>
      )}

      {lagÅrsavregningFeil && (
        <Nav.Alert variant="error" className="alertstripe_feilmelding">
          {lagÅrsavregningFeil}
        </Nav.Alert>
      )}

      {!lagÅrsavregningFeil && !flereAktiveÅrsavregninger && (
        <>
          {nyVurderingÅrsavregning && <NyBehandlingForTidligereAarsavregningMelding />}

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
                  readOnly={!redigerbart || flereAktiveÅrsavregninger}
                >
                  <Nav.HStack gap="6">
                    <Nav.Radio value>Ja</Nav.Radio>
                    <Nav.Radio value={false}>Nei</Nav.Radio>
                  </Nav.HStack>
                </Nav.RadioGroup>
              </Nav.Column>
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
        </>
      )}
    </div>
  );
}
