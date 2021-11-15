import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";
import * as Etiketter from "../../../etiketter";

import { useHentFamiliemedlemmerQuery } from "./hentFamiliemedlemmer.generated";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import FamiliemedlemGruppe from "./familiemedlemGruppe";
import { Familierelasjonsrolle, Familiemedlem } from "../../../../../graphql";
import Ident from "./ident";
import Informasjonsmodal from "./informasjonsmodal";

import "./familiemedlemmerFraPDL.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const FamiliemedlemmerFraPDL = ({ behandlingID }: PropsFromRedux) => {
  const [barnValgtForMerInformasjon, setBarnValgtForMerInformasjon] = useState<Familiemedlem | null>(null);
  const { loading, error, data } = useHentFamiliemedlemmerQuery({ variables: { behandlingID } });

  if (error) return <Nav.AlertStripeFeil>Kunne ikke hente familiemedlemmer!</Nav.AlertStripeFeil>;
  if (loading) return <div>Henter familiemedlemmer...</div>;

  const barn =
    data?.hentSaksopplysninger.persondata.familiemedlemmer.filter(
      (fm) => fm.relasjonsrolle === Familierelasjonsrolle.Barn
    ) || [];

  const ektefellePartner =
    data?.hentSaksopplysninger.persondata.familiemedlemmer.filter(
      (fm) => fm.relasjonsrolle === Familierelasjonsrolle.RelatertVedSivilstand
    ) || [];

  const over18Etikett = <Nav.EtikettBase type="info">&gt;18 år</Nav.EtikettBase>;

  return (
    <div className="familiemedlemmerFraPDL">
      <Etiketter.FraRegister className="familiemedlemmerFraPDL__fra-register-etikett" />
      <Mui.Undertittel className="familiemedlemmerFraPDL__undertittel" ikon={Ikoner.Child} tekst="Barn" />
      {barn.length > 0 ? (
        <FamiliemedlemGruppe
          familiemedlemmer={barn}
          headers={[
            { width: "2", text: "Navn" },
            { width: "3", text: "F.nr./d-nr." },
            { width: "2", text: "Foreldreansvar" },
            { width: "3", text: "F.nr. annen forelder" },
            { width: "2", text: "" },
          ]}
          renderFamiliemedlemColumns={(familiemedlem) => [
            { width: "2", content: familiemedlem.navn },
            {
              width: "3",
              content: <Ident ident={familiemedlem.ident} />,
            },
            { width: "2", content: familiemedlem.foreldreansvar },
            {
              width: "3",
              content: familiemedlem.fnrAnnenForelder ? (
                <>
                  <Ident ident={familiemedlem.fnrAnnenForelder} />
                  <Mui.Lenkeknapp onClick={() => setBarnValgtForMerInformasjon(familiemedlem)}>
                    Vis mer informasjon
                  </Mui.Lenkeknapp>
                </>
              ) : null,
            },
            {
              width: "2",
              content: familiemedlem.alder && familiemedlem.alder >= 18 ? over18Etikett : "",
            },
          ]}
        />
      ) : (
        <Nav.Typo.Normaltekst>Ingen barn registrert.</Nav.Typo.Normaltekst>
      )}
      <Mui.Undertittel
        className="familiemedlemmerFraPDL__undertittel"
        ikon={Ikoner.CoApplicant}
        tekst="Ektefelle/partner"
      />
      {ektefellePartner.length > 0 ? (
        <FamiliemedlemGruppe
          familiemedlemmer={ektefellePartner}
          headers={[
            { width: "3", text: "Navn" },
            { width: "3", text: "F.nr./d-nr." },
            { width: "3", text: "Fra og med" },
            { width: "3", text: "Relasjon" },
          ]}
          renderFamiliemedlemColumns={(familiemedlem) => [
            { width: "3", content: familiemedlem.navn },
            {
              width: "3",
              content: <Ident ident={familiemedlem.ident} />,
            },
            { width: "3", content: Utils.dato.formatterDatoTilNorsk(familiemedlem.sivilstandGyldighetsperiodeFom) },
            { width: "3", content: familiemedlem.sivilstand },
          ]}
        />
      ) : (
        <Nav.Typo.Normaltekst>Ingen ektefelle/partner registrert.</Nav.Typo.Normaltekst>
      )}
      {barnValgtForMerInformasjon && barnValgtForMerInformasjon.fnrAnnenForelder && (
        <Informasjonsmodal
          contentLabel="Informasjon om annen forelder"
          onRequestClose={() => setBarnValgtForMerInformasjon(null)}
          barnNavn={barnValgtForMerInformasjon.navn}
          forelderIdent={barnValgtForMerInformasjon.fnrAnnenForelder}
        />
      )}
    </div>
  );
};

export default connector(FamiliemedlemmerFraPDL);
