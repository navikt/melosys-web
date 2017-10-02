import React, {Component} from 'react';
import {connect} from 'react-redux';
import {hentSaksopplysninger, PersonSelector, ArbeidsforholdSelector} from '../ducks/saksopplysninger';
import {Panel} from 'nav-frontend-paneler';
import './arbeidsforhold.css';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import {Container, Row, Column} from 'nav-frontend-grid';


class Saksbehandling extends Component {

    componentDidMount() {
        const {fnr} = this.props.match.params;
        //this.props.hentSaksopplysninger(fnr);
    }

    expandHandler = (e) => {
        console.log('expanding', e);
    }

    render() {
        return (
            <Container>
                <Row>
                    <Column xs={"7"}>
                        <Ekspanderbartpanel tittel="OLA NORDMANN (44 ÅR)" tittelProps="innholdstittel"
                                            onClick={this.expandHandler}>
                            <div>
                                Dette er ett expandpanelVivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
                                auctor. Aenean lacinia bibendum nulla sed consectetur. Cras mattis consectetur purus sit
                                amet fermentum. Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla
                                non metus auctor fringilla. Nulla vitae elit libero, a pharetra augue. Etiam porta sem
                                malesuada magna mollis euismod.
                            </div>
                        </Ekspanderbartpanel>
                        <Ekspanderbartpanel tittel="Tilleggsopplysninger" tittelProps="innholdstittel"
                                            onClick={this.expandHandler}>
                            <div>
                                Dette er ett expandpanelVivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
                                auctor. Aenean lacinia bibendum nulla sed consectetur. Cras mattis consectetur purus sit
                                amet fermentum. Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla
                                non metus auctor fringilla. Nulla vitae elit libero, a pharetra augue. Etiam porta sem
                                malesuada magna mollis euismod.
                            </div>
                        </Ekspanderbartpanel>
                        <Ekspanderbartpanel tittel="Hagemøbler AS" tittelProps="innholdstittel"
                                            onClick={this.expandHandler}>
                            <div>
                                Dette er ett expandpanelVivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
                                auctor. Aenean lacinia bibendum nulla sed consectetur. Cras mattis consectetur purus sit
                                amet fermentum. Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla
                                non metus auctor fringilla. Nulla vitae elit libero, a pharetra augue. Etiam porta sem
                                malesuada magna mollis euismod.
                            </div>
                        </Ekspanderbartpanel>
                        <Ekspanderbartpanel tittel="Inntekt" tittelProps="innholdstittel"
                                            onClick={this.expandHandler}>
                            <div>
                                Dette er ett expandpanelVivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
                                auctor. Aenean lacinia bibendum nulla sed consectetur. Cras mattis consectetur purus sit
                                amet fermentum. Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla
                                non metus auctor fringilla. Nulla vitae elit libero, a pharetra augue. Etiam porta sem
                                malesuada magna mollis euismod.
                            </div>
                        </Ekspanderbartpanel>


                    </Column>
                    <Column xs={"5"}>

                    </Column>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = (state) => {
    return ({})
};
const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Saksbehandling);