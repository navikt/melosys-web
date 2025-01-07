import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import * as Nav from "../../../../navFrontend";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";

import "./medlemskap.css";
import MedlemskapTable from "./medlemskapTable";

const mapStateToProps = (state: RootState) => ({
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export function Medlemskap(props: PropsFromRedux) {
  const { medlemskap } = props;

  return (
    <div className="medlemskap panelSeksjon">
      <Nav.Heading size="small" className="medlemskap__gruppeoverskrift">
        Perioder med medlemskap
      </Nav.Heading>
      <section className="medlemskapgruppe__liste">
        {medlemskap.perioderMed.length > 0 ? (
          <MedlemskapTable perioder={medlemskap.perioderMed} />
        ) : (
          "(ingen data funnet)"
        )}
      </section>
      <Nav.Heading size="small" className="medlemskap__gruppeoverskrift">
        Perioder uten medlemskap
      </Nav.Heading>
      <section className="medlemskapgruppe__liste">
        {medlemskap.perioderUten.length > 0 ? (
          <MedlemskapTable perioder={medlemskap.perioderUten} />
        ) : (
          "(ingen data funnet)"
        )}
      </section>
    </div>
  );
}

export default connector(Medlemskap);
