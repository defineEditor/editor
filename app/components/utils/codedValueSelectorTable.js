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
import { withStyles, makeStyles } from '@material-ui/core/styles';
import GeneralTable from 'components/utils/generalTable.js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import SearchInTable from 'components/utils/searchInTable.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import { getGeneralTableDataFromCodeList } from 'utils/codeListUtils.js';

const styles = theme => ({
    root: {
        display: 'flex',
        width: '100%',
        overflowX: 'auto'
    },
    codeListTable: {
        marginTop: theme.spacing(5)
    },
    tableBody: {
        width: '100%',
        height: '95%',
        display: 'flex',
    },
    table: {
        minWidth: 100
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing(1)
    },
    iconButton: {
        marginLeft: '0px',
        marginRight: '0px',
        marginBottom: '8px'
    }
});

const getClasses = makeStyles(theme => ({
    toolbar: {
        width: '100%',
    },
    selector: {
        width: '100%',
    },
    searchField: {
        marginTop: '0',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    searchInput: {
        paddingTop: '9px',
        paddingBottom: '9px',
        color: '#FFFFFF',
    },
    searchLabel: {
        transform: 'translate(10px, 10px)',
    },
}));

class CodedValueSelectorTable extends React.Component {
    constructor (props) {
        super(props);

        let codeListTitle = '';
        let codeListType = '';
        let data = [];
        let header = [];

        if (this.props.sourceCodeList !== undefined) {
            ({ codeListTitle, codeListType, data, header } = getGeneralTableDataFromCodeList(this.props.sourceCodeList, this.props.defineVersion));
        }
        let currentData = data;

        // Mark all items from the source codelist which are already present in the destination codelist
        if (this.props.codeList !== undefined && this.props.sourceCodeList !== undefined) {
            let existingCodes = getCodedValuesAsArray(this.props.codeList);
            let disabledOids = this.props.sourceCodeList.itemOrder.filter(oid => {
                let sourceItems;
                if (this.props.sourceCodeList.codeListType === 'decoded') {
                    sourceItems = this.props.sourceCodeList.codeListItems;
                } else if (this.props.sourceCodeList.codeListType === 'enumerated') {
                    sourceItems = this.props.sourceCodeList.enumeratedItems;
                }
                if (existingCodes.includes(sourceItems[oid].codedValue)) {
                    return true;
                } else {
                    return false;
                }
            });

            data.forEach(row => {
                if (disabledOids.includes(row.oid)) {
                    row.__disableSelection = true;
                }
            });
        }

        this.state = {
            codeListTitle,
            codeListType,
            data,
            currentData,
            header,
            selected: [],
        };
    }

    CodeListToolbar = () => {
        let classes = getClasses();

        return (
            <Grid container justify='space-between' alignItems='center' wrap='nowrap' className={classes.toolbar}>
                <Grid item className={classes.selector}>
                    { this.props.codeListSelector !== undefined && (this.props.codeListSelector()) }
                </Grid>
                <Grid item>
                    <SearchInTable
                        data={this.state.data}
                        header={this.state.header}
                        onDataUpdate={this.handleSetCurrentData}
                        classes={classes}
                        margin='dense'
                    />
                </Grid>
            </Grid>
        );
    };

    handleSetCurrentData = (updatedData) => {
        this.setState({ currentData: updatedData });
    }

    handleAddCodedValues = () => {
        this.props.onAdd(this.state.selected);
    };

    handleSetSelected = (selected) => {
        this.setState({ selected });
    };

    render () {
        const { classes } = this.props;
        const { header, currentData } = this.state;
        return (
            <Grid container spacing={0} className={classes.codeListTable} direction='column' wrap='nowrap'>
                <Grid item className={classes.tableBody}>
                    <GeneralTable
                        data={currentData}
                        header={header}
                        pagination
                        selection = {{ selected: this.state.selected, setSelected: this.handleSetSelected }}
                        disableToolbar
                        customToolbar={this.CodeListToolbar}
                        initialRowsPerPage={50}
                        rowsPerPageOptions={[50, 100, 250]}
                    />
                </Grid>
                <Grid item>
                    <Grid container spacing={0} justify='flex-end'>
                        <Grid item>
                            <Button onClick={this.handleAddCodedValues} color="primary" disabled={this.state.selected.length === 0}>
                                { this.props.addLabel || `Add items`}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button onClick={this.props.onClose} color="primary">
                                Close
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

CodedValueSelectorTable.propTypes = {
    classes: PropTypes.object.isRequired,
    sourceCodeList: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    onAdd: PropTypes.func.isRequired,
    addLabel: PropTypes.string,
    onClose: PropTypes.func,
    codeList: PropTypes.object,
    codeListSelector: PropTypes.func,
};

export default withStyles(styles)(CodedValueSelectorTable);
