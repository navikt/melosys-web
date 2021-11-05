import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Nav from "../../../../../navFrontend";

import { useHentFamiliemedlemmerQuery } from "./hentFamiliemedlemmer.generated";
import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import FamiliemedlemGruppe from "./familiemedlemGruppe";
import { Familierelasjonsrolle } from "../../../../../graphql";

const mapStateToProps = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const FamiliemedlemmerFraPDL = ({ behandlingID }: PropsFromRedux) => {
  const { loading, error, data } = useHentFamiliemedlemmerQuery({ variables: { behandlingID } });

  if (error) return <Nav.AlertStripeFeil>Kunne ikke hente familiemedlemmer!</Nav.AlertStripeFeil>;
  if (loading) return <div>Henter familiemedlemmer...</div>;

  const barn =
    data?.hentSaksopplysninger.persondata.familiemedlemmer.filter(
      (fm) => fm.relasjonsrolle === Familierelasjonsrolle.Barn
    ) || [];

  // TODO: Avklare om det skal filtreres mer på sivilstand her.
  // https://pdldocs-navno.msappproxy.net/ekstern/index.html#_sivilstand
  const ektefellePartner =
    data?.hentSaksopplysninger.persondata.familiemedlemmer.filter(
      (fm) => fm.relasjonsrolle === Familierelasjonsrolle.RelatertVedSivilstand
    ) || [];

  return (
    <>
      {barn.length > 0 && <FamiliemedlemGruppe familiemedlemmer={barn} />}
      {ektefellePartner.length > 0 && <FamiliemedlemGruppe familiemedlemmer={ektefellePartner} />}
    </>
  );
};

export default connector(FamiliemedlemmerFraPDL);
