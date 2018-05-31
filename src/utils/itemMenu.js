import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import getOid from 'utils/getOid.js';
import {
    deleteVariables, addValueList,
} from 'actions/index.js';

const styles = theme => ({
    editButton: {
        transform: 'translate(0%, -6%)',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addValueList    : (source, valueListOid, itemDefOid) => dispatch(addValueList(source, valueListOid, itemDefOid)),
        deleteVariables : (source, deleteObj) => dispatch(deleteVariables(source, deleteObj)),
    };
};

const mapStateToProps = state => {
    return {
        valueLists : state.odm.study.metaDataVersion.valueLists,
        itemDefs   : state.odm.study.metaDataVersion.itemDefs,
    };
};

class ConnectedItemMenu extends React.Component {

    deleteItem = () => {
        console.log(this.props.itemMenuParams);
        this.props.onClose();
    }

    insertAfter = () => {
        //
    }

    insertBefore = () => {
        //
    }

    addVlm = () => {
        let valueListOid = getOid('ValueList', undefined, Object.keys(this.props.valueLists));
        let itemDefOid = getOid('Item', undefined, Object.keys(this.props.itemDefs));
        let source = {
            oid: this.props.itemMenuParams.oid,
        };
        this.props.addValueList(source, valueListOid, itemDefOid);
        this.props.onClose();
    }

    orderVlm = () => {
        //
    }

    deleteVlm = () => {
        //
    }

    render() {
        const { hasVlm } = this.props.itemMenuParams;
        return (
            <Menu
                id="itemMenu"
                anchorEl={this.props.anchorEl}
                open={Boolean(this.props.anchorEl)}
                onClose={this.props.onClose}
                PaperProps={{
                    style: {
                        width: 200,
                    },
                }}
            >
                <MenuItem key='Delete' onClick={this.deleteItem}>
                    Delete
                </MenuItem>
                <Divider/>
                <MenuItem key='InsertBefore' onClick={this.insertBefore}>
                    Insert Before
                </MenuItem>
                <MenuItem key='InsertAfter' onClick={this.insertAfter}>
                    Insert After
                </MenuItem>
                <Divider/>
                { hasVlm ? (
                    <React.Fragment>
                        <MenuItem key='OrderVlm' onClick={this.orderVlm}>
                            Order VLM
                        </MenuItem>
                        <MenuItem key='DeleteVlm' onClick={this.deleteVlm}>
                            Delete VLM
                        </MenuItem>
                    </React.Fragment>
                ) : (
                    <MenuItem key='AddVlm' onClick={this.addVlm}>
                        Add VLM
                    </MenuItem>
                )
                }
            </Menu>
        );
    }
}

ConnectedItemMenu.propTypes = {
    itemMenuParams: PropTypes.object.isRequired,
};

const ItemMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedItemMenu);
export default withStyles(styles)(ItemMenu);
