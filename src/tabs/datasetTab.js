import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import clone from 'clone';
import deepEqual from 'fast-deep-equal';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import CommentEditor from 'editors/commentEditor.js';
import InteractiveKeyOrderEditor from 'editors/interactiveKeyOrderEditor.js';
import AddDatasetEditor from 'editors/addDatasetEditor.js';
import DatasetOrderEditor from 'editors/datasetOrderEditor.js';
import LeafEditor from 'editors/leafEditor.js';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import DatasetFlagsEditor from 'editors/datasetFlagsEditor.js';
import DatasetFlagsFormatter from 'formatters/datasetFlagsFormatter.js';
import CommentFormatter from 'formatters/commentFormatter.js';
import setScrollPosition from 'utils/setScrollPosition.js';
import renderColumns from 'utils/renderColumns.js';
import getColumnHiddenStatus from 'utils/getColumnHiddenStatus.js';
import ToggleRowSelect from 'utils/toggleRowSelect.js';
import SelectColumns from 'utils/selectColumns.js';
import ItemGroupMenu from 'utils/itemGroupMenu.js';
import {
    updateItemGroup,
    updateItemGroupComment,
    replaceItemGroupComment,
    addItemGroupComment,
    deleteItemGroupComment,
    deleteItemGroups,
} from 'actions/index.js';

