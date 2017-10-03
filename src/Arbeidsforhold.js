import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { Panel } from 'nav-frontend-paneler';
import AlertStripe from 'nav-frontend-alertstriper';
import { Systemtittel } from 'nav-frontend-typografi';
import { STATUS } from './ducks/utils';
import {
  hentSaksopplysninger,
  PersonSelector,
  ArbeidsforholdSelector,
} from './ducks/saksopplysninger';
import './arbeidsforhold.css';

const ArbeidsforholdRad = ({ arbeidsforhold }) => {
    const {
        arbeidsforholdIDnav,
        arbeidstakerID: fnr,
        arbeidsgiver: { navn, orgnummer: orgnr },
        ansettelsesPeriode,
    } = arbeidsforhold;

    const pathname = `/arbeidsforholdet/${fnr}/`;
    const search = `?navid=${arbeidsforholdIDnav}`;
    const linkToArbeidsforholdet = {
        pathname,
        search,
    };

    return (
        <tr>
            <td>{orgnr}</td>
            <td>{navn}</td>
            <td>{ansettelsesPeriode.fom}</td>
            <td>{ansettelsesPeriode.tom}</td>
            <td>
                <Link to={linkToArbeidsforholdet} alt="Arbeidsforhold detalj">
                    Vis
                </Link>
            </td>
        </tr>
    );
};

ArbeidsforholdRad.propTypes = {
  arbeidsforhold: PT.object.isRequired,
};

const ArbeidsforholdTabell = ({ arbeidsforhold }) => {
    if (!arbeidsforhold || !arbeidsforhold.length) return null;
    const tableBody = arbeidsforhold.map(item => (
        <ArbeidsforholdRad key={item.arbeidsforholdID} arbeidsforhold={item} />
    ));

    return (
        <table>
            <thead>
                <tr>
                    <th>Orgnr</th>
                    <th>Navn</th>
                    <th>FOM</th>
                    <th>TOM</th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>{tableBody}</tbody>
        </table>
    );
};
ArbeidsforholdTabell.propTypes = {
  arbeidsforhold: PT.object.isRequired,
};

const gateadresse = ({ bostedsadresse }) => {
  const {
    gateadresse: { gatenavn, husnummer, husbokstav },
  } = bostedsadresse;
  const gnavn = gatenavn ? `${gatenavn} ` : '';
  const hnr = husnummer ? `${husnummer} ` : '';
  const hb = husbokstav ? `${husbokstav} ` : '';
  return (
    `${gnavn}${hnr}${hb}`
  );
};
const BostedsAdresse = ({ bostedsadresse }) => {
    if (!bostedsadresse) return null;
    const {
        postnr,
        poststed,
        land,
    } = bostedsadresse;
  const gateadressen = gateadresse(bostedsadresse);
    return (
        <p>
            {gateadressen}
            <br />
            {postnr}&nbsp;{poststed}
            <br />
            {land}
        </p>
    );
};

BostedsAdresse.propTypes = {
  bostedsadresse: PT.object.isRequired,
};

class Arbeidsforhold extends Component {
    componentDidMount() {
        const { fnr } = this.props.match.params;
        this.props.hentSaksopplysninger(fnr);
    }

    render() {
        const { fnr } = this.props.match.params;
        const { person, arbeidsforhold, status } = this.props;

        if (!arbeidsforhold || status === STATUS.ERROR) {
            return (
                <div>
                    <AlertStripe type="advarsel" solid={'true'}>
                        Fant ingen arbeidsforhold
                    </AlertStripe>
                </div>
            );
        }

        const { sammensattNavn, bostedsadresse } = person;
        return (
            <section className="arbeidsforhold">
                <Panel>
                    <Systemtittel>Fødselsnr: {fnr}</Systemtittel>
                    <p>{sammensattNavn}</p>
                    <BostedsAdresse bostedsadresse={bostedsadresse} />
                </Panel>
                <br />
                <Panel>
                    <Systemtittel className="blokk-xs">
                        Arbeidsforhold
                    </Systemtittel>
                    <ArbeidsforholdTabell arbeidsforhold={arbeidsforhold} />
                </Panel>
            </section>
        );
    }
}

Arbeidsforhold.propTypes = {
  match: PT.any.isRequired,
  hentSaksopplysninger: PT.func.isRequired,
  person: PT.object.isRequired,
  arbeidsforhold: PT.object.isRequired,
  status: PT.object.isRequired,
};

const mapStateToProps = state => ({
  person: PersonSelector(state),
  arbeidsforhold: ArbeidsforholdSelector(state),
  status: state.status,
});

const mapDispatchToProps = dispatch => ({
    hentSaksopplysninger: fnr => dispatch(hentSaksopplysninger(fnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Arbeidsforhold);
