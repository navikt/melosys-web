import React, { useEffect, useState } from "react";
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
import * as Mui from "../ui";

import { fagsakSelectors } from "../../ducks/fagsaker";
import { behandlingerSelectors } from "../../ducks/behandlinger";

import { useFeatureToggle } from "../../featuretoggle";
import { BehandlingsstatusMedSvarfrist } from "../behandlingsstatus";
import KopierbarTekst from "../kopierbarTekst";
import OppsummeringVerdiPar from "./verdiPar/oppsummeringVerdiPar";
import EndreBehandlingModalGammel from "./endreBehandlingModalGammel";
import EndreBehandlingModal from "./endreBehandlingModal";

import "./oppsummering.css";

const { AVSLUTTET, IVERKSETTER_VEDTAK, MIDLERTIDIG_LOVVALGSBESLUTNING } = MKV.Koder.behandlinger.behandlingsstatus;
const behandlingsStatusMedBegrensetRettigheter = [AVSLUTTET, IVERKSETTER_VEDTAK, MIDLERTIDIG_LOVVALGSBESLUTNING];

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type OppsummeringProps = PropsFromRedux & {
  arbeidsland?: KTObject[];
  lovvalgsland?: KTObject;
  mottattDato?: string;
  lovvalgsperiodeFom: string;
  lovvalgsperiodeTom: string;
  mottatteOpplysningerPeriodeFom: string;
  mottatteOpplysningerPeriodeTom: string;
  className?: string;
};

const Oppsummering = ({
  oppsummering,
  fagsak,
  arbeidsland,
  lovvalgsland,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  mottatteOpplysningerPeriodeFom,
  mottatteOpplysningerPeriodeTom,
  className,
  behandlingID,
  ...props
}: OppsummeringProps) => {
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");
  const [skalViseEndreModal, setSkalViseEndreModal] = useState(false);
  const [mottaksdato, setMottaksdato] = useState<string | undefined>(props.mottattDato);

  const { saksnummer, sakstype, sakstema, registrertDato, hovedpartRolle } = fagsak;
  const {
    endretDato,
    endretAvNavn,
    svarFrist,
    behandlingstype,
    behandlingsfrist,
    behandlingstema,
    behandlingsstatus,
    behandlingsresultattype,
  } = oppsummering;

  const disableEndreKnapp = behandlingsStatusMedBegrensetRettigheter.includes(oppsummering.behandlingsstatus.kode);
  const erLitenSkjerm = Utils.mediaQuery.useMediaQuery({ maxWidth: 1440 });

  const erSed =
    behandleAlleSakerToggle === "enabled"
      ? MKVUtils.erBehandlingAvSed(behandlingstema?.kode, fagsak.sakstype?.kode)
      : behandlingstype?.kode === MKV.Koder.behandlinger.behandlingstyper.SED;
  const erTrygdeavtale = sakstype?.kode === MKV.Koder.sakstyper.TRYGDEAVTALE;
  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  useEffect(() => {
    if (behandleAlleSakerToggle === "enabled") {
      Api.Behandlinger.aarsak
        .hentMottaksdato(behandlingID)
        .then((response) => setMottaksdato(Utils.dato.formatterDatoTilNorsk(response.mottaksdato)));
    }
  }, [behandleAlleSakerToggle]);

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

  const renderTabell = () => {
    let col1;
    let col2;
    if (hovedpartErVirksomhet) {
      col1 = [["Beh. opprettet", Utils.dato.formatterDatoTilNorsk(registrertDato)]];
      col2 = [["Sist oppdatert", Utils.dato.formatterDatoTilNorsk(endretDato), `  ${endretAvNavn}`]];
    } else {
      const lovvalgsperiode = `${lovvalgsperiodeFom} - ${lovvalgsperiodeTom}`;
      const mottatteOpplysningerperiode = `${mottatteOpplysningerPeriodeFom} - ${mottatteOpplysningerPeriodeTom}`;

      col1 = [erSed ? ["Periode fra SED", lovvalgsperiode] : ["Søknadsperiode", mottatteOpplysningerperiode]];
      if (erTrygdeavtale) col1.push(["Lovvalgsperiode", lovvalgsperiode]);
      col1.push(["Land", erSed ? landStorBokstav(lovvalgsland) : landTilSetning(arbeidsland)]);

      col2 = [
        ["Søknad mottatt", mottaksdato || "-"],
        ["Beh. opprettet", Utils.dato.formatterDatoTilNorsk(registrertDato)],
        ["Sist oppdatert", Utils.dato.formatterDatoTilNorsk(endretDato), `  ${endretAvNavn}`],
      ];
    }

    return erLitenSkjerm ? tabellEnKolonne(col1.concat(col2)) : tabellToKolonner(col1, col2);
  };

  if (!fagsak?.sakstype) return <div />;

  return (
    <section aria-label="oppsummeringer" className="oppsummering panelSeksjon">
      {behandleAlleSakerToggle === "enabled" ? (
        <EndreBehandlingModal
          fagsak={fagsak}
          oppsummering={oppsummering}
          mottattDato={mottaksdato}
          skalViseModal={skalViseEndreModal}
          lukkModal={() => setSkalViseEndreModal(false)}
        />
      ) : (
        <EndreBehandlingModalGammel
          fagsak={fagsak}
          oppsummering={oppsummering}
          mottattDato={mottaksdato}
          skalViseModal={skalViseEndreModal}
          lukkModal={() => setSkalViseEndreModal(false)}
        />
      )}
      <Nav.Panel className="saksbehandling__soknad-sammendrag">
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

              <Nav.Panel className="saksinfo">
                <Nav.Row>
                  <Nav.Column xs="8">
                    {behandleAlleSakerToggle === "enabled" ? (
                      <Nav.Typo.Undertittel>
                        {KV.objektTilTerm(sakstype)} - {KV.objektTilTerm(sakstema)}
                      </Nav.Typo.Undertittel>
                    ) : (
                      <Nav.Typo.Undertittel>{KV.objektTilTerm(sakstype)}</Nav.Typo.Undertittel>
                    )}
                  </Nav.Column>
                  <Nav.Column xs="4">
                    <Mui.Knapp
                      disabled={disableEndreKnapp}
                      onClick={() => setSkalViseEndreModal(true)}
                      mini
                      className="hoyrestill endre-knapp"
                    >
                      <span>Endre</span>
                      {disableEndreKnapp ? <Ikoner.BlyantDisabled /> : <Ikoner.BlyantActive />}
                    </Mui.Knapp>
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
                    <OppsummeringVerdiPar nokkel="Frist" verdi={Utils.dato.formatterDatoTilNorsk(behandlingsfrist)} />
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
                      <Nav.EtikettBase type="info" className="behandlingsresultattype">
                        {behandlingsresultattype.term}
                      </Nav.EtikettBase>
                    )}
                  </Nav.Column>
                </Nav.Row>
              </Nav.Panel>

              {renderTabell()}
            </div>
          </Nav.Column>
        </Nav.Row>
      </Nav.Panel>
    </section>
  );
};

export default connector(Oppsummering);
