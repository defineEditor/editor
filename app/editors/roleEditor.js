/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import SaveCancel from 'editors/saveCancel.js';
import RoleEditorView from 'editors/view/roleEditorView.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import {
    updateItemRef
} from 'actions/index.js';

const styles = theme => ({
    root: {
        outline: 'none',
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        variableRoles: state.present.stdConstants.variableRoles,
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateItemRef: (source, updateObj) => dispatch(updateItemRef(source, updateObj)),
    };
};

class ConnectedRoleEditor extends React.Component {
    constructor (props) {
        super(props);

        let role;
        if (props.roleAttrs.role === undefined) {
            role = '';
        } else {
            role = props.roleAttrs.role;
        }

        let roleCodeListOid;
        if (props.roleAttrs.roleCodeListOid === undefined) {
            roleCodeListOid = '';
        } else {
            roleCodeListOid = props.roleAttrs.roleCodeListOid;
        }

        let variableRoles;
        if (roleCodeListOid !== '' && Object.keys(props.codeLists).includes(props.roleAttrs.roleCodeListOid)) {
            variableRoles = getCodedValuesAsArray(props.codeLists[props.roleAttrs.roleCodeListOid]);
        } else {
            variableRoles = props.variableRoles;
        }

        // Get a list of all codeLists;
        let codeListList = {};
        Object.keys(props.codeLists).forEach(codeListOid => {
            if (props.codeLists[codeListOid].dataType === 'text') {
                codeListList[codeListOid] = props.codeLists[codeListOid].name + ' (' + codeListOid + ')';
            }
        });

        this.state = {
            role,
            roleCodeListOid,
            variableRoles,
            codeListList,
        };
    }

    handleChange = name => value => {
        if (name === 'role') {
            this.setState({ [name]: value });
        } else if (name === 'roleCodeListOid') {
            let roleCodeListOid = value;
            let variableRoles;
            if (roleCodeListOid !== undefined && Object.keys(this.props.codeLists).includes(roleCodeListOid)) {
                variableRoles = getCodedValuesAsArray(this.props.codeLists[roleCodeListOid]);
            } else {
                variableRoles = this.props.variableRoles;
            }
            this.setState({
                roleCodeListOid,
                variableRoles,
            });
        }
    };

    save = () => {
        let updateObj = {};
        if (this.state.role !== '') {
            updateObj.role = this.state.role;
            // Per ODM 1.3.2 roleCodeListOid is provided only if the role is populated
            if (this.state.roleCodeListOid !== '') {
                updateObj.roleCodeListOid = this.state.roleCodeListOid;
            } else {
                updateObj.roleCodeListOid = undefined;
            }
        } else {
            updateObj.role = undefined;
        }
        this.props.updateItemRef(this.props.source, updateObj);
        this.props.onFinished();
    }

    cancel = () => {
        this.props.onFinished();
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render () {
        const { classes } = this.props;

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                className={classes.root}
            >
                <Grid container spacing={8} alignItems='center'>
                    <Grid item xs={12}>
                        <RoleEditorView
                            role={this.state.role}
                            roleCodeListOid={this.state.roleCodeListOid}
                            variableRoles={this.state.variableRoles}
                            codeListList={this.state.codeListList}
                            onChange={this.handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <SaveCancel mini icon save={this.save} cancel={this.cancel} />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedRoleEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    roleAttrs: PropTypes.object.isRequired,
    source: PropTypes.object.isRequired,
    variableRoles: PropTypes.array.isRequired,
    onFinished: PropTypes.func.isRequired,
};

const RoleEditor = connect(mapStateToProps, mapDispatchToProps)(ConnectedRoleEditor);
export default withStyles(styles)(RoleEditor);
