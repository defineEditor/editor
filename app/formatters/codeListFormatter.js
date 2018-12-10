/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Grid from '@material-ui/core/Grid';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import getCodeListData from 'utils/getCodeListData.js';
import { selectGroup } from 'actions/index.js';

const styles = theme => ({
    root: {
        width     : '100%',
        marginTop : theme.spacing.unit * 3,
        overflowX : 'auto',
    },
    codeListTable: {
        marginTop: theme.spacing.unit,
    },
    table: {
        minWidth: 100,
    },
    icon: {
        transform: 'translate(0, -5%)',
    },
    title: {
        flexWrap: 'nowrap',
    }
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        codeLists           : state.present.odm.study.metaDataVersion.codeLists,
        defineVersion       : state.present.odm.study.metaDataVersion.defineVersion,
        codedValuesTabIndex : state.present.ui.tabs.tabNames.indexOf('Coded Values'),
    };
};


class ConnectedCodeListFormatter extends React.Component {

    editCodeListValues = () => {
        let updateObj = {
            tabIndex       : this.props.codedValuesTabIndex,
            groupOid       : this.props.codeListOid,
            scrollPosition : {},
        };
        this.props.selectGroup(updateObj);
        this.props.onClose();
    }

    getCodeListTable(codeList, defineVersion, classes) {
        let {codeListTable, codeListTitle, isDecoded, isRanked, isCcoded} = getCodeListData(codeList, defineVersion);

        return(
            <Grid container spacing={0} className={classes.codeListTable}>
                <Grid item xs={12}>
                    <Grid container spacing={0} alignItems='center' className={classes.title}>
                        <Grid item>
                            <Typography variant="title">
                                {codeListTitle}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <IconButton color='default' onClick={this.editCodeListValues} className={classes.icon}>
                                <EditIcon/>
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Code</TableCell>
                                {isDecoded && <TableCell>Decode</TableCell>}
                                {isCcoded && <TableCell>C-Code</TableCell>}
                                {isRanked && <TableCell>Rank</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {codeListTable.map( code => {
                                return (
                                    <TableRow key={code.oid}>
                                        <TableCell>{code.value}</TableCell>
                                        {isDecoded && <TableCell>{code.decode}</TableCell>}
                                        {isCcoded && <TableCell>{code.ccode}</TableCell>}
                                        {isRanked && <TableCell>{code.rank}</TableCell>}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>
        );
    }

    render () {
        const { codeListOid, codeLists, defineVersion, classes } = this.props;
        const codeList = codeLists[codeListOid];
        return (
            <div className={classes.root}>
                {this.getCodeListTable(codeList, defineVersion, classes)}
            </div>
        );
    }
}

ConnectedCodeListFormatter.propTypes = {
    codeListOid         : PropTypes.string.isRequired,
    codeLists           : PropTypes.object.isRequired,
    defineVersion       : PropTypes.string.isRequired,
    codedValuesTabIndex : PropTypes.number.isRequired,
    selectGroup         : PropTypes.func.isRequired,
    onClose             : PropTypes.func.isRequired,
};

const CodeListFormatter = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListFormatter);
export default withStyles(styles)(CodeListFormatter);
