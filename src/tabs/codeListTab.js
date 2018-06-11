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
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import CodeListFormatNameEditor from 'editors/codeListFormatNameEditor.js';
import CodeListStandardEditor from 'editors/codeListStandardEditor.js';
import {
    updateCodeList,
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
        updateCodeList  : (oid, updateObj) => dispatch(updateCodeList(oid, updateObj)),
        deleteCodeLists : (deleteObj) => dispatch(deleteCodeLists(deleteObj)),
    };
};

const mapStateToProps = state => {
    return {
        codeLists     : state.odm.study.metaDataVersion.codeLists,
        stdCodeLists  : state.stdCodeLists,
        stdConstants  : state.stdConstants,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        tabs          : state.ui.tabs,
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
    if (cell.standard !== undefined) {
        return (cell.standard.getDescription() + '\n' + cell.cdiscSubmissionValue);
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
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let columns = { ...prevState.columns };
        // Handle switch between selection/no selection
        if (nextProps.showRowSelect !== prevState.columns.oid.hidden) {
            columns = { ...columns, oid: { ...columns.oid, hidden: nextProps.showRowSelect } };
            return { columns };
        }

        return null;
    }

    componentDidMount() {
        let tabs = this.props.tabs;
        // Restore previous tab scroll position;
        if (tabs.settings[tabs.currentTab].scrollPosition !== undefined) {
            window.scrollTo(0, tabs.settings[tabs.currentTab].scrollPosition);
        }
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
            } else {
                updateObj[cellName] = cellValue;
            }

            this.props.updateCodeList(row.oid, updateObj);
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
                <Grid item style={{paddingRight: '25px'}}>
                    { props.components.searchPanel }
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
            // Get key variables
            // TODO: When key is located in the SUPP dataset.
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
