import React from 'react';
import PT from 'prop-types';
import { FieldArray } from 'redux-form';

import * as Utils from '../../../../utils';
import * as Nav from '../../../../utils/navFrontend';
import * as Ikoner from '../../../../resources/images';

import Orgnrinput from './orgnrinput';
import Organisasjon from '../../arbeidsgiver/organisasjon';
import * as OrganisasjonValidering from '../../../skjema/validering/generisk/organisasjon';

import './ekstraArbeidsforholdNorge.css';

export const InnerEkstraArbeidsforholdNorge = ({
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
    <div className="innerEkstraArbeidsforholdNorge">
      {
        elementer.map((element, indeks) => {
          const organisasjon = findOrganisasjon(element) || {};
          const slett = () => fields.remove(indeks);
          const erstatt = verdi => fields.splice(indeks, 1, transformerOrgTilElement(verdi));
          const key = !Utils._isEmpty(organisasjon) ? organisasjon.orgnr : Utils._uuid();
          const preErstattValideringer = [
            {
              validering: orgnr => !OrganisasjonValidering.erOrgnrGyldig(orgnr),
              feilmelding: 'Ugyldig org. nr',
            },
            {
              validering: orgnr => elementerInneholderOrg(elementer, orgnr) && orgnr !== organisasjon.orgnr,
              feilmelding: 'Organisasjon er allerede lagt til',
            },
          ];

          return (
            <div key={key} className="enkeltEkstraArbeidsforholdNorge">
              <Orgnrinput
                erstatt={erstatt}
                preErstattValideringer={preErstattValideringer}
                redigerbart={redigerbart}
                hentOrganisasjon={hentOrganisasjon}
                defaultOrgnr={organisasjon.orgnr}
              />
              {
                !Utils._isEmpty(organisasjon) &&
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
                <Nav.Lenker onClick={slett}><img src={Ikoner.Bin} alt="Slett" /><span>{slettTekst}</span></Nav.Lenker>
              }
            </div>
          );
        })
      }
      <Nav.Knapp disabled={!redigerbart} onClick={leggTilDefault}>{leggTilTekst}</Nav.Knapp>
    </div>
  );
};

InnerEkstraArbeidsforholdNorge.propTypes = {
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

InnerEkstraArbeidsforholdNorge.defaultProps = {
  transformerOrgTilElement: verdi => verdi,
  defaultElement: undefined,
};

const EkstraArbeidsforholdNorge = ({
  feltNavn,
  ...rest
}) => (
  <FieldArray
    rerenderOnEveryChange
    name={feltNavn}
    component={InnerEkstraArbeidsforholdNorge}
    props={{ ...rest }}
  />
);

EkstraArbeidsforholdNorge.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default EkstraArbeidsforholdNorge;
