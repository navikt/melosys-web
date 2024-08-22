import { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import classNames from "classnames";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV, { MKVUtils } from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as Nav from "../../navFrontend";
import * as Api from "../../services/api";
import * as Ikoner from "../../resources/images";
import * as Utils from "../../utils";

import { fagsakSelectors } from "../../ducks/fagsaker";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { redigerbartSelectors } from "../../ducks/redigerbart";

import { BehandlingsstatusMedSvarfrist } from "../behandlingsstatus";
import { harIkkeYrkesaktivFlyt, harUnntaksregistreringFlyt, skalViseIngenFlyt } from "../../url";
import KopierbarTekst from "../kopierbarTekst";

import OppsummeringVerdiPar from "./verdiPar/oppsummeringVerdiPar";
import EndreBehandlingModal from "./endreBehandlingModal";
import "./oppsummering.css";
import { useAsyncCallbackState } from "../../hooks";
import { useFeatureToggle } from "../../featuretoggle";
import { MELOSYS_ARBEID_KUN_NORGE } from "../../featuretoggle/toggleNavn";

const { AVSLUTTET, IVERKSETTER_VEDTAK, MIDLERTIDIG_LOVVALGSBESLUTNING } = MKV.Koder.behandlinger.behandlingsstatus;
const behandlingsStatusMedBegrensetRettigheter = [AVSLUTTET, IVERKSETTER_VEDTAK, MIDLERTIDIG_LOVVALGSBESLUTNING];

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type OppsummeringProps = PropsFromRedux & {
  arbeidsland?: KTObject[];
  avsenderland?: KTObject;
  lovvalgsland?: KTObject;
  lovvalgsperiodeFom?: string;
  lovvalgsperiodeTom?: string;
  medlemskapsperiodeFom?: string;
  medlemskapsperiodeTom?: string;
  mottatteOpplysningerPeriodeFom: string;
  mottatteOpplysningerPeriodeTom: string;
  className?: string;
};

const Oppsummering = ({
  oppsummering,
  fagsak,
  arbeidsland,
  avsenderland,
  lovvalgsland,
  lovvalgsperiodeFom = "",
  lovvalgsperiodeTom = "",
  medlemskapsperiodeFom = "",
  medlemskapsperiodeTom = "",
  mottatteOpplysningerPeriodeFom,
  mottatteOpplysningerPeriodeTom,
  className,
  redigerbart,
  behandlingID,
}: OppsummeringProps) => {
  const [{ mottaksdato }] = useAsyncCallbackState(() => Api.Behandlinger.aarsak.hentMottaksdato(behandlingID), {}, [
    behandlingID,
  ]);
  const [skalViseEndreModal, setSkalViseEndreModal] = useState(false);
  const erArbeidKunNorgeToggleEnabled = useFeatureToggle(MELOSYS_ARBEID_KUN_NORGE);

  if (Utils._isEmpty(fagsak) || Utils._isEmpty(oppsummering)) return <div />;

  const { saksnummer, sakstype, sakstema, hovedpartRolle, registrertDato: sakRegistrertDato } = fagsak;
  const {
    endretDato,
    endretAvNavn,
    svarFrist,
    behandlingstype,
    behandlingsfrist,
    behandlingstema,
    behandlingsstatus,
    behandlingsresultattype,
    registrertDato: behRegistrertDato,
  } = oppsummering;

  const disableEndreKnapp = behandlingsStatusMedBegrensetRettigheter.includes(behandlingsstatus.kode) || !redigerbart;
  const erLitenSkjerm = Utils.mediaQuery.useMediaQuery({ maxWidth: 1440 });

  const erSed = MKVUtils.erBehandlingAvSed(sakstype.kode, behandlingstema.kode);
  const erTrygdeavtale = sakstype.kode === MKV.Koder.sakstyper.TRYGDEAVTALE;
  const erFTRL = sakstype.kode === MKV.Koder.sakstyper.FTRL;
  const erUnntaksregistrering = harUnntaksregistreringFlyt(sakstype.kode, sakstema.kode, behandlingstema.kode);
  const erIkkeYrkesaktivFlyt = harIkkeYrkesaktivFlyt(sakstype.kode, behandlingstema.kode);
  const erIngenFlyt = skalViseIngenFlyt(
    sakstype.kode,
    sakstema.kode,
    behandlingstema.kode,
    behandlingstype.kode,
    erArbeidKunNorgeToggleEnabled
  );
  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  const landStorBokstav = (land?: KTObject) =>
    land?.term ? Utils.streng.storeForbokstaverForLand(land.term) : "Ukjent";

  const landTilSetning = (land?: KTObject[]) =>
    land && land.length > 0
      ? Utils.streng.arrayTilKonjunksjon(
          land.map((enkeltLand) => Utils.streng.storeForbokstaverForLand(enkeltLand.term || ""))
        )
      : "Ukjent";

  const tabellEnKolonne = (data: string[][]) => {
    const rows: JSX.Element[] = [];
    data.forEach((row) =>
      rows.push(
        <Nav.Row className="datarad" key={`datarad-${row[0]}`}>
          <OppsummeringVerdiPar nokkel={row[0]} verdi={row[1]} ekstrafelt={<span className="italic">{row[2]}</span>} />
        </Nav.Row>
      )
    );
    return rows;
  };

  const tabellToKolonner = (col1: string[][], col2: string[][]) => {
    const rows = [];
    for (let i = 0; i < Math.max(col1.length, col2.length); i += 1) {
      rows.push(
        <Nav.Row className="datarad" key={`datarad-${i}`}>
          <Nav.Column lg="6">
            {i < col1.length && (
              <OppsummeringVerdiPar
                nokkel={col1[i][0]}
                verdi={col1[i][1]}
                ekstrafelt={<span className="kursiv">{col1[i][2]}</span>}
              />
            )}
          </Nav.Column>
          <Nav.Column lg="6">
            {i < col2.length && (
              <OppsummeringVerdiPar
                nokkel={col2[i][0]}
                verdi={col2[i][1]}
                ekstrafelt={<span className="kursiv">{col2[i][2]}</span>}
              />
            )}
          </Nav.Column>
        </Nav.Row>
      );
    }
    return rows;
  };

  const lagCol1 = () => {
    const lovvalgsperiode = `${lovvalgsperiodeFom} - ${lovvalgsperiodeTom}`;
    const mottatteOpplysningerperiode = `${mottatteOpplysningerPeriodeFom} - ${mottatteOpplysningerPeriodeTom}`;

    if (erUnntaksregistrering) {
      return erTrygdeavtale
        ? [
            ["Lovvalgsperiode", lovvalgsperiode],
            ["Land", landStorBokstav(avsenderland)],
          ]
        : [
            ["Periode fra attest", mottatteOpplysningerperiode],
            ["Lovvalgsland fra attest", landStorBokstav(lovvalgsland)],
          ];
    }

    if (erSed) {
      return [
        ["Periode fra SED", lovvalgsperiode],
        ["Land", landStorBokstav(lovvalgsland)],
      ];
    }

    const col1 = [["Søknadsperiode", mottatteOpplysningerperiode]];
    if (erTrygdeavtale || erIkkeYrkesaktivFlyt) {
      col1.push(["Lovvalgsperiode", lovvalgsperiode]);
    }
    if (erFTRL && !erIngenFlyt) {
      col1.push(["Medlemskapsperiode", `${medlemskapsperiodeFom} - ${medlemskapsperiodeTom}`]);
    }
    col1.push(["Land", landTilSetning(arbeidsland)]);
    return col1;
  };
  const renderTabell = () => {
    let col1;
    let col2;
    if (hovedpartErVirksomhet) {
      col1 = [
        ["Sak opprettet", Utils.dato.formatterDatoTilNorsk(sakRegistrertDato)],
        ["Beh. opprettet", Utils.dato.formatterDatoTilNorsk(behRegistrertDato)],
      ];
      col2 = [["Sist oppdatert", Utils.dato.formatterDatoTilNorsk(endretDato), `  ${endretAvNavn}`]];
    } else {
      col1 = lagCol1();
      col2 = [
        ["Frist", Utils.dato.formatterDatoTilNorsk(behandlingsfrist) || "-"],
        ["Sak opprettet", Utils.dato.formatterDatoTilNorsk(sakRegistrertDato)],
        ["Beh. opprettet", Utils.dato.formatterDatoTilNorsk(behRegistrertDato)],
        ["Sist oppdatert", Utils.dato.formatterDatoTilNorsk(endretDato), `  ${endretAvNavn}`],
      ];
    }

    return erLitenSkjerm ? tabellEnKolonne(col1.concat(col2)) : tabellToKolonner(col1, col2);
  };

  return (
    <section aria-label="oppsummeringer" className="oppsummering panelSeksjon">
      <EndreBehandlingModal
        fagsak={fagsak}
        oppsummering={oppsummering}
        mottattDato={mottaksdato}
        skalViseModal={skalViseEndreModal}
        lukkModal={() => setSkalViseEndreModal(false)}
      />
      <div className="panel">
        <Nav.Row>
          <Nav.Column xs="12">
            <div aria-label="behandlingsinformasjon" className={classNames(className, "oppsummering")}>
              <Nav.Row className="datarad">
                <dl className="oppsummering_verdi_par">
                  <dt className="nokkel">Saksnummer:</dt>
                  <dd>
                    <KopierbarTekst className="kopier-saksnummer" hovertekst="Kopier saksnummer">
                      {saksnummer}
                    </KopierbarTekst>
                  </dd>
                </dl>
              </Nav.Row>

              <div className="panel saksinfo">
                <Nav.Row>
                  <Nav.Column xs="8">
                    <Nav.Typo.Undertittel>
                      {KV.objektTilTerm(sakstype)} - {KV.objektTilTerm(sakstema)}
                    </Nav.Typo.Undertittel>
                  </Nav.Column>
                  <Nav.Column xs="4">
                    <div className="knapp__container">
                      <Nav.Button
                        variant="secondary"
                        disabled={disableEndreKnapp}
                        onClick={() => setSkalViseEndreModal(true)}
                        icon={<Ikoner.BlyantActive />}
                      >
                        Endre
                      </Nav.Button>
                    </div>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12">
                    <span className="bold">{KV.objektTilTerm(behandlingstema)}</span>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12">
                    <span className="bold">{KV.objektTilTerm(behandlingstype)}</span>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12">
                    <OppsummeringVerdiPar
                      nokkel="Mottaksdato"
                      verdi={Utils.dato.formatterDatoTilNorsk(mottaksdato, false, mottaksdato || "-")}
                    />
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12" className="status-resultattype-wrapper">
                    <BehandlingsstatusMedSvarfrist
                      behandlingsstatus={behandlingsstatus}
                      svarFrist={svarFrist}
                      className="behandlingsstatus"
                    />
                    {MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandlingsstatus.kode) && (
                      <Nav.Tag variant="info" className="behandlingsresultattype">
                        {behandlingsresultattype.term}
                      </Nav.Tag>
                    )}
                  </Nav.Column>
                </Nav.Row>
              </div>

              {renderTabell()}
            </div>
          </Nav.Column>
        </Nav.Row>
      </div>
    </section>
  );
};

export default connector(Oppsummering);
