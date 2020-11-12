import React from 'react';
import PT from 'prop-types';
import classNames from 'classnames';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import OrganisasjonsAdresse from '../../../adresser/organisasjonsAdresse';

const Organisasjon = ({
  organisasjon,
  className,
  visNavn,
  visOrgnr,
  visAdresseTittel,
  boldAdresseNavn,
}) => {
  if (!organisasjon) { return null; }
  const {
    orgnr,
  } = organisasjon;

  const organisasjonCls = classNames(className);

  return (
    <div className={organisasjonCls}>
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="4">
            <OrganisasjonsAdresse
              visNavn={visNavn}
              visTittel={visAdresseTittel}
              organisasjon={organisasjon}
              boldNavn={boldAdresseNavn}
            />
          </Nav.Column>
          {
            visOrgnr &&
            <Nav.Column xs="6">
              <Nav.typo.Normaltekst style={{ marginTop: '0.5em' }}>Org.nr. juridisk enhet</Nav.typo.Normaltekst>
              <Nav.typo.Element>{orgnr}</Nav.typo.Element>
            </Nav.Column>
          }
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

Organisasjon.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  className: PT.string,
  visNavn: PT.bool,
  visOrgnr: PT.bool,
  visAdresseTittel: PT.bool,
  boldAdresseNavn: PT.bool,
};

Organisasjon.defaultProps = {
  className: undefined,
  visNavn: false,
  visOrgnr: false,
  visAdresseTittel: true,
  boldAdresseNavn: false,
};

export default Organisasjon;
