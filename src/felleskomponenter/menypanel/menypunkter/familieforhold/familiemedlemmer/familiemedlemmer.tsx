import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import classnames from "classnames";

import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import * as Ikoner from "../../../../../resources/images";
import * as Mui from "../../../../ui";
import * as Etiketter from "../../../etiketter";
import * as StringUtils from "../../../../../utils/streng";

import { useHentFamiliemedlemmerQuery } from "./hentFamiliemedlemmer.generated";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { Familierelasjonsrolle, Familiemedlem } from "../../../../../graphql";
import FamiliemedlemGruppe from "./familiemedlemGruppe";
import Ident from "./ident";
import bem from "../../../../../bemUtils";
import AnnenForelderModal from "./annenForelderModal";

import "./familiemedlemmer.css";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const Familiemedlemmer = ({ behandlingID }: PropsFromRedux) => {
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

  const familiemedlemmerClassName = bem("familiemedlemmer");

  return (
    <div className={familiemedlemmerClassName.block}>
      <Etiketter.FraRegister className={familiemedlemmerClassName.element("fra-register-etikett")} />
      <Mui.Undertittel className={familiemedlemmerClassName.element("undertittel")} ikon={Ikoner.Child} tekst="Barn" />
      {barn.length > 0 ? (
        <FamiliemedlemGruppe
          familiemedlemmer={barn}
          columns={[
            { width: "2", headerText: "Navn", renderContent: (familiemedlem) => familiemedlem.navn },
            {
              width: "3",
              headerText: "F.nr./d-nr.",
              renderContent: (familiemedlem) => <Ident ident={familiemedlem.ident} />,
            },
            {
              width: "2",
              headerText: "Foreldreansvar",
              renderContent: (familiemedlem) => StringUtils.storeForbokstaver(familiemedlem.foreldreansvar),
            },
            {
              width: "3",
              headerText: "F.nr. annen forelder",
              renderContent: (familiemedlem) =>
                familiemedlem.fnrAnnenForelder ? (
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
              headerText: "",
              renderContent: (familiemedlem) =>
                familiemedlem.alder && familiemedlem.alder < 18 ? <Etiketter.Under18Aar /> : "",
            },
          ]}
        />
      ) : (
        <Nav.Typo.Normaltekst
          className={familiemedlemmerClassName.element("ingen-familiemedlemmer-registrert-etikett")}
        >
          Ingen barn registrert.
        </Nav.Typo.Normaltekst>
      )}
      <Mui.Undertittel
        className={classnames(
          familiemedlemmerClassName.element("undertittel"),
          familiemedlemmerClassName.element("ektefelle-partner-undertittel")
        )}
        ikon={Ikoner.CoApplicant}
        tekst="Ektefelle/partner"
      />
      <Nav.Typo.EtikettLiten className={familiemedlemmerClassName.element("samboer-etikett")}>
        Samboer registreres ikke som relasjon i PDL
      </Nav.Typo.EtikettLiten>
      {ektefellePartner.length > 0 ? (
        <FamiliemedlemGruppe
          familiemedlemmer={ektefellePartner}
          columns={[
            { width: "3", headerText: "Navn", renderContent: (familiemedlem) => familiemedlem.navn },
            {
              width: "3",
              headerText: "F.nr./d-nr.",
              renderContent: (familiemedlem) => <Ident ident={familiemedlem.ident} />,
            },
            {
              width: "3",
              headerText: "Fra og med",
              renderContent: (familiemedlem) =>
                Utils.dato.formatterDatoTilNorsk(familiemedlem.sivilstandGyldighetsperiodeFom),
            },
            { width: "3", headerText: "Relasjon", renderContent: (familiemedlem) => familiemedlem.sivilstand },
          ]}
        />
      ) : (
        <Nav.Typo.Normaltekst
          className={familiemedlemmerClassName.element("ingen-familiemedlemmer-registrert-etikett")}
        >
          Ingen ektefelle/partner registrert.
        </Nav.Typo.Normaltekst>
      )}
      {barnValgtForMerInformasjon && barnValgtForMerInformasjon.fnrAnnenForelder && (
        <AnnenForelderModal
          contentLabel="Informasjon om annen forelder"
          onRequestClose={() => setBarnValgtForMerInformasjon(null)}
          barnNavn={barnValgtForMerInformasjon.navn}
          forelderIdent={barnValgtForMerInformasjon.fnrAnnenForelder}
        />
      )}
    </div>
  );
};

export default connector(Familiemedlemmer);
