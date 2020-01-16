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
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { BootstrapTable, ButtonGroup } from 'react-bootstrap-table';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';
import renderColumns from 'utils/renderColumns.js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import ResultDisplayOrderEditor from 'components/orderEditors/resultDisplayOrderEditor.js';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import ArmDescriptionEditor from 'editors/armDescriptionEditor.js';
import ArmDescriptionFormatter from 'formatters/armDescriptionFormatter.js';
import SelectColumns from 'components/utils/selectColumns.js';
import setScrollPosition from 'utils/setScrollPosition.js';
import ResultDisplayMenu from 'components/menus/resultDisplayMenu.js';
import menuButton from 'components/menus/menuButton.js';
import AddResultDisplay from 'components/tableActions/addResultDisplay.js';
import ToggleRowSelect from 'utils/toggleRowSelect.js';
import getColumnHiddenStatus from 'utils/getColumnHiddenStatus.js';
import getArmResultDisplayOids from 'utils/getArmResultDisplayOids.js';
import { getReviewCommentStats } from 'utils/reviewCommentUtils.js';
import {
    updateResultDisplay,
    deleteResultDisplays,
} from 'actions/index.js';

const styles = theme => ({
    buttonGroup: {
        marginLeft: theme.spacing(2),
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateResultDisplay: (updateObj) => dispatch(updateResultDisplay(updateObj)),
        deleteResultDisplays: (deleteObj) => dispatch(deleteResultDisplays(deleteObj)),
    };
};

const mapStateToProps = state => {
    return {
        analysisResultDisplays: state.present.odm.study.metaDataVersion.analysisResultDisplays,
        leafs: state.present.odm.study.metaDataVersion.leafs,
        stdConstants: state.present.stdConstants,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        tabs: state.present.ui.tabs,
        tabSettings: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab],
        showRowSelect: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].rowSelect['overall'],
        reviewMode: state.present.ui.main.reviewMode,
        reviewComments: state.present.odm.reviewComments,
    };
};

// Editor functions
function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={onUpdate} {...props}/>);
}

function descriptionEditor (onUpdate, props) {
    return (<ArmDescriptionEditor onUpdate={onUpdate} description={props.defaultValue} {...props}/>);
}

// Formatter functions
function descriptionFormatter (cell, row) {
    return (<ArmDescriptionFormatter description={cell} leafs={row.leafs}/>);
}

class ConnectedResultDisplayTable extends React.Component {
    constructor (props) {
        super(props);

        let columns = clone(props.stdConstants.columns.resultDisplays);

        // Menu is not shown when selection is triggered
        if (columns.hasOwnProperty('oid')) {
            columns.oid.hidden = this.props.showRowSelect;
        }

        const editorFormatters = {
            oid: {
                dataFormat: this.menuFormatter,
            },
            name: {
                customEditor: { getElement: simpleInputEditor,
                    customEditorParameters: { options:
                    {
                        checkForSpecialChars: { type: 'Note' },
                    }
                    } },
            },
            description: {
                dataFormat: descriptionFormatter,
                customEditor: { getElement: descriptionEditor },
            },
        };

        // Unite Columns with Editors and Formatters;
        Object.keys(columns).forEach(id => {
            columns[id] = { ...columns[id], ...editorFormatters[id] };
        });

        this.state = {
            columns,
            anchorEl: null,
            selectedRows: [],
            resultDisplaysMenuParams: {},
            showSelectColumn: false,
            showAddResultDisplay: false,
            insertPosition: null,
        };
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        let columns = getColumnHiddenStatus(prevState.columns, nextProps.tabSettings.columns, nextProps.showRowSelect);

        if (!deepEqual(columns, prevState.columns)) {
            return { columns };
        }
        return null;
    }

