import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Api from "../../../../services/api";
import * as Etiketter from "../../etiketter";
import * as Ikoner from "../../../../resources/images";
import * as Mui from "../../../ui";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";

import { behandlingerOperations, behandlingerSelectors } from "../../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";

import ExpandableList from "../../../expandablelist";
import KopierbarTekst from "../../../kopierbarTekst";

import "./familiemedlemmer.css";

const { BARN, EKTE, REPA } = KV.Koder.Relasjonsrolle;

interface FamiliemedlemmerEnkeltProps {
  familiemedlem: Api.Familiemedlem;
  erBarn: boolean;
}

export function FamiliemedlemmerEnkelt({ familiemedlem, erBarn }: FamiliemedlemmerEnkeltProps) {
  const { sammensattNavn, fnr, relasjonstype, alder, borMedBruker, sivilstandGyldighetsperiodeFom, fnrAnnenForelder } =
    familiemedlem;

  const renderBarnEtikett = () =>
    alder !== null && alder < 18 ? <Etiketter.Under18Aar className="ikon__under18Aar" /> : null;

  return (
    <div className="familiemedlemmer__enkelt">
      <Nav.Row>
        <Nav.Column xs="2">{sammensattNavn}</Nav.Column>
        <Nav.Column xs="3">
          <KopierbarTekst hovertekst="Kopier fødselsnummer">{fnr}</KopierbarTekst>
        </Nav.Column>
        <Nav.Column xs="2">
          {erBarn
            ? Utils.streng.boolTilNorsk(borMedBruker)
            : Utils.dato.formatterDatoTilNorsk(sivilstandGyldighetsperiodeFom)}
        </Nav.Column>
        <Nav.Column xs="2">{erBarn ? fnrAnnenForelder : Utils.streng.boolTilNorsk(borMedBruker)}</Nav.Column>
        <Nav.Column xs="3">{erBarn ? renderBarnEtikett() : relasjonstype.term}</Nav.Column>
      </Nav.Row>
    </div>
  );
}

interface FamiliemedlemmerGruppeProps {
  familiemedlemmer: Api.Familiemedlem[];
  ingenFamiliemedlemmerTekst: string;
  overskrift: string;
  kolonneHeadinger: string[];
  erBarn: boolean;
}

export function FamiliemedlemmerGruppe(props: FamiliemedlemmerGruppeProps) {
  const { familiemedlemmer, ingenFamiliemedlemmerTekst, overskrift = "", kolonneHeadinger, erBarn } = props;

  return (
    <div>
      <Nav.Typo.Undertittel className="familiemedlemmer__gruppeoverskrift">{overskrift}</Nav.Typo.Undertittel>
      {familiemedlemmer.length === 0 && ingenFamiliemedlemmerTekst}
      {familiemedlemmer.length !== 0 && (
        <Nav.Row className="header">
          <Nav.Column xs="2">{kolonneHeadinger[0]}</Nav.Column>
          <Nav.Column xs="3">{kolonneHeadinger[1]}</Nav.Column>
          <Nav.Column xs="2">{kolonneHeadinger[2]}</Nav.Column>
          <Nav.Column xs="2">{kolonneHeadinger[3]}</Nav.Column>
          <Nav.Column xs="3">{kolonneHeadinger[4]}</Nav.Column>
        </Nav.Row>
      )}
      <section>
        <ExpandableList
          elements={familiemedlemmer}
          renderElement={(familiemedlem) => <FamiliemedlemmerEnkelt familiemedlem={familiemedlem} erBarn={erBarn} />}
          idFromElement={(familiemedlem) => familiemedlem.fnr}
          amountOfItemsCollapsed={familiemedlemmer.length}
          btnTextCollapsed="Vis flere"
          btnTextExpanded="Vis færre"
          chevron
          dividers
        />
      </section>
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  familiemedlemmer: behandlingerSelectors.FamiliemedlemmerSelector(state) as Api.Familiemedlem[],
  redigerbart: redigerbartSelectors.PanelerRedigerbartSelector(state),
});
const mapDispatchToProps = (dispatch: any) => ({
  oppdaterBehandling: () => dispatch(behandlingerOperations.oppdaterBehandling()),
});
const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type FamiliemedlemmerProps = PropsFromRedux & {
  setMenypanelFeilmelding: (feilmelding: string) => void;
};

export const Familiemedlemmer = ({
  behandlingID,
  familiemedlemmer,
  oppdaterBehandling,
  setMenypanelFeilmelding,
}: FamiliemedlemmerProps) => {
  const [harOppfrisket, setHarOppfrisket] = useState(false);

  const oppfrisk = async () => {
    try {
      await Api.Saksopplysninger.oppfrisk(behandlingID, { medFamilierelasjoner: true });
      oppdaterBehandling();
      setHarOppfrisket(true);
    } catch (e) {
      if (e.status >= 500) setMenypanelFeilmelding("Ikke svar fra TPS. Prøv igjen senere.");
      else if (e.status >= 400) setMenypanelFeilmelding(e.body.message);
    }
  };

  const barn = familiemedlemmer.filter((familiemedlem) => familiemedlem.relasjonstype.kode === BARN);

  const hentRelasjonstypeTerm = (relasjonstype: KTObject) => {
    if (relasjonstype.kode === EKTE) return "Ektefelle";
    if (relasjonstype.kode === REPA) return "Partner";

    return relasjonstype.term;
  };
  const mapEkteFellerOgPartnere = (familiemedlem: Api.Familiemedlem) => ({
    ...familiemedlem,
    relasjonstype: { ...familiemedlem.relasjonstype, term: hentRelasjonstypeTerm(familiemedlem.relasjonstype) },
  });
  const ektefellerOgPartnere = familiemedlemmer
    .filter((familiemedlem) => [EKTE, REPA].includes(familiemedlem.relasjonstype.kode))
    .map(mapEkteFellerOgPartnere);

  return (
    <div className="familiemedlemmer">
      <Etiketter.FraRegister style={{ float: "right" }} />
      {familiemedlemmer.length === 0 && (
        <div className="familiemedlemmer__gruppeoverskrift">
          <Mui.Knappelenke ikon={Ikoner.HentOpplysninger} onClick={oppfrisk}>
            Hent opplysninger
          </Mui.Knappelenke>
        </div>
      )}
      {harOppfrisket && familiemedlemmer.length === 0 && (
        <div style={{ paddingLeft: "16px", fontStyle: "italic" }}>Fant ingen familieforhold</div>
      )}
      {familiemedlemmer.length !== 0 && (
        <FamiliemedlemmerGruppe
          familiemedlemmer={barn}
          ingenFamiliemedlemmerTekst="Fant ingen barn"
          overskrift="Barn"
          kolonneHeadinger={["Navn", "F.nr./d-nr.", "Bor med bruker", "F.nr annen forelder", ""]}
          erBarn
        />
      )}
      {familiemedlemmer.length !== 0 && (
        <FamiliemedlemmerGruppe
          familiemedlemmer={ektefellerOgPartnere}
          ingenFamiliemedlemmerTekst="Fant ingen ektefelle/partner"
          overskrift="Ektefelle/partner"
          kolonneHeadinger={["Navn", "F.nr./d-nr.", "Fra og med", "Bor med bruker", "Relasjon"]}
          erBarn={false}
        />
      )}
    </div>
  );
};

export default connector(Familiemedlemmer);
