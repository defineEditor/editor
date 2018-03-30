import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import renderColumns from 'utils/renderColumns.js';
import getCodeListData from 'utils/getCodeListData.js';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import React from 'react';
import indigo from 'material-ui/colors/indigo';
import grey from 'material-ui/colors/grey';
import { withStyles } from 'material-ui/styles';
import Chip from 'material-ui/Chip';
import deepEqual from 'deep-equal';
import FilterListIcon from 'material-ui-icons/FilterList';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import ReactSelectEditor from 'editors/reactSelectEditor.js';

// Selector constants
const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    chip: {
        verticalAlign : 'top',
        marginLeft    : theme.spacing.unit,
    },
});


// Editors
function codedValueEditor (onUpdate, props) {
    if (props.stdCodeListData !== undefined) {
        const options = props.stdCodeListData.map( item => ({
            value : item.value,
            label : item.value + ' (' + item.decode + ')',
        }));
        return (<ReactSelectEditor onUpdate={ onUpdate } {...props} options={options}/>);
    } else {
        return (<SimpleInputEditor onUpdate={ onUpdate } {...props}/>);
    }
}

function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={ onUpdate } {...props}/>);
}

class CodeListTable extends React.Component {
    constructor(props) {
        super(props);
        const mdv = this.props.mdv;
        // Get list of variables which are using the codelist;
        let codeListVariables = [];
        Object.keys(mdv.itemGroups).forEach( itemGroupOid => {
            let dataset = mdv.itemGroups[itemGroupOid];
            dataset.itemRefs.forEach( itemRef => {
                if (itemRef.itemDef.codeList !== undefined) {
                    if (itemRef.itemDef.codeList.oid === this.props.codeListOid) {
                        codeListVariables.push(
                            <Chip
                                label={dataset.name + '.' + itemRef.itemDef.name}
                                key={dataset.oid + '.' + itemRef.itemDef.oid}
                                className={this.props.classes.chip}
                            />
                        );
                    }
                }
            });
        });
        // Standard codelist
        this.state = {
            codeListVariables : codeListVariables,
            stdCodeListData   : this.getStdCodeListData(),
        };
    }

