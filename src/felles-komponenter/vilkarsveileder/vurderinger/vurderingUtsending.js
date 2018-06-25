import React from 'react';
import PT from 'prop-types';
import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

export const VurderingUtsendingTyper = {
  TRUE: 'true',
};

const UtsendingMindreEnn24Mnd = () => (
  <Skjema.Checkbox feltNavn="faktaavklaringUtsendingMindreEnn24Mnd" value={VurderingUtsendingTyper.TRUE} label="Er utsendingsperioden mindre enn 24 mnd?" />
);

const ErstatterTidligereUtsendt = () => (
  <Skjema.Checkbox feltNavn="faktaavklaringErstatterTidligereUtsendt" value={VurderingUtsendingTyper.TRUE} label="Skal personen erstatte en annen?" />
);

const AnsattINorskSelskap = () => (
  <Skjema.Checkbox feltNavn="faktaavklaringAnsattINorskSelskap" value={VurderingUtsendingTyper.TRUE} label="Skal personen være ansatt i det norske selskapet i hele utsendingsperioden?" />
);

const ForetakDriverINorge = () => (
  <Skjema.Checkbox feltNavn="faktaavklaringForetakDriverINorge" value={VurderingUtsendingTyper.TRUE} label="Er ansatt i et foretak som driver virksomhet i Norge." />
);

const HarForutgaendeMedlemskap = () => (
  <Skjema.Checkbox feltNavn="faktaavklaringHarForutgaendeMedlemskap" value={VurderingUtsendingTyper.TRUE} label="Har forutgående medlemskap." />
);

const SammeTypeVirksomhet = () => (
  <Skjema.Checkbox feltNavn="faktaavklaringSammeTypeVirksomhet" value={VurderingUtsendingTyper.TRUE} label="Innen samme type virksomhet?" />
);

const VurderingUtsending = props => {
  const { bekreftOgFortsett, tilstand } = props;

  return (
    <div>
      <Nav.Fieldset legend="Hva gjelder for søkeren?">
        {tilstand.visUtsendingMindreEnn24Mnd && <UtsendingMindreEnn24Mnd />}
        {tilstand.visErstatterTidligereUtsendt && <ErstatterTidligereUtsendt />}
        {tilstand.visAnsattINorskSelskap && <AnsattINorskSelskap />}
        {tilstand.visForetakDriverINorge && <ForetakDriverINorge />}
        {tilstand.visHarForutgaendeMedlemskap && <HarForutgaendeMedlemskap />}
        {tilstand.visSammeTypeVirksomhet && <SammeTypeVirksomhet />}
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingUtsending.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
};

VurderingUtsending.defaultProps = {
  tilstand: {},
};

export default VurderingUtsending;
