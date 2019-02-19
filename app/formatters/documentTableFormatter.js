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
import path from 'path';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';
import { ipcRenderer } from 'electron';

const styles = theme => ({
    mainPart: {
        padding: 16,
        marginTop: theme.spacing.unit * 3,
    },
    typeColumn: {
        width: '20%',
    },
});

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.primary.main,
        color: '#EEEEEE',
        fontSize: 16,
        fontWeight: 'bold',
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

class DocumentTableFormatter extends React.Component {
    openPdf = (event) => {
        event.preventDefault();
        ipcRenderer.send('openDocument', path.dirname(this.props.pathToDefine), event.target.attributes[0].value);
    }

    getDocuments = () => {
        let leafs = this.props.leafs;

        const createRow = (leafId) => {
            return (
                <TableRow key={leafId}>
                    <CustomTableCell>
                        {this.props.documentTypes.typeLabel[leafs[leafId].type]}
                    </CustomTableCell>
                    <CustomTableCell>
                        <a href={leafs[leafId].href} onClick={this.openPdf}>{leafs[leafId].title}</a>
                    </CustomTableCell>
                </TableRow>
            );
        };

        let docList = this.props.leafOrder.map(createRow);
        return docList;
    };

    render () {
        const { classes } = this.props;

        return (
            <Paper className={classes.mainPart} elevation={4}>
                <Typography variant="headline" component="h3">
                    Documents
                    <FormattingControlIcons onEdit={this.props.onEdit} onComment={this.props.onComment} />
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <CustomTableCell className={classes.typeColumn}>Type</CustomTableCell>
                            <CustomTableCell>Document</CustomTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.getDocuments()}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

DocumentTableFormatter.propTypes = {
    leafs: PropTypes.object.isRequired,
    leafOrder: PropTypes.array.isRequired,
    documentTypes: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    pathToDefine: PropTypes.string,
    onComment: PropTypes.func,
};

export default withStyles(styles)(DocumentTableFormatter);
