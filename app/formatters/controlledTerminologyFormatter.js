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
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';

const styles = theme => ({
    mainPart: {
        padding: 16,
        marginTop: theme.spacing.unit,
    },
});

class ControlledTerminologyFormatter extends React.Component {
    getControlledTerminologies = () => {
        let standards = this.props.standards;
        let stdCodeLists = this.props.stdCodeLists;
        let ctList = this.props.standardOrder
            .filter(standardOid => {
                return (standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT');
            })
            .map(standardOid => {
                let codeListCount = stdCodeLists.hasOwnProperty(standardOid) ? Object.keys(stdCodeLists[standardOid].nciCodeOids).length : 'Not loaded';
                return (
                    <TableRow key={standardOid}>
                        <TableCell>
                            {standards[standardOid].publishingSet}
                        </TableCell>
                        <TableCell>
                            {standards[standardOid].version}
                        </TableCell>
                        <TableCell>
                            {codeListCount}
                        </TableCell>
                    </TableRow>
                );
            });
        return ctList;
    };

    render () {
        const { classes } = this.props;

        return (
            <Paper className={classes.mainPart} elevation={4}>
                <Typography variant="headline" component="h3">
                    Controlled Terminology
                    <FormattingControlIcons onEdit={this.props.onEdit} onComment={this.props.onComment} />
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Model</TableCell>
                            <TableCell>Version</TableCell>
                            <TableCell># Codelists</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.getControlledTerminologies()}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

ControlledTerminologyFormatter.propTypes = {
    standards: PropTypes.object.isRequired,
    standardOrder: PropTypes.array.isRequired,
    stdCodeLists: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onComment: PropTypes.func,
};

export default withStyles(styles)(ControlledTerminologyFormatter);
