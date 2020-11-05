import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';
import classnames from 'classnames';

import * as Utils from '../../../../../utils';
import * as Mui from '../../../../ui';
import * as Nav from '../../../../../utils/navFrontend';
import * as Ikoner from '../../../../../resources/images';
import * as MPT from '../../../../../proptypes';
import * as OrganisasjonValidering from '../../../../skjema/validering/generisk/organisasjon';

import RedigerbartElement from '../../redigerbartelement';
import Orgnrinput from './orgnrinput';
import Organisasjon from '../../arbeidsgiver/organisasjon';
import Kontaktopplysninger from '../../../../kontaktopplysninger';
import EnkeltArbeidsforholdNorgeRedigeringUtfort from './enkeltArbeidsforholdNorgeRedigeringUtfort';

import './arbeidsforholdNorgeListe.css';

export const EnkeltArbeidsforholdNorgeRedigerer = ({
  erstatt,
  valideringer,
  hentVedMount,
  redigerbart,
  hentOrganisasjon,
  organisasjon,
  orgIkkeFunnetTekst,
  orgFeilVedHentingTekst,
}) => {
  const orgFinnes = !Utils._isEmpty(organisasjon) && !Utils._isEmpty(organisasjon.orgnr);

  return (
    <Nav.Row className="enkeltArbeidsforholdNorge">
      <Nav.Column xs="4">
        <Orgnrinput
          onOrgnrFunnet={erstatt}
          valideringer={valideringer}
          hentVedMount={hentVedMount}
          redigerbart={redigerbart}
          hentOrganisasjon={hentOrganisasjon}
          defaultOrgnr={organisasjon.orgnr || ''}
          ikkeFunnetFeilmelding={orgIkkeFunnetTekst}
          feilVedHentingFeilmelding={orgFeilVedHentingTekst}
        />
        {
          orgFinnes &&
            <Organisasjon
              organisasjon={organisasjon}
              redigerbart={redigerbart}
              visNavn
              visAdresseTittel={false}
              boldAdresseNavn
            />
        }
      </Nav.Column>
      <Nav.Column xs="8">
        {
          orgFinnes &&
          <Kontaktopplysninger
            redigerbart={redigerbart}
            juridiskOrg={organisasjon}
          />
        }
      </Nav.Column>
    </Nav.Row>
  );
};

EnkeltArbeidsforholdNorgeRedigerer.propTypes = {
  valideringer: PT.arrayOf(PT.shape({
    validering: PT.func.isRequired,
    feilmelding: PT.string.isRequired,
  })).isRequired,
  hentVedMount: PT.bool,
  organisasjon: MPT.Organisasjon.isRequired,
  erstatt: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  orgIkkeFunnetTekst: PT.string,
  orgFeilVedHentingTekst: PT.string,
};

EnkeltArbeidsforholdNorgeRedigerer.defaultProps = {
  hentVedMount: false,
  orgIkkeFunnetTekst: undefined,
  orgFeilVedHentingTekst: undefined,
};

export const InnerArbeidsforholdNorgeListe = ({
  leggTilTekst,
  fields,
  redigerbart,
  hentOrganisasjon,
  findOrganisasjon,
  transformerOrgTilElement,
  defaultElement,
  elementerInneholderOrg,
  saksnummer,
  tittelTekst,
  tittelIkon,
  className,
}) => {
  const elementer = fields.getAll() || [];

  const leggTilDefault = () => {
    fields.push(defaultElement);
  };

  const cls = classnames(className, 'innerArbeidsforholdNorgeListe');

  return (
    <div className={cls}>
      {
        elementer.map((element, indeks) => {
          const organisasjon = findOrganisasjon(element) || {};
          const slett = () => fields.remove(indeks);
          const erstatt = verdi => fields.splice(indeks, 1, transformerOrgTilElement(verdi));
          const key = !Utils._isEmpty(organisasjon) ? organisasjon.orgnr : Utils._uuid();
          const valideringer = [
            {
              validering: orgnr => !OrganisasjonValidering.erOrgnrGyldig(orgnr),
              feilmelding: 'Ugyldig org.nr.',
            },
            {
              validering: orgnr => elementerInneholderOrg(elementer, orgnr) && orgnr !== organisasjon.orgnr,
              feilmelding: 'Organisasjon er allerede lagt til',
            },
          ];

          return (
            <RedigerbartElement
              key={key}
              redigerbart={redigerbart}
              harData={Boolean(organisasjon.orgnr)}
              tittel={`${tittelTekst}${organisasjon.navn ? `: ${organisasjon.navn}` : ''}`}
              tittelIkon={tittelIkon}
              tittelUnderstrek
              binClickHandler={slett}
              redigererRender={() => (
                <EnkeltArbeidsforholdNorgeRedigerer
                  erstatt={erstatt}
                  valideringer={valideringer}
                  redigerbart={redigerbart}
                  hentOrganisasjon={hentOrganisasjon}
                  organisasjon={organisasjon}
                  hentVedMount={Boolean(organisasjon.orgnr)}
                />
              )}
              redigeringUtfortRender={() => (
                <EnkeltArbeidsforholdNorgeRedigeringUtfort
                  saksnummer={saksnummer}
                  org={organisasjon}
                />
              )}
            />
          );
        })
      }
      {
        redigerbart &&
        <div className="leggTilKnapp">
          <Mui.Knappelenke
            onClick={leggTilDefault}
            ikon={Ikoner.Add}
          >
            {leggTilTekst}
          </Mui.Knappelenke>
        </div>
      }
    </div>
  );
};

InnerArbeidsforholdNorgeListe.propTypes = {
  leggTilTekst: PT.string.isRequired,
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  findOrganisasjon: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  transformerOrgTilElement: PT.func,
  defaultElement: PT.any,
  elementerInneholderOrg: PT.func.isRequired,
  saksnummer: PT.string.isRequired,
  tittelTekst: PT.string.isRequired,
  tittelIkon: PT.node.isRequired,
  className: PT.string,
};

InnerArbeidsforholdNorgeListe.defaultProps = {
  transformerOrgTilElement: verdi => verdi,
  defaultElement: undefined,
  className: undefined,
};

const ArbeidsforholdNorgeListe = ({
  feltNavn,
  ...rest
}) => (
  <FieldArray
    rerenderOnEveryChange
    name={feltNavn}
    component={InnerArbeidsforholdNorgeListe}
    props={{ ...rest }}
  />
);

ArbeidsforholdNorgeListe.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default ArbeidsforholdNorgeListe;
