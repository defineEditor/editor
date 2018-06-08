import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';
import renderColumns from 'utils/renderColumns.js';
import getItemRefsRelatedOids from 'utils/getItemRefsRelatedOids.js';
import ItemMenu from 'utils/itemMenu.js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import grey from '@material-ui/core/colors/grey';
import indigo from '@material-ui/core/colors/indigo';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import FilterListIcon from '@material-ui/icons/FilterList';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import OpenDrawer from '@material-ui/icons/SubdirectoryArrowLeft';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import getTableData from 'utils/getTableData.js';
import SelectColumns from 'utils/selectColumns.js';
import KeyOrderEditor from 'editors/keyOrderEditor.js';
import ToggleRowSelect from 'utils/toggleRowSelect.js';
import AddVariableEditor from 'editors/addVariableEditor.js';
import DescriptionEditor from 'editors/descriptionEditor.js';
import VariableOrderEditor from 'editors/variableOrderEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import RoleMandatoryEditor from 'editors/roleMandatoryEditor.js';
import VariableLengthEditor from 'editors/variableLengthEditor.js';
import DescriptionFormatter from 'formatters/descriptionFormatter.js';
import RoleMandatoryFormatter from 'formatters/roleMandatoryFormatter.js';
import VariableLengthFormatter from 'formatters/variableLengthFormatter.js';
import VariableCodeListFormatEditor from 'editors/variableCodeListFormatEditor.js';
import VariableCodeListFormatFormatter from 'formatters/variableCodeListFormatFormatter.js';
import VariableNameLabelWhereClauseEditor from 'editors/variableNameLabelWhereClauseEditor.js';
import VariableNameLabelWhereClauseFormatter from 'formatters/variableNameLabelWhereClauseFormatter.js';
import {
    updateItemDef, updateItemRef, updateItemRefKeyOrder, updateItemCodeListDisplayFormat,
    updateItemDescription, deleteVariables, updateNameLabelWhereClause, setVlmState,
} from 'actions/index.js';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    buttonGroup: {
        marginLeft: theme.spacing.unit * 2,
    },
    drawerButton: {
        marginLeft : theme.spacing.unit,
        transform  : 'translate(0%, -6%)',
    },
    tableTitle: {
        marginTop    : theme.spacing.unit * 2,
        marginBottom : theme.spacing.unit * 2,
        color        : grey[600]
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateItemDef                   : (oid, updateObj) => dispatch(updateItemDef(oid, updateObj)),
        updateItemRef                   : (source, updateObj) => dispatch(updateItemRef(source, updateObj)),
        updateNameLabelWhereClause      : (source, updateObj) => dispatch(updateNameLabelWhereClause(source, updateObj)),
        updateItemRefKeyOrder           : (source, updateObj, prevObj) => dispatch(updateItemRefKeyOrder(source, updateObj, prevObj)),
        updateItemCodeListDisplayFormat : (oid, updateObj, prevObj) => dispatch(updateItemCodeListDisplayFormat(oid, updateObj, prevObj)),
        updateItemDescription           : (source, updateObj, prevObj) => dispatch(updateItemDescription(source, updateObj, prevObj)),
        deleteVariables                 : (source, deleteObj) => dispatch(deleteVariables(source, deleteObj)),
        setVlmState                     : (source, updateObj) => dispatch(setVlmState(source, updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        mdv           : state.odm.study.metaDataVersion,
        dataTypes     : state.stdConstants.dataTypes,
        stdColumns    : state.stdConstants.columns.variables,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        tabSettings   : state.ui.tabs.settings[state.ui.tabs.currentTab],
        showRowSelect : state.ui.tabs.settings[state.ui.tabs.currentTab].rowSelect['overall'],
    };
};

// Editors
function descriptionEditor (onUpdate, props) {
    return (<DescriptionEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleSelectEditor (onUpdate, props) {
    return (<SimpleSelectEditor onUpdate={ onUpdate } {...props}/>);
}

function variableNameLabelWhereClauseEditor (onUpdate, props) {
    return (<VariableNameLabelWhereClauseEditor onUpdate={ onUpdate } {...props}/>);
}

function variableLengthEditor (onUpdate, props) {
    return (<VariableLengthEditor onUpdate={ onUpdate } {...props}/>);
}

function variableCodeListFormatEditor (onUpdate, props) {
    return (<VariableCodeListFormatEditor onUpdate={ onUpdate } {...props}/>);
}

function keyOrderEditor (onUpdate, props) {
    return (<KeyOrderEditor onUpdate={ onUpdate } {...props}/>);
}

function roleMandatoryEditor (onUpdate, props) {
    return (<RoleMandatoryEditor onUpdate={ onUpdate } {...props}/>);
}

// Formatters
function descriptionFormatter (cell, row) {
    return (<DescriptionFormatter value={cell} model={row.model} leafs={row.mdv.leafs}/>);
}

function variableCodeListFormatFormatter (cell, row) {
    return <VariableCodeListFormatFormatter value={cell} defineVersion={row.defineVersion}/>;
}

function variableLengthFormatter (cell, row) {
    if (row.dataType !== undefined) {
        return (<VariableLengthFormatter value={cell} defineVersion={row.defineVersion} dataType={row.dataType} row={row}/>);
    }
}

function keyOrderFormatter (cell, row) {
    return (
        <Grid container spacing={16}>
            <Grid item>
                {cell.orderNumber}
            </Grid>
            {cell.keySequence !== undefined &&
                    <Grid item>
                        <abbr title='Key Sequence'>K</abbr>: {cell.keySequence}
                    </Grid>
            }
        </Grid>
    );
}

function variableNameLabelWhereClauseFormatter (cell, row) {
    const hasVlm = (row.valueList !== undefined);
    if (hasVlm) {
        let itemVlmState = 'collaps';
        let vlmState = this.props.tabSettings.vlmState[this.props.itemGroupOid];
        if (vlmState !== undefined && vlmState.hasOwnProperty(row.oid)) {
            itemVlmState = vlmState[row.oid];
        }
        return (
            <VariableNameLabelWhereClauseFormatter
                value={cell}
                defineVersion={row.defineVersion}
                toggleVlmRow={this.toggleVlmRow}
                itemOid={row.oid}
                hasVlm={hasVlm}
                state={itemVlmState}
                mdv={row.mdv}
            />
        );
    } else {
        return (
            <VariableNameLabelWhereClauseFormatter
                value={cell}
                defineVersion={row.defineVersion}
                mdv={row.mdv}
            />
        );

    }
}

function roleMandatoryFormatter (cell, row) {
    return (<RoleMandatoryFormatter value={cell} model={row.model}/>);
}

class ConnectedVariableTable extends React.Component {
    constructor(props) {
        super(props);
        const mdv = this.props.mdv;
        const model = mdv.model;
        let columns = clone(this.props.stdColumns);

        // Variables menu is not shown when selection is triggered
        if (columns.hasOwnProperty('oid')) {
            columns.oid.hidden = this.props.showRowSelect;
        }
        // Mandatory/Role depends on a model;
        if (columns.hasOwnProperty('roleMandatory')) {
            if (model === 'ADaM') {
                columns.roleMandatory.text = 'Mandatory';
            } else {
                columns.roleMandatory.text = 'Role, Mandatory';
            }
        }

        const editorFormatters = {
            oid: {
                dataFormat: this.menuFormatter,
            },
            keyOrder: {
                dataFormat   : keyOrderFormatter,
                customEditor : {getElement: keyOrderEditor},
            },
            nameLabelWhereClause: {
                dataFormat   : variableNameLabelWhereClauseFormatter.bind(this),
                customEditor : {getElement: variableNameLabelWhereClauseEditor},
            },
            dataType: {
                customEditor: {getElement: simpleSelectEditor, customEditorParameters: {options: this.props.dataTypes, optional: true}},
            },
            lengthAttrs: {
                dataFormat   : variableLengthFormatter,
                customEditor : {getElement: variableLengthEditor},
            },
            roleMandatory: {
                dataFormat   : roleMandatoryFormatter,
                customEditor : {getElement: roleMandatoryEditor, customEditorParameters: {model: model}},
            },
            codeListFormatAttrs: {
                dataFormat   : variableCodeListFormatFormatter,
                customEditor : {getElement: variableCodeListFormatEditor, customEditorParameters: {codeLists: mdv.codeLists}},
            },
            description: {
                dataFormat   : descriptionFormatter,
                customEditor : {
                    getElement             : descriptionEditor,
                    customEditorParameters : {
                        leafs         : mdv.leafs,
                        model         : mdv.model,
                        defineVersion : this.props.defineVersion,
                    }
                },
            },
        };

        // Unite Columns with Editors and Formatters;
        Object.keys(columns).forEach( id => {
            columns[id] = { ...columns[id], ...editorFormatters[id] };
        });

        // ItemGroupOid is kept only for the getDerivedStateFromProps method
        this.state = {
            columns,
            itemMenuParams   : {},
            anchorEl         : null,
            showSelectColumn : false,
            selectedRows     : [],
            selectedVlmRows  : {},
            itemGroupOid     : this.props.itemGroupOid,
            setScrollY       : false,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // Store previous itemGroupOid in state so we can compare when props change.
        if (!deepEqual(nextProps.itemGroupOid, prevState.itemGroupOid)) {
            return {
                itemGroupOid : nextProps.itemGroupOid,
                setScrollY   : true,
            };
        }
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

    componentDidUpdate() {
        if (this.state.setScrollY) {
            // Restore previous tab scroll position for a specific dataset
            let tabSettings = this.props.tabSettings;
            if (tabSettings.scrollPosition[this.props.itemGroupOid] !== undefined) {
                window.scrollTo(0, tabSettings.scrollPosition[this.props.itemGroupOid]);
            } else {
                window.scrollTo(0, 0);
            }
            this.setState({ setScrollY: false });
        }
    }

    getData = () => {
        const mdv = this.props.mdv;
        //const model = mdv.model;
        const dataset = mdv.itemGroups[this.props.itemGroupOid];
        // Get variable level metadata
        let variables = getTableData({
            source        : dataset,
            datasetName   : dataset.name,
            datasetOid    : dataset.oid,
            itemDefs      : mdv.itemDefs,
            codeLists     : mdv.codeLists,
            mdv           : this.props.mdv,
            defineVersion : this.props.defineVersion,
            vlmLevel      : 0,
        });

        // Get VLM metadata for items which are expanded
        let vlmState = this.props.tabSettings.vlmState[this.props.itemGroupOid];
        if (vlmState !== undefined) {
            variables
                .filter( item => (item.valueList !== undefined && vlmState[item.oid] === 'expand') )
                .forEach( item => {
                    let vlmData = getTableData({
                        source        : item.valueList,
                        datasetName   : dataset.name,
                        datasetOid    : dataset.oid,
                        itemDefs      : mdv.itemDefs,
                        codeLists     : mdv.codeLists,
                        mdv           : mdv,
                        defineVersion : this.props.defineVersion,
                        vlmLevel      : 1,
                    });
                    // For all VLM which are expanded, add VLM data to Variables
                    let startIndex = variables.map(item => item.oid).indexOf(item.oid) + 1;
                    variables.splice.apply(variables, [startIndex, 0].concat(vlmData));
                });
        }

        return variables;
    }

    menuFormatter = (cell, row) => {
        let itemMenuParams = {
            oid            : row.oid,
            itemRefOid     : row.itemRefOid,
            itemGroupVLOid : row.itemGroupOid,
            vlmLevel       : row.vlmLevel,
            hasVlm         : (row.valueList !== undefined),
        };
        return (
            <IconButton
                onClick={this.handleMenuOpen(itemMenuParams)}
                color='default'
            >
                <MoreVertIcon/>
            </IconButton>
        );
    }

    handleMenuOpen = (itemMenuParams) => (event) => {
        this.setState({ itemMenuParams, anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ itemMenuParams: {}, anchorEl: null });
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (!deepEqual(row[cellName], cellValue)) {

            let updateObj = {};
            if (cellName === 'dataType') {
                updateObj[cellName] = cellValue;
            } else {
                updateObj = cellValue;
            }

            if (cellName === 'description') {
                this.props.updateItemDescription(
                    {
                        oid          : row.oid,
                        itemGroupOid : row.itemGroupOid,
                        itemRefOid   : row.itemRefOid,
                        vlm          : (row.vlmLevel === 1),
                    },
                    updateObj,
                    row.description,
                );
            } else if (cellName === 'roleMandatory') {
                this.props.updateItemRef({
                    itemGroupOid : row.itemGroupOid,
                    itemRefOid   : row.itemRefOid,
                    vlm          : (row.vlmLevel === 1),
                }, updateObj);
            } else if (cellName === 'codeListFormatAttrs') {
                this.props.updateItemCodeListDisplayFormat(
                    row.oid,
                    updateObj,
                    row.codeListFormatAttrs,
                );
            } else if (cellName === 'keyOrder') {
                this.props.updateItemRefKeyOrder(
                    {
                        itemGroupOid : row.itemGroupOid,
                        itemRefOid   : row.itemRefOid,
                        vlm          : (row.vlmLevel === 1),
                    },
                    updateObj,
                    row.keyOrder
                );
            } else if (row.vlmLevel === 0 || (cellName !== 'nameLabelWhereClause')) {
                this.props.updateItemDef(row.oid, updateObj);
            } else if (row.vlmLevel === 1 && cellName === 'nameLabelWhereClause') {
                // If WhereClause itself or attached comment did not change, then it is just itemDef update
                let oldWcComment;
                if (row[cellName].whereClause.commentOid !== undefined) {
                    oldWcComment = row.mdv.comments[row[cellName].whereClause.commentOid];
                }
                if (deepEqual(row.nameLabelWhereClause.whereClause, cellValue.whereClause)
                    && deepEqual(oldWcComment, cellValue.wcComment)) {
                    this.props.updateItemDef(row.oid, updateObj);
                } else {
                    updateObj.oldWcOid = row[cellName].whereClause.oid;
                    updateObj.oldWcCommentOid = row[cellName].whereClause.commentOid;
                    this.props.updateNameLabelWhereClause({ itemDefOid: row.oid, itemRefOid: row.itemRefOid, valueListOid: row.itemGroupOid }, updateObj);
                }
            }
        }
        return true;
    }

    toggleVlmAndVariablesData = (itemOid, vlmState) => {
        // Toggle the vlm state
        if (vlmState[itemOid] === 'expand') {
            vlmState[itemOid] = 'collaps';
        } else {
            vlmState[itemOid] = 'expand';
        }
    }

    toggleVlmRow = (itemOid) => () => {
        // Copy the state
        let vlmState = { ...this.props.tabSettings.vlmState[this.props.itemGroupOid] };
        // Update the state
        this.toggleVlmAndVariablesData(itemOid, vlmState);
        // Check if all of the states became collapsed/expanded;
        if (Object.keys(vlmState)
            .filter( vlm => (vlm !== 'global'))
            .filter( vlm => vlmState[vlm] === 'collaps').length === 0) {
            vlmState.global = 'expand';
        } else if (Object.keys(vlmState)
            .filter( vlm => (vlm !== 'global'))
            .filter( vlm => vlmState[vlm] === 'expand').length === 0) {
            vlmState.global = 'collaps';
        }
        this.props.setVlmState({ itemGroupOid: this.props.itemGroupOid }, { vlmState });
    }

    toggleVlmRows = (type) => () => {
        let vlmState = { global: 'collaps' };
        if (this.props.tabSettings.vlmState.hasOwnProperty(this.props.itemGroupOid)) {
            vlmState = this.props.tabSettings.vlmState[this.props.itemGroupOid];
        }
        if (type === vlmState.global) {
            // If all are already collapsed or expanded
            return;
        }
        // Update the state for all items that have VLM
        vlmState = { global: vlmState.global === 'expand' ? 'collaps' : 'expand' };
        let dataset = this.props.mdv.itemGroups[this.props.itemGroupOid];
        dataset.itemRefOrder.forEach( itemRefOid => {
            let itemOid = dataset.itemRefs[itemRefOid].itemOid;
            if (this.props.mdv.itemDefs[itemOid].valueListOid !== undefined) {
                vlmState[itemOid] = type;
            }
        });
        this.props.setVlmState({ itemGroupOid: this.props.itemGroupOid }, { vlmState });
    }

    createCustomButtonGroup = props => {
        return (
            <ButtonGroup className={this.props.classes.buttonGroup}>
                <Grid container spacing={16}>
                    <Grid item>
                        <ToggleRowSelect oid='overall'/>
                    </Grid>
                    <Grid item>
                        <AddVariableEditor itemGroupOid={this.props.itemGroupOid}/>
                    </Grid>
                    <Grid item>
                        <Button color='default' mini onClick={console.log} disabled={!this.props.showRowSelect}
                            variant='raised'>
                            Copy
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='default'
                            mini
                            onClick={console.log}
                            disabled={!this.props.showRowSelect}
                            variant='raised'
                        >
                            Update
                        </Button>
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
                    <Grid item>
                        <VariableOrderEditor itemGroupOid={this.props.itemGroupOid}/>
                    </Grid>
                </Grid>
            </ButtonGroup>
        );
    }

    createCustomToolBar = props => {
        let vlmState = { global: 'collaps' };
        if (this.props.tabSettings.vlmState.hasOwnProperty(this.props.itemGroupOid)) {
            vlmState = this.props.tabSettings.vlmState[this.props.itemGroupOid];
        }

        let dataset = this.props.mdv.itemGroups[this.props.itemGroupOid];
        let hasVlm = dataset.itemRefOrder.some( itemRefOid => {
            let itemOid = dataset.itemRefs[itemRefOid].itemOid;
            if (this.props.mdv.itemDefs[itemOid].valueListOid !== undefined) {
                return true;
            }
            return false;
        });

        return (
            <Grid container spacing={16} justify='space-between'>
                <Grid item style={{paddingLeft: '8px'}}>
                    { props.components.btnGroup }
                </Grid>
                <Grid item style={{paddingRight: '25px'}}>
                    <Grid container spacing={16} justify='flex-end'>
                        { hasVlm &&
                                <Grid item>
                                    <Button
                                        variant="raised"
                                        color="default"
                                        onClick={this.toggleVlmRows(vlmState.global === 'collaps' ? 'expand' : 'collaps')}
                                    >
                                        {vlmState.global === 'collaps' ? 'Expand' : 'Collaps'} VLM
                                        {vlmState.global === 'collaps' ? <ExpandMoreIcon style={{marginLeft: '7px'}}/> : <ExpandLessIcon style={{marginLeft: '7px'}}/>}
                                    </Button>
                                </Grid>
                        }
                        <Grid item>
                            <Button variant="raised" color="default">
                                Filter
                                <FilterListIcon style={{marginLeft: '7px'}}/>
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="raised" color="default" onClick={ () => { this.setState({ showSelectColumn: true }); } }>
                                Columns
                                <RemoveRedEyeIcon style={{marginLeft: '7px'}}/>
                            </Button>
                        </Grid>
                        <Grid item>
                            { props.components.searchPanel }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    deleteRows = () => {
        if (this.state.selectedRows.length > 0 || Object.keys(this.state.selectedVlmRows).length > 0) {
            let deleteObj = getItemRefsRelatedOids(this.props.mdv, this.props.itemGroupOid, this.state.selectedRows, this.state.selectedVlmRows);
            this.props.deleteVariables({itemGroupOid: this.props.itemGroupOid}, deleteObj);
        }
    }

    highLightVlmRows = (row, rowIndex) => {
        return (row.vlmLevel > 0 ? 'vlmRow' : 'variableRow');
    }

    // Row Selection functions
    onRowSelected = (row, isSelected, event) => {
        if (row.vlmLevel === 0) {
            let selectedRows = this.state.selectedRows;
            if (isSelected === true) {
                // If the variable is going to be selected;
                if (!selectedRows.includes(row.itemRefOid)) {
                    selectedRows.push(row.itemRefOid);
                }
            } else {
                // If the variable is going to be removed;
                if (selectedRows.includes(row.itemRefOid)) {
                    selectedRows.splice(selectedRows.indexOf(row.itemRefOid),1);
                }
            }
            this.setState({selectedRows});
        } else {
            let selectedVlmRows = this.state.selectedVlmRows;
            const valueListOid = row.itemGroupOid;
            if (isSelected === true) {
                // If the value level is going to be selected;
                if (!selectedVlmRows.hasOwnProperty(valueListOid)) {
                    selectedVlmRows[valueListOid] = [row.itemRefOid];
                }    else if (!selectedVlmRows[valueListOid].includes(row.itemRefOid)) {
                    selectedVlmRows[valueListOid].push(row.itemRefOid);
                }
            } else {
                // If the value level is going to be removed;
                if (selectedVlmRows.hasOwnProperty(valueListOid) && selectedVlmRows[valueListOid].includes(row.itemRefOid)) {
                    selectedVlmRows[valueListOid].splice(selectedVlmRows[valueListOid].indexOf(row.itemRefOid),1);
                }
            }
            this.setState({selectedVlmRows});
        }
        return true;
    }

    onAllRowSelected = (isSelected, rows, event) => {
        let selectedRows;
        let selectedVlmRows;
        // (De)select all simple variables
        if (isSelected === true) {
            // If all rows are going to be selected;
            selectedRows = rows
                .filter( row => (row.vlmLevel === 0))
                .map( row => (row.itemRefOid));
        } else {
            selectedRows = [];
        }
        // (De)select all value levels
        if (isSelected === true) {
            // If all rows are going to be selected;
            rows.filter( row => (row.vlmLevel === 1))
                .forEach( row => {
                    const valueListOid = row.itemGroupOid;
                    if (selectedVlmRows.hasOwnProperty(valueListOid)) {
                        selectedRows[valueListOid].push(row.itemRefOid);
                    } else {
                        selectedRows[valueListOid] = [row.itemRefOid];
                    }
                });
        } else {
            selectedVlmRows = {};
        }
        this.setState({selectedRows, selectedVlmRows});
        return true;
    }

    render () {
        // Extract data required for the variable table
        const mdv = this.props.mdv;
        const variables = this.getData();

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
                <h3 className={this.props.classes.tableTitle}>
                    {mdv.itemGroups[this.props.itemGroupOid].name + ' (' + mdv.itemGroups[this.props.itemGroupOid].getDescription() + ')'}
                    <Button
                        color="default"
                        variant='fab'
                        mini
                        onClick={this.props.openDrawer}
                        className={this.props.classes.drawerButton}
                    >
                        <OpenDrawer/>
                    </Button>
                </h3>
                <BootstrapTable
                    data={variables}
                    options={options}
                    search
                    striped
                    hover
                    keyBoardNav={this.props.showRowSelect ? false : {enterToEdit: true}}
                    version='4'
                    cellEdit={cellEditProp}
                    headerStyle={{backgroundColor: indigo[500], color: grey[200], fontSize: '16px'}}
                    selectRow={selectRowProp}
                    trClassName={this.highLightVlmRows}
                >
                    {renderColumns(this.state.columns)}
                </BootstrapTable>
                <ItemMenu onClose={this.handleMenuClose} itemMenuParams={this.state.itemMenuParams} anchorEl={this.state.anchorEl}/>
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

ConnectedVariableTable.propTypes = {
    mdv           : PropTypes.object.isRequired,
    itemGroupOid  : PropTypes.string.isRequired,
    defineVersion : PropTypes.string.isRequired,
};

const VariableTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedVariableTable);
export default withStyles(styles)(VariableTable);
