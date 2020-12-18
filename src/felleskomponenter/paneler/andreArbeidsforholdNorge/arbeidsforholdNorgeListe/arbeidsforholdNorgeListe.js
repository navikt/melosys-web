import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Utils from '../../../../utils';
import * as Nav from '../../../../utils/navFrontend';
import * as Ikoner from '../../../../resources/images';
import * as MPT from '../../../../proptypes';

import Orgnrinput from './orgnrinput';
import Organisasjon from '../../arbeidsgiver/organisasjon';

import './arbeidsforholdNorgeListe.css';

export const EnkeltArbeidsforholdNorge = ({
  erstatt,
  valideringer,
  hentVedMount,
  redigerbart,
  hentOrganisasjon,
  organisasjon,
  slett,
  slettTekst,
  orgIkkeFunnetTekst,
  orgFeilVedHentingTekst,
}) => (
  <div className="enkeltArbeidsforholdNorge">
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
      (!Utils._isEmpty(organisasjon) && !Utils._isEmpty(organisasjon.orgnr)) &&
        <Organisasjon
          organisasjon={organisasjon}
          redigerbart={redigerbart}
          visNavn
          visAdresseTittel={false}
          boldAdresseNavn
        />
    }
    {
      redigerbart &&
        <Nav.Lenker onClick={slett}>
          <Ikoner.Bin />
          <span>{slettTekst}</span>
        </Nav.Lenker>
    }
  </div>
);

EnkeltArbeidsforholdNorge.propTypes = {
  valideringer: PT.arrayOf(PT.shape({
    validering: PT.func.isRequired,
    feilmelding: PT.string.isRequired,
  })).isRequired,
  hentVedMount: PT.bool,
  organisasjon: MPT.Organisasjon.isRequired,
  erstatt: PT.func.isRequired,
  slett: PT.func.isRequired,
  slettTekst: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  orgIkkeFunnetTekst: PT.string,
  orgFeilVedHentingTekst: PT.string,
};

EnkeltArbeidsforholdNorge.defaultProps = {
  hentVedMount: false,
  orgIkkeFunnetTekst: undefined,
  orgFeilVedHentingTekst: undefined,
};

export const InnerArbeidsforholdNorgeListe = ({
  leggTilTekst,
  slettTekst,
  fields,
  redigerbart,
  hentOrganisasjon,
  findOrganisasjon,
  transformerOrgTilElement,
  defaultElement,
  elementerInneholderOrg,
}) => {
  const elementer = fields.getAll() || [];

  const leggTilDefault = () => {
    fields.push(defaultElement);
  };

  return (
    <div className="innerArbeidsforholdNorgeListe">
      {
        elementer.map((element, indeks) => {
          const organisasjon = findOrganisasjon(element) || {};
          const slett = () => fields.remove(indeks);
          const erstatt = verdi => fields.splice(indeks, 1, transformerOrgTilElement(verdi));
          const key = !Utils._isEmpty(organisasjon) ? organisasjon.orgnr : Utils._uuid();
          const valideringer = [
            {
              validering: orgnr => !Utils.organisasjon.erOrgnrGyldig(orgnr),
              feilmelding: 'Ugyldig org.nr.',
            },
            {
              validering: orgnr => elementerInneholderOrg(elementer, orgnr) && orgnr !== organisasjon.orgnr,
              feilmelding: 'Organisasjon er allerede lagt til',
            },
          ];

          return (
            <EnkeltArbeidsforholdNorge
              key={key}
              erstatt={erstatt}
              valideringer={valideringer}
              redigerbart={redigerbart}
              hentOrganisasjon={hentOrganisasjon}
              organisasjon={organisasjon}
              slett={slett}
              slettTekst={slettTekst}
              hentVedMount={Boolean(organisasjon.orgnr)}
            />
          );
        })
      }
      <Nav.Knapp disabled={!redigerbart} onClick={leggTilDefault}>{leggTilTekst}</Nav.Knapp>
    </div>
  );
};

InnerArbeidsforholdNorgeListe.propTypes = {
  leggTilTekst: PT.string.isRequired,
  slettTekst: PT.string.isRequired,
  fields: PT.object.isRequired,
  redigerbart: PT.bool.isRequired,
  findOrganisasjon: PT.func.isRequired,
  hentOrganisasjon: PT.func.isRequired,
  transformerOrgTilElement: PT.func,
  defaultElement: PT.any,
  elementerInneholderOrg: PT.func.isRequired,
};

InnerArbeidsforholdNorgeListe.defaultProps = {
  transformerOrgTilElement: verdi => verdi,
  defaultElement: undefined,
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
