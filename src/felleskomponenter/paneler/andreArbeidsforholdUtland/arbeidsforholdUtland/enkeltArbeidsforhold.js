import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Skjema from '../../../skjema';
import * as Ikoner from '../../../../resources/images';


const EnkeltArbeidsforhold = ({
  redigerbart,
  index,
  slett,
  overordnetFeltnavn,
  className,
  slettTekst,
}) => (
  <div className={className}>
    <Nav.Row>
      <Nav.Column xs="8">
        <Skjema.Input
          label="Navn på virksomheten"
          feltNavn={`${overordnetFeltnavn}[${index}].navn`}
          disabled={!redigerbart}
        />
      </Nav.Column>
      <Nav.Column xs="4">
        <Skjema.Input
          label="Org. nr"
          feltNavn={`${overordnetFeltnavn}[${index}].orgnr`}
          disabled={!redigerbart}
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="8">
        <Skjema.Input
          label="Adresse til arbeidsgiver"
          feltNavn={`${overordnetFeltnavn}[${index}].adresse.gatenavn`}
          disabled={!redigerbart}
        />
      </Nav.Column>
      <Nav.Column xs="2">
        <Skjema.Input
          label="Poststed"
          feltNavn={`${overordnetFeltnavn}[${index}].adresse.poststed`}
          disabled={!redigerbart}
        />
      </Nav.Column>
      <Nav.Column xs="2">
        <Skjema.Input
          label="Postnummer"
          feltNavn={`${overordnetFeltnavn}[${index}].adresse.postnummer`}
          disabled={!redigerbart}
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="8">
        <Skjema.LandVelger
          label="Land"
          feltNavn={`${overordnetFeltnavn}[${index}].adresse.landkode`}
          disabled={!redigerbart}
        />
      </Nav.Column>
    </Nav.Row>
    {
      redigerbart &&
      <Nav.Lenker onClick={() => slett(index)}>
        <img src={Ikoner.Bin} alt="Slett" />
        <span>{slettTekst}</span>
      </Nav.Lenker>
    }
  </div>
);

EnkeltArbeidsforhold.propTypes = {
  redigerbart: PT.bool.isRequired,
  index: PT.number.isRequired,
  slett: PT.func.isRequired,
  overordnetFeltnavn: PT.string.isRequired,
  className: PT.string,
  slettTekst: PT.string.isRequired,
};

EnkeltArbeidsforhold.defaultProps = {
  className: undefined,
};

export default EnkeltArbeidsforhold;
