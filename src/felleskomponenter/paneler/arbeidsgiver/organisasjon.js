import React from 'react';
import PT from 'prop-types';
import classNames from 'classnames';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';
import * as Ikoner from '../../../resources/images';

import OrganisasjonsAdresse from '../../adresser/organisasjonsAdresse';
import KontaktOpplysninger from '../../kontaktopplysninger';

import './organisasjon.css';

/** Dette er komponenten for ett enkelt Arbeidsforhold. Denne eksporteres ikke til omverden, men brukes
 * kun av komponenten Arbeidsforholdene.
 *
 * @param props Et objekt med det aktuelle arbeidsforholdet.
 */
const Organisasjon = ({
  organisasjon,
  slettHandle,
  redigerbart,
  className,
  slettTekst,
}) => {
  if (!organisasjon) { return null; }
  const {
    orgnr,
  } = organisasjon;

  const organisasjonCls = classNames('panelSeksjon', 'organisasjon', className);

  return (
    <div className={organisasjonCls}>
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="6">
            <Nav.typo.Element className="orgnr">Org.nr. juridisk enhet: </Nav.typo.Element>
            <Nav.typo.Normaltekst className="orgnr">{orgnr}</Nav.typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="6">
            <dl className="organisasjon__detaljer">
              <OrganisasjonsAdresse visNavn={false} className="organisasjon__adresse" organisasjon={organisasjon} />
            </dl>
            <div className="organisasjon__slettknapp">
              {
                slettHandle && redigerbart &&
                <Nav.Lenker onClick={slettHandle}><img src={Ikoner.Bin} alt="Slett" /><span>{slettTekst}</span></Nav.Lenker>
              }
            </div>
          </Nav.Column>
          <Nav.Column xs="6" className="organisasjon__kontaktopplysninger">
            <KontaktOpplysninger juridiskOrg={organisasjon} redigerbart={redigerbart} />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

Organisasjon.propTypes = {
  organisasjon: MPT.Organisasjon.isRequired,
  slettHandle: PT.func,
  redigerbart: PT.bool.isRequired,
  className: PT.string,
  slettTekst: PT.string,
};

Organisasjon.defaultProps = {
  slettHandle: undefined,
  className: undefined,
  slettTekst: 'Slett',
};

export default Organisasjon;
