import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import { hentFaktaVerdi, konverterTilStegData, lagAvklartfakta } from '../../../regler/avklartefakta';

const VurderingYrkesaktivitet = props => {
  const {
    bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData, erSoknadArbeidFlereLand,
  } = props;
  const { skjulArbeidstakerFrilanserOgSelvstendigNaeringsdrivende, harAvklaring, yrkesaktivitet } = tilstand;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.YRKESAKTIVITET, yrkesaktivitet));
    const cleanup = () => {
      slettData();
    };
    return cleanup;
  }, []);

  const radioEndret = event => {
    oppdaterData(lagAvklartfakta(KV.Koder.YRKESAKTIVITET, null, event.target.value));
  };

  const labels = erSoknadArbeidFlereLand ? [
    'Lønnet arbeid i to eller flere land',
    'Selvstendig næringsvirksomhet i to eller flere land',
    'Lønnet arbeid og selvstendig næringsvirksomhet i to eller flere land',
    'Offentlig tjeneste og annen yrkesaktivitet i to eller flere land',
  ] : [
    'Lønnet arbeid',
    'Selvstendig næringsvirksomhet',
    'Arbeidstaker eller frilanser og selvstendig næringsdrivende',
    'Tjeneste i norsk statsforvaltning',
  ];

  const fakta = hentFaktaVerdi(yrkesaktivitet);
  return (
    <div>
      <Nav.typo.Undertittel>Hva slags type yrkesaktivitet skal søkeren utøve?</Nav.typo.Undertittel>
      <Nav.Fieldset legend="">
        <Nav.Radio
          name="yrkesaktivitet"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER}
          value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER}
          onChange={radioEndret}
          label={labels[0]}
        />
        <Nav.Radio
          name="yrkesaktivitet"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE}
          value={KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE}
          onChange={radioEndret}
          label={labels[1]}
        />
        {
          !skjulArbeidstakerFrilanserOgSelvstendigNaeringsdrivende &&
          <Nav.Radio
            name="yrkesaktivitet"
            disabled={!redigerbart}
            checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG}
            value={KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG}
            onChange={radioEndret}
            label={labels[2]}
          />
        }
        <Nav.Radio
          name="yrkesaktivitet"
          disabled={!erSoknadArbeidFlereLand}
          checked={fakta === KV.Koder.VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING}
          value={KV.Koder.VurderingYrkesaktivitetTyper.TJENESTEPERSON_NORSK_STATSFORVANTLING}
          onChange={radioEndret}
          label={labels[3]}
        />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" data-cy-nesteknapp="knapp_steg4" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingYrkesaktivitet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  redigerbart: PT.bool.isRequired,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  erSoknadArbeidFlereLand: PT.bool.isRequired,
};

VurderingYrkesaktivitet.defaultProps = {
  tilstand: {},
};

export default VurderingYrkesaktivitet;