    getStdCodeListData = () => {
        const codeList = this.props.mdv.codeLists[this.props.codeListOid];
        let stdCodeList;
        if (codeList.alias !== undefined) {
            let stdCodeLists = this.props.stdCodeLists;
            // Find the codelist;
            Object.keys(stdCodeLists).some( standardOid => {
                Object.keys(stdCodeLists[standardOid].codeLists).some( codeListOid => {
                    if (stdCodeLists[standardOid].codeLists[codeListOid].alias.name === codeList.alias.name) {
                        stdCodeList = stdCodeLists[standardOid].codeLists[codeListOid];
                        return true;
                    } else {
                        return false;
                    }
                });
                if (stdCodeList !== undefined) {
                    return true;
                } else {
                    return false;
                }
            });
            // If result found, extract data from it;
            if (stdCodeList !== undefined) {
                return getCodeListData(stdCodeList).codeListTable;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    onCellEdit = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (!deepEqual(row[cellName], cellValue)) {
            this.props.onMdvChange('CodeList',{itemOid: row.oid, itemGroupOid: row.groupOid},{cellName: cellValue});
        }
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (row[cellName] !== cellValue) {
            let updateObj = {};
            updateObj[cellName] = cellValue;
            this.props.onMdvChange('CodeList',{itemOid: row.oid, itemGroupOid: row.groupOid},updateObj);
        }
        return true;
    }

    createCustomButtonGroup = props => {
        return (
            <ButtonGroup className='my-custom-class' sizeClass='btn-group-md'>
                <Grid container spacing={16}>
                    <Grid item>
                        { props.showSelectedOnlyBtn }
                    </Grid>
                    <Grid item>
                        { props.insertBtn }
                    </Grid>
                    <Grid item>
                        <Button color='default' mini onClick={console.log}
                            variant='raised'>
                            Copy
                        </Button>
                    </Grid>
                    <Grid item>
                        { props.deleteBtn }
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
                            <Button variant="raised" color="default">
                                Filter
                                <FilterListIcon style={{marginLeft: '7px'}}/>
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

    createCustomInsertButton = (openModal) => {
        return (
            <Button color='primary' mini onClick={openModal} variant='raised'>Add</Button>
        );
    }

    createCustomDeleteButton = (onBtnClick) => {
        return (
            <Button color='secondary' mini onClick={onBtnClick} variant='raised'>Delete</Button>
        );
    }

    render () {
        // Extract data required for the variable table
        const mdv = this.props.mdv;
        const codeList = mdv.codeLists[this.props.codeListOid];
        // Get codeList data
        let {codeListTable, codeListTitle, isDecoded, isRanked, isCcoded} = getCodeListData(codeList, this.props.defineVersion);
        codeListTable.codeList = codeList;
        // Dynamically get column width;
        let width = {};
        width.value = {percent: 95};
        if (isDecoded) {
            width.decode = {percent: 50};
            width.value.percent -= 50;
        }
        if (isRanked) {
            width.rank = {percent: 10};
            width.value.percent -= 10;
        }
        if (isCcoded) {
            width.ccode = {percent: 10};
            width.value.percent -= 10;
        }



        // Editor settings
        const cellEditProp = {
            mode           : 'dbclick',
            blurToSave     : true,
            beforeSaveCell : this.onBeforeSaveCell
        };

        const selectRowProp = {
            mode        : 'checkbox',
            columnWidth : '35px',
        };

        const options = {
            toolBar   : this.createCustomToolBar,
            insertBtn : this.createCustomInsertButton,
            deleteBtn : this.createCustomDeleteButton,
            btnGroup  : this.createCustomButtonGroup
        };

        let columns = [
            {
                dataField : 'key',
                isKey     : true,
                hidden    : true,
            },
            {
                dataField    : 'value',
                text         : 'Coded Value',
                width        : width.value.percent.toString() + '%',
                customEditor : {getElement: codedValueEditor, customEditorParameters: {stdCodeListData: this.state.stdCodeListData}},
                tdStyle      : { whiteSpace: 'normal', width: '30px', overflow: 'inherit !important' },
                thStyle      : { whiteSpace: 'normal', width: '30px' },
            }];
        if (isDecoded) {
            columns.push(
                {
                    dataField    : 'decode',
                    text         : 'Decode',
                    width        : width.decode.percent.toString() + '%',
                    customEditor : {getElement: simpleInputEditor},
                    tdStyle      : { whiteSpace: 'normal' },
                    thStyle      : { whiteSpace: 'normal' }
                }
            );
        }
        if (isRanked) {
            columns.push(
                {
                    dataField    : 'rank',
                    text         : 'Rank',
                    width        : width.rank.percent.toString() + '%',
                    customEditor : {getElement: simpleInputEditor},
                    tdStyle      : { whiteSpace: 'normal' },
                    thStyle      : { whiteSpace: 'normal' }
                }
            );
        }
        if (isCcoded) {
            columns.push(
                {
                    dataField    : 'ccode',
                    text         : 'C-code',
                    width        : width.ccode.percent.toString() + '%',
                    customEditor : {getElement: simpleInputEditor},
                    tdStyle      : { whiteSpace: 'normal' },
                    thStyle      : { whiteSpace: 'normal' },
                    editable     : false,
                }
            );
        }

        return (
            <React.Fragment>
                <h3 style={{marginTop: '20px', marginBottom: '10px', color: grey[600]}}>
                    {codeListTitle} {this.state.codeListVariables}
                </h3>
                <BootstrapTable
                    data={codeListTable}
                    options={options}
                    search
                    deleteRow
                    insertRow
                    striped
                    hover
                    version='4'
                    cellEdit={cellEditProp}
                    keyBoardNav={{enterToEdit: true}}
                    headerStyle={{backgroundColor: indigo[500], color: grey[200], fontSize: '16px'}}
                    selectRow={selectRowProp}
                >
                    {renderColumns(columns)}
                </BootstrapTable>
            </React.Fragment>
        );
    }
}

CodeListTable.propTypes = {
    mdv           : PropTypes.object.isRequired,
    codeListOid   : PropTypes.string.isRequired,
    defineVersion : PropTypes.string.isRequired,
    stdCodeLists  : PropTypes.object,
};

export default withStyles(styles)(CodeListTable);
