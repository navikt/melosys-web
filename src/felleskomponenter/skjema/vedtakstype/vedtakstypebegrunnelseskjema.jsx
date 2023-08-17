import PT from "prop-types";
import * as MKV from "@navikt/melosys-kodeverk";
import Select from "../input/select";

const VedtakstypebegrunnelseSkjema = ({ className, redigerbart, feltNavn, label }) => (
  <Select feltNavn={feltNavn} label={label} className={className} disabled={!redigerbart}>
    {MKV.KTObjects.begrunnelser.nyvurderingbakgrunner.map(({ kode, term }) => (
      <option key={kode} value={kode}>
        {term}
      </option>
    ))}
  </Select>
);

VedtakstypebegrunnelseSkjema.propTypes = {
  className: PT.string,
  redigerbart: PT.bool.isRequired,
  feltNavn: PT.string.isRequired,
  label: PT.string.isRequired,
};

VedtakstypebegrunnelseSkjema.defaultProps = {
  className: undefined,
};

export default VedtakstypebegrunnelseSkjema;
