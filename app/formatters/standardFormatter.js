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
import Checkbox from '@material-ui/core/Checkbox';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';
import getModelFromStandard from 'utils/getModelFromStandard.js';

const styles = theme => ({
    mainPart: {
        padding: 16,
        marginTop: theme.spacing(1),
    },
    checkBox: {
        marginLeft: theme.spacing(4),
    },
});

class StandardFormatter extends React.Component {
    getStandards = (isAdam) => {
        let standards = this.props.standards;
        let ctList = Object.keys(standards)
            .filter(standardOid => {
                return !(standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT');
            })
            .map(standardOid => {
                return (
                    <TableRow key={standardOid}>
                        <TableCell>
                            {standards[standardOid].name}
                        </TableCell>
                        <TableCell>
                            {standards[standardOid].version}
                        </TableCell>
                        { isAdam &&
                                <TableCell>
                                    <Checkbox
                                        disabled
                                        checked={this.props.hasArm}
                                        value="hasArm"
                                        className={this.props.classes.checkBox}
                                    />
                                </TableCell>
                        }
                    </TableRow>
                );
            });
        return ctList;
    };

    render () {
        const { classes } = this.props;
        const standard = Object.values(this.props.standards).filter(std => (std.isDefault === 'Yes'))[0].name;
        const isAdam = (getModelFromStandard(standard) === 'ADaM');

        return (
            <Paper className={classes.mainPart} elevation={4}>
                <Typography variant="h5">
                    Standard
                    <FormattingControlIcons onEdit={this.props.onEdit} onComment={this.props.onComment} helpId='STD_STANDARD'/>
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Version</TableCell>
                            { isAdam &&
                                    <TableCell>Analysis Results Metadata</TableCell>
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.getStandards(isAdam)}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

StandardFormatter.propTypes = {
    standards: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    hasArm: PropTypes.bool.isRequired,
    onComment: PropTypes.func,
};

export default withStyles(styles)(StandardFormatter);
