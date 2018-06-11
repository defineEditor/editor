import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {
    deleteCodeLists
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteCodeLists: (deleteObj) => dispatch(deleteCodeLists(deleteObj)),
    };
};

const mapStateToProps = state => {
    return {
        codeLists: state.odm.study.metaDataVersion.codeLists,
    };
};

class ConnectedCodeListMenu extends React.Component {

    deleteCodeList = () => {
        let codeLists = this.props.codeLists;
        let codeListOids = [this.props.codeListMenuParams.codeListOid];
        // Get the list of ItemOIDs for which the codelists should be removed;
        let itemDefOids = [];
        codeListOids.forEach(codeListOid => {
            codeLists[codeListOid].sources.itemDefs.forEach( itemDefOid => {
                itemDefOids.push(itemDefOid);
            });
        });
        let deleteObj = {
            codeListOids,
            itemDefOids,
        };
        this.props.deleteCodeLists(deleteObj);
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
                    <MenuItem key='Delete' onClick={this.deleteCodeList}>
                        Delete
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedCodeListMenu.propTypes = {
    codeListMenuParams : PropTypes.object.isRequired,
    codeLists          : PropTypes.object.isRequired,
};

const CodeListMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListMenu);
export default CodeListMenu;
