import { Fragment } from "react";
import PT from "prop-types";

import MKV, { MKVUtils } from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Ikon from "../../../resources/images";
import * as Nav from "../../../navFrontend";
import { URL_BASENAME } from "../../../constants";

import EnkeltDato from "../../../felleskomponenter/enkeltDato";
import Soknadsland from "../../../felleskomponenter/soknadsland";
import { lagUrl } from "../../../url";
import { BehandlingsstatusMedSvarfrist } from "../../../felleskomponenter/behandlingsstatus";

import "./enkeltSak.css";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_FOLKETRYGDEN_MVP } from "../../../featuretoggle/toggleNavn";

/** Den enkelte sak-elementet som brukes i iterasjon i listen
 */
const EnkeltSak = (props) => {
  const folketrygdenToggleEnabled = useFeatureToggle(MELOSYS_FOLKETRYGDEN_MVP);

  const { landkoder } = props;
  const { behandlingOversikter, sakstype, saksnummer, sakstema } = props.sak;

  const { behandlingstype, behandlingsstatus, behandlingstema, svarFrist, behandlingID } = behandlingOversikter[0];
  const { soknadsperiode, land } =
    behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.soknadsperiode != null) ?? {};
  const { lovvalgsperiode } =
    behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.lovvalgsperiode != null) ?? {};
  const { medlemskapsperiode } =
    behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.medlemskapsperiode != null) ?? {};

  const link = lagUrl(
    saksnummer,
    behandlingID,
    sakstype.kode,
    sakstema.kode,
    behandlingstema.kode,
    behandlingstype.kode,
    folketrygdenToggleEnabled
  );

  const avsluttendePeriode = sakstype.kode === MKV.Koder.sakstyper.FTRL ? medlemskapsperiode : lovvalgsperiode;
  const periode = MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandlingsstatus?.kode)
    ? avsluttendePeriode
    : soknadsperiode;
  return (
    <div className="enkeltSak">
      <Skjema.CustomRadioPanelElement
        tittel={
          <div className="tittel">
            <span>
              {KV.objektTilTerm(sakstype)} - {KV.objektTilTerm(sakstema)}
            </span>
          </div>
        }
        hoyreSideTittel={
          <Nav.Lenker target="_blank" href={`${URL_BASENAME}${link}`} className="saklenke">
            {saksnummer}
            <Ikon.ExternalLink className="ikon" />
          </Nav.Lenker>
        }
        data={[
          { description: KV.objektTilTerm(behandlingstema) },
          { description: <div className="behandlingstype">{KV.objektTilTerm(behandlingstype)}</div> },
          {
            term: "Periode:",
            description: periode ? (
              <Fragment>
                <EnkeltDato dato={periode.fom} /> - <EnkeltDato dato={periode.tom} />
              </Fragment>
            ) : null,
          },
          {
            term: "Land:",
            description: <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />,
          },
          {
            description: (
              <div className="behandlingsstatusSvarfrist-wrapper">
                <BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist={svarFrist} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

EnkeltSak.propTypes = {
  sak: MPT.Fagsak.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default EnkeltSak;