    componentDidMount () {
        setScrollPosition(this.props.tabs);
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && event.keyCode === 78 && !this.props.reviewMode) {
            this.setState({ showAddResultDisplay: true, insertPosition: null });
        }
    }

    menuFormatter = (cell, row) => {
        return menuButton({
            reviewCommentStats: row.reviewCommentStats,
            params: { resultDisplayOid: row.oid },
            handleMenuOpen: this.handleMenuOpen
        });
    }

    handleMenuOpen = (resultDisplaysMenuParams) => (event) => {
        this.setState({ resultDisplaysMenuParams, anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ resultDisplaysMenuParams: {}, anchorEl: null });
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        if (cellName === 'description') {
            // Action is handled within the editor
            return true;
        } else {
            // Update on if the value changed
            if (!deepEqual(row[cellName], cellValue)) {
                let updateObj = { oid: row.oid, updates: { [cellName]: cellValue } };
                this.props.updateResultDisplay(updateObj);
            }
            return true;
        }
    }

    cleanSelection = () => {
        if (this.state.selectedRows.length > 0) {
            this.setState({ selectedRows: [] });
        }
    }

    createCustomButtonGroup = props => {
        return (
            <ButtonGroup className={this.props.classes.buttonGroup}>
                <Grid container spacing={2}>
                    <Grid item>
                        <ToggleRowSelect oid='overall' disabled={this.props.reviewMode} cleanSelection={this.cleanSelection}/>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            color='default'
                            disabled={this.props.reviewMode}
                            onClick={ () => { this.setState({ showAddResultDisplay: true, insertPosition: null }); } }
                        >
                            Add
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='secondary'
                            onClick={this.deleteRows}
                            disabled={!this.props.showRowSelect || this.props.reviewMode}
                            variant='contained'
                        >
                            Delete
                        </Button>
                    </Grid>
                    <Grid item>
                        <ResultDisplayOrderEditor/>
                    </Grid>
                </Grid>
            </ButtonGroup>
        );
    }

    createCustomToolBar = props => {
        return (
            <Grid container spacing={2} justify='space-between'>
                <Grid item style={{ paddingLeft: '8px' }}>
                    { props.components.btnGroup }
                </Grid>
                <Grid item style={{ paddingRight: '25px' }}>
                    <Grid container spacing={2} justify='flex-end'>
                        <Grid item>
                            <Button variant="contained" color="default" onClick={ () => { this.setState({ showSelectColumn: true }); } }>
                                Columns
                                <RemoveRedEyeIcon style={{ marginLeft: '7px' }}/>
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    deleteRows = () => {
        let analysisResults = this.props.analysisResultDisplays.analysisResults;
        let resultDisplays = this.props.analysisResultDisplays.resultDisplays;
        let resultDisplayOids = this.state.selectedRows;
        const { commentOids, whereClauseOids, analysisResultOids, reviewCommentOids } = getArmResultDisplayOids(resultDisplays, analysisResults, resultDisplayOids);
        let deleteObj = {
            resultDisplayOids,
            analysisResultOids,
            commentOids,
            whereClauseOids,
            reviewCommentOids,
        };
        this.props.deleteResultDisplays(deleteObj);
        this.setState({ selectedRows: [] });
    }

    // Row Selection functions
    onRowSelected = (row, isSelected, event) => {
        let selectedRows = this.state.selectedRows;
        if (isSelected === true) {
            // If the item is going to be selected;
            if (!selectedRows.includes(row.oid)) {
                selectedRows.push(row.oid);
            }
        } else {
            // If the item is going to be removed;
            if (selectedRows.includes(row.oid)) {
                selectedRows.splice(selectedRows.indexOf(row.oid), 1);
            }
        }
        this.setState({ selectedRows });
        return true;
    }

    onAllRowSelected = (isSelected, rows, event) => {
        let selectedRows;
        if (isSelected === true) {
            // If all rows are going to be selected;
            selectedRows = rows
                .map(row => (row.oid));
        } else {
            selectedRows = [];
        }
        this.setState({ selectedRows });
        return true;
    }

    render () {
        let tableData = [];
        // Extract data required for the table
        const resultDisplays = this.props.analysisResultDisplays.resultDisplays;
        const resultDisplayOrder = this.props.analysisResultDisplays.resultDisplayOrder;
        resultDisplayOrder.forEach((resultDisplayOid, index) => {
            const resultDisplay = resultDisplays[resultDisplayOid];
            let row = {
                oid: resultDisplay.oid,
                name: resultDisplay.name,
                description: { descriptions: resultDisplay.descriptions, documents: resultDisplay.documents },
                leafs: this.props.leafs,
            };
            // Review comments
            if (resultDisplay.reviewCommentOids.length > 0) {
                row.reviewCommentStats = getReviewCommentStats(resultDisplay.reviewCommentOids, this.props.reviewComments);
            }
            tableData[index] = row;
        });

        // Editor settings
        const cellEditProp = {
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell
        };

        let selectRowProp;
        if (this.props.showRowSelect) {
            selectRowProp = {
                mode: 'checkbox',
                clickToSelect: true,
                onSelect: this.onRowSelected,
                onSelectAll: this.onAllRowSelected,
                columnWidth: '48px',
            };
        } else {
            selectRowProp = undefined;
        }

        const options = {
            toolBar: this.createCustomToolBar,
            btnGroup: this.createCustomButtonGroup
        };

        return (
            <React.Fragment>
                <BootstrapTable
                    data={tableData}
                    options={options}
                    search
                    striped
                    hover
                    remote={ true }
                    version='4'
                    cellEdit={this.props.reviewMode || this.props.showRowSelect ? undefined : cellEditProp}
                    keyBoardNav={this.props.showRowSelect ? false : { enterToEdit: true }}
                    headerStyle={{ backgroundColor: indigo[500], color: grey[200], fontSize: '16px' }}
                    selectRow={selectRowProp}
                >
                    {renderColumns(this.state.columns)}
                </BootstrapTable>
                { this.state.anchorEl !== null &&
                        <ResultDisplayMenu
                            onClose={this.handleMenuClose}
                            resultDisplaysMenuParams={this.state.resultDisplaysMenuParams}
                            anchorEl={this.state.anchorEl}
                            onAddVariable={ (orderNumber) => { this.setState({ showAddResultDisplay: true, insertPosition: orderNumber }); } }
                        />
                }
                { this.state.showSelectColumn && (
                    <SelectColumns
                        onClose={ () => { this.setState({ showSelectColumn: false }); } }
                    />
                )
                }
                { this.state.showAddResultDisplay && (
                    <AddResultDisplay
                        position={this.state.insertPosition}
                        onClose={ () => { this.setState({ showAddResultDisplay: false }); } }
                    />
                )
                }
            </React.Fragment>
        );
    }
}

ConnectedResultDisplayTable.propTypes = {
    analysisResultDisplays: PropTypes.object.isRequired,
    leafs: PropTypes.object.isRequired,
    stdConstants: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    reviewComments: PropTypes.object.isRequired,
    reviewMode: PropTypes.bool,
};
ConnectedResultDisplayTable.displayName = 'ResultDisplayTable';

const ResultDisplayTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedResultDisplayTable);
export default withStyles(styles)(ResultDisplayTable);
