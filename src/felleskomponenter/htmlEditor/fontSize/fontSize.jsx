import { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import Dropdown from "./dropdown";
import DropdownOption from "./dropdownOption";

// Ble nødvendig når vi introduserte utkast. Pga pt istedenfor px, ville ikke Editor
// lese korrekt størrelse ved henting av utkast. Lagde derfor egen component.
// Komponenten mapper mellom pt og px slik at saksbehandler kan forholde seg til pt.
// Dette løser også problemet med at valgt pt ikke vistes som "valgt størrelse".
export default class FontSize extends Component {
  state = {
    defaultFontSize: undefined,
  };

  componentDidMount() {
    const editorElm = document.getElementsByClassName("DraftEditor-root");
    if (editorElm && editorElm.length > 0) {
      const editorStyles = window.getComputedStyle(editorElm[0]);
      let defaultFontSize = editorStyles.getPropertyValue("font-size");
      defaultFontSize = defaultFontSize.substring(0, defaultFontSize.length - 2);
      this.setState({
        defaultFontSize,
      });
    }
  }

  finnPXVerdi = (ptVerdi) => {
    switch (ptVerdi) {
      case 11:
        return 15;
      case 12:
        return 16;
      case 14:
        return 19;
      case 16:
        return 22;
      default:
        return ptVerdi;
    }
  };

  finnPTVerdi = (pxVerdi) => {
    switch (pxVerdi) {
      case 15:
        return 11;
      case 16:
        return 12;
      case 19:
        return 14;
      case 22:
        return 16;
      default:
        return pxVerdi;
    }
  };

  onChange = (fontSizePT) => {
    const fontSizePX = this.finnPXVerdi(fontSizePT);
    this.props.onChange(fontSizePX || fontSizePT);
  };

  render() {
    const {
      config: { icon, className, dropdownClassName, options },
      expanded,
      doCollapse,
      onExpandEvent,
      doExpand,
    } = this.props;
    let {
      currentState: { fontSize: currentFontSizePX },
    } = this.props;
    let { defaultFontSize } = this.state;
    defaultFontSize = Number(defaultFontSize);
    currentFontSizePX = currentFontSizePX || (options && options.indexOf(defaultFontSize) >= 0 && defaultFontSize);
    const currentFontSizePT = this.finnPTVerdi(currentFontSizePX);

    return (
      <div className="rdw-fontsize-wrapper" aria-label="rdw-font-size-control">
        <Dropdown
          className={classNames("rdw-fontsize-dropdown", className)}
          optionWrapperClassName={classNames(dropdownClassName)}
          onChange={this.onChange}
          expanded={expanded}
          doExpand={doExpand}
          doCollapse={doCollapse}
          onExpandEvent={onExpandEvent}
          title="Font Size"
        >
          {currentFontSizePT ? <span>{currentFontSizePT}</span> : <img src={icon} alt="" />}
          {options.map((size) => (
            <DropdownOption className="rdw-fontsize-option" active={currentFontSizePT === size} value={size} key={size}>
              {size}
            </DropdownOption>
          ))}
        </Dropdown>
      </div>
    );
  }
}

FontSize.propTypes = {
  expanded: PropTypes.bool,
  onExpandEvent: PropTypes.func.isRequired,
  doExpand: PropTypes.func.isRequired,
  doCollapse: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  currentState: PropTypes.object,
};

FontSize.defaultProps = {
  expanded: false,
  currentState: {},
};
