import { Component } from 'react';
import * as ReactDOM from 'react-dom';
import PT from 'prop-types';

class DialogVindu extends Component {
  constructor(props) {
    super(props);

    this.vindu = null;
    this.rotElement = document.createElement('div');
  }

  componentDidMount() {
    this.vindu = window.open('', '', 'width=800,height=600,left=200,top=50', true);

    // Popup blocker kan føre til at vindu ikke åpnes
    if (this.vindu != null) {
      this.vindu.document.body.appendChild(this.rotElement);
    }
  }

  componentWillUnmount() {
    if (this.vindu != null) {
      this.vindu.close();
    }
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.rotElement);
  }
}

DialogVindu.propTypes = {
  children: PT.object.isRequired,
};

export default DialogVindu;
