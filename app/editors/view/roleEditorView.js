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
import Grid from '@material-ui/core/Grid';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';

const styles = theme => ({
    textField: {
        width: '90px',
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
});

class RoleEditorView extends React.Component {
    render () {
        const { classes } = this.props;

        return (
            <Grid container spacing={0} alignItems='flex-end'>
                <Grid item xs={12}>
                    <SimpleSelectEditor
                        label='Role'
                        autoFocus
                        options={this.props.variableRoles}
                        defaultValue={this.props.role}
                        onUpdate={this.props.onChange('role')}
                        className={classes.textField}
                        optional
                    />
                </Grid>
                <Grid item xs={12}>
                    <SimpleSelectEditor
                        label='Role Codelist'
                        defaultValue={this.props.roleCodeListOid}
                        options={this.props.codeListList}
                        onUpdate={this.props.onChange('roleCodeListOid')}
                        className={classes.textField}
                        optional
                    />
                </Grid>
            </Grid>
        );
    }
}

RoleEditorView.propTypes = {
    classes: PropTypes.object.isRequired,
    role: PropTypes.string.isRequired,
    roleCodeListOid: PropTypes.string.isRequired,
    variableRoles: PropTypes.array.isRequired,
    codeListList: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(RoleEditorView);
