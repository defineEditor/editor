import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {
    deleteCodedValues,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteCodedValues: (codeListOid, deletedOids) => dispatch(deleteCodedValues(codeListOid, deletedOids)),
    };
};

class ConnectedCodedValueMenu extends React.Component {

    deleteCodedValue = () => {
        let codeListOid = this.props.codedValueMenuParams.codeListOid;
        let deletedOids = [this.props.codedValueMenuParams.oid];

        this.props.deleteCodedValues(codeListOid, deletedOids);
        this.props.onClose();
    }

    render() {

        return (
            <React.Fragment>
                <Menu
                    id="itemMenu"
                    anchorEl={this.props.anchorEl}
                    open={Boolean(this.props.anchorEl)}
                    onClose={this.props.onClose}
                    PaperProps={{
                        style: {
                            width: 245,
                        },
                    }}
                >
                    <MenuItem key='Delete' onClick={this.deleteCodedValue}>
                        Delete
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedCodedValueMenu.propTypes = {
    codedValueMenuParams: PropTypes.object.isRequired,
};

const CodedValueMenu = connect(undefined, mapDispatchToProps)(ConnectedCodedValueMenu);
export default CodedValueMenu;
