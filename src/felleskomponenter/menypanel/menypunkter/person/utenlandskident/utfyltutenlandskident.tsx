import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import { UtenlandskIdent } from "./types";
import { landkoderSelectors } from "../../../../../ducks/landkoder";
import * as Nav from "../../../../../navFrontend";
import * as KV from "../../../../../kodeverk";

const mapStateToProps = (state: RootState) => ({
  landkoder: landkoderSelectors.LandkoderSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type UtfyltUtenlandskIdentProps = PropsFromRedux & {
  utenlandskeIdenter: UtenlandskIdent[];
};

const UtfyltUtenlandskIdent = ({ utenlandskeIdenter, landkoder }: UtfyltUtenlandskIdentProps) => (
  <>
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.BodyLong size="small">ID-nummer</Nav.BodyLong>
      </Nav.Column>
      <Nav.Column xs="6">
        <Nav.BodyLong size="small">Land</Nav.BodyLong>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      {utenlandskeIdenter.map(({ ident, landkode }, indeks) => (
        /* eslint-disable-next-line react/no-array-index-key */
        <div key={indeks}>
          <Nav.Column xs="6">
            <Nav.Typo.Element>{ident}</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column xs="6">
            {landkode && <Nav.Typo.Element>{KV.kodeTilTerm(landkode, landkoder)}</Nav.Typo.Element>}
          </Nav.Column>
        </div>
      ))}
    </Nav.Row>
  </>
);

export default connector(UtfyltUtenlandskIdent);
