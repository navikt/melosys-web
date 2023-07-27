import PT from "prop-types";
import * as MKV from "@navikt/melosys-kodeverk";
import Radio from "~/felleskomponenter/skjema/input/radio";
import RadioGruppe from "~/felleskomponenter/skjema/input/radio-gruppe";

const VedtakstypeSkjema = ({ className, redigerbart, feltNavn, label }) => (
  <RadioGruppe className={className} feltNavn={feltNavn} label={label}>
    <Radio
      feltNavn={feltNavn}
      label="Korrigert vedtak"
      value={MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK}
      disabled={!redigerbart}
    />
    <Radio feltNavn={feltNavn} label="Omgjøringsvedtak" value={MKV.Koder.vedtakstyper.OMGJØRINGSVEDTAK} disabled />
  </RadioGruppe>
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
