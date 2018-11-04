import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import { deleteCodedValues, addCodedValue } from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteCodedValues: (codeListOid, deletedOids) =>
            dispatch(deleteCodedValues(codeListOid, deletedOids)),
        addCodedValue: (codeListOid, updateObj) =>
            dispatch(addCodedValue(codeListOid, updateObj))
    };
};

const mapStateToProps = state => {
    return {
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
        reviewMode: state.present.ui.main.reviewMode,
    };
};

class ConnectedCodedValueMenu extends React.Component {
  deleteCodedValue = () => {
      let codeListOid = this.props.codedValueMenuParams.codeListOid;
      let deletedOids = [this.props.codedValueMenuParams.oid];

      this.props.deleteCodedValues(codeListOid, deletedOids);
      this.props.onClose();
  };

  insertRecord = shift => () => {
      let params = this.props.codedValueMenuParams;
      let orderNumber =
      this.props.codeLists[params.codeListOid].itemOrder.indexOf(params.oid) +
      1 +
      shift;
      this.props.addCodedValue(params.codeListOid, {
          codedValue: '',
          orderNumber
      });
      this.props.onClose();
  };

  insertStdRecord = shift => () => {
      let params = this.props.codedValueMenuParams;
      let orderNumber =
      this.props.codeLists[params.codeListOid].itemOrder.indexOf(params.oid) +
      1 +
      shift;
      this.props.onShowCodedValueSelector(orderNumber)();
      this.props.onClose();
  };

  render() {
      let hasStandard = this.props.codedValueMenuParams.hasStandard;

      return (
          <React.Fragment>
              <Menu
                  id="itemMenu"
                  anchorEl={this.props.anchorEl}
                  open={Boolean(this.props.anchorEl)}
                  onClose={this.props.onClose}
                  PaperProps={{
                      style: {
                          width: 245
                      }
                  }}
              >
                  <MenuItem key="InsertAbove" onClick={this.insertRecord(0)} disabled={this.props.reviewMode}>
            Insert Above
                  </MenuItem>
                  <MenuItem key="InsertBelow" onClick={this.insertRecord(1)} disabled={this.props.reviewMode}>
            Insert Below
                  </MenuItem>
                  {hasStandard && (
                      [
                          <Divider key='Divider' />,
                          <MenuItem key='InsertStdAbove' onClick={this.insertStdRecord(0)} disabled={this.props.reviewMode}>
                Insert Std. Codes Above
                          </MenuItem>,
                          <MenuItem key='InsertStdBelow' onClick={this.insertStdRecord(1)} disabled={this.props.reviewMode}>
                Insert Std. Codes Below
                          </MenuItem>
                      ]
                  )}
                  <Divider />
                  <MenuItem key="Delete" onClick={this.deleteCodedValue} disabled={this.props.reviewMode}>
            Delete
                  </MenuItem>
              </Menu>
          </React.Fragment>
      );
  }
}

ConnectedCodedValueMenu.propTypes = {
    codedValueMenuParams: PropTypes.object.isRequired,
    onShowCodedValueSelector: PropTypes.func,
    reviewMode: PropTypes.bool,
};

const CodedValueMenu = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedCodedValueMenu
);
export default CodedValueMenu;
