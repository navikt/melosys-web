import { Component } from "react";
import PT from "prop-types";
import { UnmountClosed } from "react-collapse";
import { guid, omit } from "nav-frontend-js-utils";
import classNames from "classnames";
import LesMerToggle from "./lesmertoggle";
import "./lesmerpanel.css";

const lesMerPanelCls = (props) => classNames("lesMerPanel", props.className, props.border ? "lesMerPanel--border" : "");

class Lesmerpanel extends Component {
  constructor(props) {
    super(props);
    this.state = { erApen: props.defaultApen };
  }

  toggle = (e) => {
    e.preventDefault();
    const { erApen } = this.state;
    const { onClose, onOpen } = this.props;
    this.setState({ erApen: !erApen });
    if (erApen) {
      onClose(e);
    } else {
      onOpen(e);
    }
  };

  render() {
    const { intro, children, apneTekst, lukkTekst, id = guid(), ...other } = this.props;
    const domProps = omit(other, "className", "border", "onOpen", "onClose", "defaultApen");
    const { erApen } = this.state;

    return (
      <div id={id} className={lesMerPanelCls(this.props)} {...domProps}>
        <div className="lesMerPanel__introWrapper">
          {intro && <div className="lesMerPanel__intro">{intro}</div>}
          {children && (
            <LesMerToggle
              aria-controls={id}
              apneTekst={apneTekst}
              lukkTekst={lukkTekst}
              erApen={erApen}
              onClick={(e) => this.toggle(e)}
            />
          )}
        </div>
        {children && (
          <div className="lesMerPanel__merContainer">
            <UnmountClosed isOpened={erApen}>
              <div className="lesMerPanel__mer">
                <div>{children}</div>
              </div>
            </UnmountClosed>
          </div>
        )}
      </div>
    );
  }
}

Lesmerpanel.propTypes = {
  defaultApen: PT.bool,
  onOpen: PT.func,
  onClose: PT.func,
  intro: PT.node,
  children: PT.node.isRequired,
  id: PT.string,
  lukkTekst: PT.string.isRequired,
  apneTekst: PT.string.isRequired,
  className: PT.string,
  border: PT.bool,
};

Lesmerpanel.defaultProps = {
  defaultApen: false,
  onClose: () => {},
  onOpen: () => {},
  className: undefined,
  border: false,
  intro: undefined,
  id: undefined,
};

export default Lesmerpanel;