const styles = theme => ({
    tableHeader: {
        backgroundColor : indigo[500],
        color           : grey[200],
        fontSize        : '16px',
    },
    buttonGroup: {
        marginLeft: theme.spacing.unit * 2,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateItemGroup         : (oid, updateObj) => dispatch(updateItemGroup(oid, updateObj)),
        addItemGroupComment     : (source, comment) => dispatch(addItemGroupComment(source, comment)),
        updateItemGroupComment  : (source, comment) => dispatch(updateItemGroupComment(source, comment)),
        replaceItemGroupComment : (source, comment, oldCommentOid) => dispatch(replaceItemGroupComment(source, comment, oldCommentOid)),
        deleteItemGroupComment  : (source, comment) => dispatch(deleteItemGroupComment(source, comment)),
        deleteItemGroups        : (deleteObj) => dispatch(deleteItemGroups(deleteObj)),
    };
};

const mapStateToProps = state => {
    let model = state.odm.study.metaDataVersion.model;
    return {
        itemGroups     : state.odm.study.metaDataVersion.itemGroups,
        itemGroupOrder : state.odm.study.metaDataVersion.order.itemGroupOrder,
        itemDefs       : state.odm.study.metaDataVersion.itemDefs,
        comments       : state.odm.study.metaDataVersion.comments,
        leafs          : state.odm.study.metaDataVersion.leafs,
        defineVersion  : state.odm.study.metaDataVersion.defineVersion,
        tabs           : state.ui.tabs,
        classTypes     : state.stdConstants.classTypes[model],
        stdConstants   : state.stdConstants,
        tabSettings    : state.ui.tabs.settings[state.ui.tabs.currentTab],
        showRowSelect  : state.ui.tabs.settings[state.ui.tabs.currentTab].rowSelect['overall'],
    };
};

// Editor functions
function commentEditor (onUpdate, props) {
    return (<CommentEditor onUpdate={ onUpdate } {...props} comment={props.defaultValue} autoFocus={true}/>);
}

function interactiveKeyOrderEditor(onUpdate, props) {
    return (<InteractiveKeyOrderEditor onUpdate={ onUpdate } {...props}/>);
}

function leafEditor (onUpdate, props) {
    return (<LeafEditor onUpdate={ onUpdate } {...props}/>);
}

function datasetFlagsEditor (onUpdate, props) {
    return (<DatasetFlagsEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleSelectEditor (onUpdate, props) {
    return (<SimpleSelectEditor onUpdate={ onUpdate } {...props}/>);
}

// Formatter functions
function commentFormatter (cell, row) {
    if (cell !== undefined && cell !== '') {
        return (<CommentFormatter comment={cell} leafs={row.leafs}/>);
    } else {
        return;
    }
}

function leafFormatter (cell, row) {
    if (cell !== undefined && cell !== '') {
        return (<a href={'file://' + cell.href}>{cell.title}</a>);
    } else {
        return;
    }
}

function datasetFlagsFormatter (cell, row) {
    return (<DatasetFlagsFormatter value={cell} defineVersion={row.defineVersion}/>);
}

function datasetClassFormatter (cell, row) {
    let value = row.classTypes[cell];
    return (<span>{value}</span>);
}

class ConnectedDatasetTable extends React.Component {
    constructor(props) {
        super(props);

        let classTypesArray = Object.keys(this.props.classTypes).map( classType => (classType));

        let columns = clone(props.stdConstants.columns.datasets);

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
            description: {
                customEditor: {getElement: simpleInputEditor},
            },
            datasetClass: {
                dataFormat   : datasetClassFormatter,
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: classTypesArray}},
            },
            flags: {
                dataFormat   : datasetFlagsFormatter,
                customEditor : {getElement: datasetFlagsEditor},
            },
            structure: {
                customEditor: {getElement: simpleInputEditor},
            },
            keys: {
                customEditor: {getElement: interactiveKeyOrderEditor},
            },
            comment: {
                dataFormat   : commentFormatter,
                customEditor : { getElement: commentEditor }
            },
            leaf: {
                dataFormat   : leafFormatter,
                customEditor : {getElement: leafEditor},
            }
        };

        // Unite Columns with Editors and Formatters;
        Object.keys(columns).forEach( id => {
            columns[id] = { ...columns[id], ...editorFormatters[id] };
        });

        this.state = {
            columns,
            anchorEl            : null,
            selectedRows        : [],
            itemGroupMenuParams : {},
            showSelectColumn    : false,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {

        let columns = getColumnHiddenStatus(prevState.columns, nextProps.tabSettings.columns, nextProps.showRowSelect);

        if (!deepEqual(columns, prevState.columns)) {
            return { columns };
        }
        return null;
    }

    componentDidMount() {
        setScrollPosition(this.props.tabs);
    }

    menuFormatter = (cell, row) => {
        let itemGroupMenuParams = {
            itemGroupOid: row.oid,
        };
        return (
            <IconButton
                onClick={this.handleMenuOpen(itemGroupMenuParams)}
                className={this.props.classes.menuButton}
                color='default'
            >
                <MoreVertIcon/>
            </IconButton>
        );
    }

    handleMenuOpen = (itemGroupMenuParams) => (event) => {
        this.setState({ itemGroupMenuParams, anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ itemGroupMenuParams: {}, anchorEl: null });
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (row[cellName] !== cellValue) {
            let updateObj = {};
            if (cellName === 'flags'){
                updateObj = cellValue;
            } else {
                updateObj[cellName] = cellValue;
            }

            if (cellName === 'comment') {
                if (cellValue === undefined) {
                    // If comment was removed
                    this.props.deleteItemGroupComment({type: 'itemGroups', oid: row.oid}, row.comment);
                } else if (row[cellName] === undefined) {
                    // If comment was added
                    this.props.addItemGroupComment({type: 'itemGroups', oid: row.oid}, cellValue);
                } else if (row[cellName].oid !== cellValue.oid) {
                    // If comment was replaced
                    this.props.replaceItemGroupComment({type: 'itemGroups', oid: row.oid}, cellValue, row[cellName].oid);
                } else {
                    this.props.updateItemGroupComment({type: 'itemGroups', oid: row.oid}, cellValue);
                }
            } else {
                this.props.updateItemGroup(row.oid,updateObj);
            }
            return true;
        } else {
            return false;
        }
    }

    createCustomButtonGroup = props => {
        return (
            <ButtonGroup className={this.props.classes.buttonGroup}>
                <Grid container spacing={16}>
                    <Grid item>
                        <ToggleRowSelect oid='overall'/>
                    </Grid>
                    <Grid item>
                        <AddDatasetEditor/>
                    </Grid>
                    <Grid item>
                        <Button
                            color='default'
                            mini
                            onClick={console.log}
                            disabled={!this.props.showRowSelect}
                            variant='raised'
                        >
                            Copy
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='default'
                            mini
                            onClick={console.log}
                            variant='raised'
                            disabled={!this.props.showRowSelect}
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
                        <DatasetOrderEditor/>
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
        let itemGroups = this.props.itemGroups;
        let itemGroupOids = this.state.selectedRows;
        // Form an object of comments to remove {commentOid: [itemOid1, itemOid2, ...]}
        let commentOids = {};
        itemGroupOids.forEach( itemGroupOid => {
            let commentOid = itemGroups[itemGroupOid].commentOid;
            if (commentOid !== undefined) {
                if (commentOids[commentOid] === undefined) {
                    commentOids[commentOid] = [];
                }
                if (!commentOids[commentOid].includes[itemGroupOid]) {
                    commentOids[commentOid].push(itemGroupOid);
                }
            }
        });
        // Form a list of itemRefs to delete;
        const deleteObj = { itemGroupOids, commentOids };
        this.props.deleteItemGroups(deleteObj);
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
        let datasets = [];
        // Extract data required for the dataset table
        this.props.itemGroupOrder.forEach((itemGroupOid, index) => {
            const originDs = this.props.itemGroups[itemGroupOid];
            let currentDs = {
                oid           : originDs.oid,
                name          : originDs.name,
                datasetClass  : originDs.datasetClass,
                purpose       : originDs.purpose,
                structure     : originDs.structure,
                defineVersion : this.props.defineVersion,
                leafs         : this.props.leafs,
                classTypes    : this.props.classTypes,
            };
            currentDs.description = originDs.getDescription();
            currentDs.comment = originDs.commentOid === undefined ? undefined : this.props.comments[originDs.commentOid];
            currentDs.leaf = originDs.leaf === undefined ? undefined : originDs.leaf.clone();
            // Group Repeating/IsReferenceData/isStandard
            currentDs.flags = {
                repeating       : originDs.repeating,
                isReferenceData : originDs.isReferenceData,
            };
            // Get key variables
            // TODO: When key is located in the SUPP dataset.
            currentDs.keys = originDs.keyOrder.map( keyOid => {
                return this.props.itemDefs[originDs.itemRefs[keyOid].itemOid].name;
            }).join(', ');
            datasets[index] = currentDs;
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

        const {classes} = this.props;

        return (
            <React.Fragment>
                <BootstrapTable
                    data={datasets}
                    options={options}
                    search
                    deleteRow
                    insertRow
                    striped
                    hover
                    version='4'
                    cellEdit={cellEditProp}
                    keyBoardNav={this.props.showRowSelect ? false : {enterToEdit: true}}
                    tableHeaderClass={classes.tableHeader}
                    selectRow={selectRowProp}
                >
                    {renderColumns(this.state.columns)}
                </BootstrapTable>
                <ItemGroupMenu onClose={this.handleMenuClose} itemGroupMenuParams={this.state.itemGroupMenuParams} anchorEl={this.state.anchorEl}/>
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

ConnectedDatasetTable.propTypes = {
    itemGroups     : PropTypes.object.isRequired,
    itemDefs       : PropTypes.object.isRequired,
    comments       : PropTypes.object.isRequired,
    defineVersion  : PropTypes.string.isRequired,
    itemGroupOrder : PropTypes.array.isRequired,
    leafs          : PropTypes.object.isRequired,
    tabs           : PropTypes.object.isRequired,
    classTypes     : PropTypes.object.isRequired,
    showRowSelect  : PropTypes.bool,
};

const DatasetTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedDatasetTable);
export default withStyles(styles)(DatasetTable);
