import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    hentSaksopplysninger,
    PersonSelector,
    ArbeidsforholdSelector,
} from './ducks/saksopplysninger';
import { Panel } from 'nav-frontend-paneler';
import AlertStripe from 'nav-frontend-alertstriper';

import { STATUS } from './ducks/utils';
import './arbeidsforhold.css';
import { Systemtittel } from 'nav-frontend-typografi';

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
        pathname: pathname,
        search: search,
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

const ArbeidsforholdTabell = ({ arbeidsforhold }) => {
    if (!arbeidsforhold || !arbeidsforhold.length) return null;
    let tableBody = arbeidsforhold.map(item => (
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

const BostedsAdresse = ({ bostedsadresse }) => {
    if (!bostedsadresse) return null;
    const {
        gateadresse: { gatenavn, husnummer, husbokstav },
        postnr,
        poststed,
        land,
    } = bostedsadresse;
    let gateadressen = '' + gatenavn;
    if (husnummer) gateadressen += ' ' + husnummer;
    if (husbokstav) gateadressen += husbokstav;
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
                    <AlertStripe type="advarsel" solid={true}>
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

const mapStateToProps = state => {
    return {
        person: PersonSelector(state),
        arbeidsforhold: ArbeidsforholdSelector(state),
        status: state.status,
    };
};
const mapDispatchToProps = dispatch => ({
    hentSaksopplysninger: fnr => dispatch(hentSaksopplysninger(fnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Arbeidsforhold);
