import React, {Component} from 'react';
import {connect} from 'react-redux';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import {Container, Row, Column} from 'nav-frontend-grid';

import Soknadsinfo from '../components/soknadsinfo';
import Vilkarsvurdering from '../components/vilkarsvurdering';

import './saksbehandling.css';

class Saksbehandling extends Component {
    expandHandler = (e) => {
        console.log('expanding', e);
    }

    render() {
        return (
            <Container className="Saksbehandling">
                <Row>
                    <Column xs={"7"}>
                        <Vilkarsvurdering />
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
                        <Soknadsinfo/>

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