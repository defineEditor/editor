import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import CodeListMenu from 'utils/codeListMenu.js';
import ToggleRowSelect from 'utils/toggleRowSelect.js';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';
import renderColumns from 'utils/renderColumns.js';
import AddCodeListEditor from 'editors/addCodeListEditor.js';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import CodeListFormatNameEditor from 'editors/codeListFormatNameEditor.js';
import CodeListStandardEditor from 'editors/codeListStandardEditor.js';
import SelectColumns from 'utils/selectColumns.js';
import setScrollPosition from 'utils/setScrollPosition.js';
import {
    updateCodeList,
    updateCodeListStandard,
    deleteCodeLists,
} from 'actions/index.js';

const styles = theme => ({
    buttonGroup: {
        marginLeft: theme.spacing.unit * 2,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodeList         : (oid, updateObj) => dispatch(updateCodeList(oid, updateObj)),
        updateCodeListStandard : (oid, updateObj) => dispatch(updateCodeListStandard(oid, updateObj)),
        deleteCodeLists        : (deleteObj) => dispatch(deleteCodeLists(deleteObj)),
    };
};

const mapStateToProps = state => {
    return {
        codeLists     : state.odm.study.metaDataVersion.codeLists,
        standards     : state.odm.study.metaDataVersion.standards,
        stdCodeLists  : state.stdCodeLists,
        stdConstants  : state.stdConstants,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        tabs          : state.ui.tabs,
        tabSettings   : state.ui.tabs.settings[state.ui.tabs.currentTab],
        showRowSelect : state.ui.tabs.settings[state.ui.tabs.currentTab].rowSelect['overall'],
    };
};

// Editor functions
function codeListStandardEditor (onUpdate, props) {
    return (<CodeListStandardEditor onUpdate={onUpdate} {...props}/>);
}

function codeListFormatNameEditor (onUpdate, props) {
    return (<CodeListFormatNameEditor onUpdate={onUpdate} {...props}/>);
}

function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={onUpdate} {...props}/>);
}

function simpleSelectEditor (onUpdate, props) {
    return (<SimpleSelectEditor onUpdate={onUpdate} {...props}/>);
}

// Formatter functions
function codeListStandardFormatter (cell, row) {
    if (row.standardDescription !== undefined) {
        return (<div>{row.standardDescription} <br/> {cell.cdiscSubmissionValue}</div>);
    }
}

function codeListTypeFormatter (cell, row) {
    if (cell !== undefined) {
        let typeDecode;
        row.stdConstants.codeListTypes.some( type => {
            if (type.hasOwnProperty(cell)) {
                typeDecode = type[cell];
                return true;
            }
            return false;
        });
        return (typeDecode);
    }
}

