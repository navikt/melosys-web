import PT from "prop-types";

import * as Nav from "../../../navFrontend";

import VedtakstypeBegrunnelseSkjema from "./vedtakstypebegrunnelseskjema";
import LabelMedHjelpetekst from "../../labelMedHjelpetekst/labelMedHjelpetekst";

const Vedtakstype = ({ className, redigerbart, vedtakstypebegrunnelseFeltNavn, vedtakstypebegrunnelseLabel }) => (
  <Nav.Row className={className}>
    <Nav.Column xs="7">
      <VedtakstypeBegrunnelseSkjema
        redigerbart={redigerbart}
        feltNavn={vedtakstypebegrunnelseFeltNavn}
        label={vedtakstypebegrunnelseLabel}
      />
    </Nav.Column>
  </Nav.Row>
);

Vedtakstype.propTypes = {
  className: PT.string,
  redigerbart: PT.bool.isRequired,
  vedtakstypeFeltNavn: PT.string,
  vedtakstypebegrunnelseFeltNavn: PT.string,
  vedtakstypeLabel: PT.string,
  vedtakstypebegrunnelseLabel: PT.string,
};

Vedtakstype.defaultProps = {
  className: undefined,
  vedtakstypeFeltNavn: "vedtakstype",
  vedtakstypebegrunnelseFeltNavn: "vedtakstypebegrunnelse",
  vedtakstypeLabel: "Hvilken type vedtak skal fattes?",
  vedtakstypebegrunnelseLabel: (
    <LabelMedHjelpetekst
      label="Oppgi grunn for nytt vedtak (Obligatorisk)"
      hjelpetekst={
        "Velg en innledningstekst til vedtaket. " +
        "Teksten kommer først i vedtaket og skal forklare " +
        "hvorfor vi har gjort nytt vedtak."
      }
    />
  ),
};

export default Vedtakstype;
