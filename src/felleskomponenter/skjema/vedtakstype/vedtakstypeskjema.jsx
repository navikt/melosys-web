import PT from "prop-types";
import * as MKV from "@navikt/melosys-kodeverk";
import * as Nav from "../../../navFrontend";
import { RadioGroup } from "../index";

const VedtakstypeSkjema = ({ className, redigerbart, feltNavn, label }) => (
  <RadioGroup className={className} name={feltNavn} legend={label} disabled={!redigerbart}>
    <Nav.Radio value={MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK}>Korrigert vedtak</Nav.Radio>
    <Nav.Radio value={MKV.Koder.vedtakstyper.OMGJØRINGSVEDTAK} disabled>
      Omgjøringsvedtak
    </Nav.Radio>
  </RadioGroup>
);

VedtakstypeSkjema.propTypes = {
  className: PT.string,
  redigerbart: PT.bool.isRequired,
  feltNavn: PT.string.isRequired,
  label: PT.string.isRequired,
};

VedtakstypeSkjema.defaultProps = {
  className: undefined,
};

export default VedtakstypeSkjema;