class ConnectedCodeListTable extends React.Component {
    constructor(props) {
        super(props);

        // Get list of codelists with decodes for linked codelist selection;
        const codeListWithDecodes = Object.keys(props.codeLists).filter( codeListOid => {
            return props.codeLists[codeListOid].getCodeListType() === 'decoded';
        }).map( codeListOid => {
            return props.codeLists[codeListOid].name;
        });


        let columns = clone(props.stdConstants.columns.codeLists);

        // Variables menu is not shown when selection is triggered
        if (columns.hasOwnProperty('oid')) {
            columns.oid.hidden = this.props.showRowSelect;
        }

        const editorFormatters = {
            oid: {
                dataFormat: this.menuFormatter,
            },
            name: {
                customEditor: {getElement: simpleInputEditor},
            },
            codeListType: {
                dataFormat   : codeListTypeFormatter,
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: props.stdConstants.codeListTypes}},
            },
            dataType: {
                customEditor: {getElement: simpleSelectEditor, customEditorParameters: {options: props.stdConstants.dataTypes}},
            },
            formatName: {
                customEditor: {getElement: codeListFormatNameEditor},
            },
            linkedCodeList: {
                customEditor: {getElement: simpleSelectEditor, customEditorParameters: {options: codeListWithDecodes, optional: true}},
            },
            standardData: {
                dataFormat   : codeListStandardFormatter,
                customEditor : {getElement: codeListStandardEditor},
            },
        };

        // Unite Columns with Editors and Formatters;
        Object.keys(columns).forEach( id => {
            columns[id] = { ...columns[id], ...editorFormatters[id] };
        });

        this.state = {
            columns,
            anchorEl           : null,
            selectedRows       : [],
            codeListMenuParams : {},
            showSelectColumn   : false,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let columns = { ...prevState.columns };
        // Handle switch between selection/no selection
        if (nextProps.showRowSelect !== prevState.columns.oid.hidden) {
            columns = { ...columns, oid: { ...columns.oid, hidden: nextProps.showRowSelect } };
        }
        Object.keys(nextProps.tabSettings.columns).forEach(columnName => {
            let columnSettings = nextProps.tabSettings.columns[columnName];
            if ( columns.hasOwnProperty(columnName) && columnSettings.hidden !== columns[columnName].hidden) {
                columns = { ...columns, [columnName]: { ...columns[columnName], hidden: columnSettings.hidden } };
            }
        });

        if (!deepEqual(columns, prevState.columns)) {
            return { columns };
        }
        return null;
    }

    componentDidMount() {
        setScrollPosition(this.props.tabs);
    }

    menuFormatter = (cell, row) => {
        let codeListMenuParams = {
            codeListOid: row.oid,
        };
        return (
            <IconButton
                onClick={this.handleMenuOpen(codeListMenuParams)}
                className={this.props.classes.menuButton}
                color='default'
            >
                <MoreVertIcon/>
            </IconButton>
        );
    }

    handleMenuOpen = (codeListMenuParams) => (event) => {
        this.setState({ codeListMenuParams, anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ codeListMenuParams: {}, anchorEl: null });
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (!deepEqual(row[cellName], cellValue)) {

            let updateObj = {};
            if (cellName === 'linkedCodeList') {
                // Find codelistId by name
                updateObj['linkedCodeListOid'] = undefined;
                Object.keys(this.props.codeLists).some( codeListOid => {
                    if (this.props.codeLists[codeListOid].name === cellValue) {
                        updateObj['linkedCodeListOid'] = codeListOid;
                        return true;
                    } else {
                        return false;
                    }
                });
            } else if (cellName === 'standardData') {
                if (!deepEqual(cellValue, row[cellName])) {
                    updateObj = { ...cellValue };
                    if (cellValue.standardOid !== undefined && cellValue.alias !== undefined) {
                        let standardCodeListOid = this.props.stdCodeLists[cellValue.standardOid].nciCodeOids[cellValue.alias.name];
                        updateObj.standardCodeList = this.props.stdCodeLists[cellValue.standardOid].codeLists[standardCodeListOid];
                    }
                    this.props.updateCodeListStandard(row.oid, updateObj);
                }
            } else {
                updateObj[cellName] = cellValue;
                this.props.updateCodeList(row.oid, updateObj);
            }

        }
        return true;
    }

    createCustomButtonGroup = props => {
        return (
            <ButtonGroup className={this.props.classes.buttonGroup}>
                <Grid container spacing={16}>
                    <Grid item>
                        <ToggleRowSelect oid='overall'/>
                    </Grid>
                    <Grid item>
                        <AddCodeListEditor/>
                    </Grid>
                    <Grid item>
                        <Button
                            color='secondary'
                            mini
                            onClick={this.deleteRows}
                            disabled={!this.props.showRowSelect}
                            variant='raised'
                        >
                            Delete
                        </Button>
                    </Grid>
                </Grid>
            </ButtonGroup>
        );
    }

    createCustomToolBar = props => {
        return (
            <Grid container spacing={16} justify='space-between'>
                <Grid item style={{paddingLeft: '8px'}}>
                    { props.components.btnGroup }
                </Grid>
                <Grid item>
                    <Grid container spacing={16} justify='flex-end'>
                        <Grid item>
                            <Button variant="raised" color="default" onClick={ () => { this.setState({ showSelectColumn: true }); } }>
                                Columns
                                <RemoveRedEyeIcon style={{marginLeft: '7px'}}/>
                            </Button>
                        </Grid>
                        <Grid item style={{paddingRight: '25px'}}>
                            { props.components.searchPanel }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    deleteRows = () => {
        let codeLists = this.props.codeLists;
        let codeListOids = this.state.selectedRows;
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
                selectedRows.splice(selectedRows.indexOf(row.oid),1);
            }
        }
        this.setState({selectedRows});
        return true;
    }

    onAllRowSelected = (isSelected, rows, event) => {
        let selectedRows;
        if (isSelected === true) {
            // If all rows are going to be selected;
            selectedRows = rows
                .map( row => (row.oid));
        } else {
            selectedRows = [];
        }
        this.setState({selectedRows});
        return true;
    }

    render () {
        let codeLists = [];
        // Extract data required for the dataset table
        const codeListsRaw = this.props.codeLists;
        Object.keys(codeListsRaw).forEach((codeListOid, index) => {
            const originCL = codeListsRaw[codeListOid];
            let currentCL = {
                oid            : originCL.oid,
                name           : originCL.name,
                dataType       : originCL.dataType,
                codeListType   : originCL.codeListType,
                formatName     : originCL.formatName,
                orderNumber    : originCL.orderNumber,
                linkedCodeList : originCL.linkedCodeListOid !== undefined ? codeListsRaw[originCL.linkedCodeListOid].name : undefined,
                defineVersion  : this.props.defineVersion,
                stdConstants   : this.props.stdConstants,
            };
            currentCL.standardData = {
                alias                : originCL.alias,
                standardOid          : originCL.standardOid,
                cdiscSubmissionValue : originCL.cdiscSubmissionValue,
            };
            if (originCL.standardOid !== undefined && this.props.standards.hasOwnProperty(originCL.standardOid)) {
                let standard = this.props.standards[originCL.standardOid];
                currentCL.standardDescription = standard.name + ' ' + standard.publishingSet + ' ver. ' + standard.version;
            } else {
                currentCL.standardDescription = undefined;
            }
            codeLists[index] = currentCL;
        });

        // Editor settings
        const cellEditProp = {
            mode           : 'dbclick',
            blurToSave     : true,
            beforeSaveCell : this.onBeforeSaveCell
        };

        let selectRowProp;
        if (this.props.showRowSelect) {
            selectRowProp = {
                mode        : 'checkbox',
                onSelect    : this.onRowSelected,
                onSelectAll : this.onAllRowSelected,
                columnWidth : '48px',
            };
        } else {
            selectRowProp = undefined;
        }

        const options = {
            toolBar  : this.createCustomToolBar,
            btnGroup : this.createCustomButtonGroup
        };


        return (
            <React.Fragment>
                <BootstrapTable
                    data={codeLists}
                    options={options}
                    search
                    striped
                    hover
                    version='4'
                    cellEdit={cellEditProp}
                    keyBoardNav={this.props.showRowSelect ? false : {enterToEdit: true}}
                    headerStyle={{backgroundColor: indigo[500], color: grey[200], fontSize: '16px'}}
                    selectRow={selectRowProp}
                >
                    {renderColumns(this.state.columns)}
                </BootstrapTable>
                <CodeListMenu onClose={this.handleMenuClose} codeListMenuParams={this.state.codeListMenuParams} anchorEl={this.state.anchorEl}/>
                { this.state.showSelectColumn && (
                    <SelectColumns
                        onClose={ () => { this.setState({ showSelectColumn: false }); } }
                    />
                )
                }
            </React.Fragment>
        );
    }
}

ConnectedCodeListTable.propTypes = {
    codeLists     : PropTypes.object.isRequired,
    stdCodeLists  : PropTypes.object.isRequired,
    stdConstants  : PropTypes.object.isRequired,
    classes       : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
};

const CodeListTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListTable);
export default withStyles(styles)(CodeListTable);
