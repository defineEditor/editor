import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import getSelectionList from 'utils/getSelectionList.js';
import getOid from 'utils/getOid.js';
import clone from 'clone';
import getTableDataForImport from 'utils/getTableDataForImport.js';
import compareCodeLists from 'utils/compareCodeLists.js';
import compareMethods from 'utils/compareMethods.js';
import DescriptionFormatter from 'formatters/descriptionFormatter.js';
import { addVariables } from 'actions/index.js';
import { ItemDef, ItemRef, ValueList, WhereClause } from 'elements.js';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 100
    },
    addButton: {
        marginLeft: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    datasetSelector: {
        minWidth: 100,
        marginLeft: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    searchField: {
        width: 120,
        marginRight: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing.unit
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addVariables: (updateObj) => dispatch(addVariables(updateObj))
    };
};

const mapStateToProps = (state, props) => {
    if (props.sourceMdv !== undefined) {
        return {
            mdv: state.odm.study.metaDataVersion,
            defineVersion: state.odm.study.metaDataVersion.defineVersion,
            sameDefine: false,
        };
    } else {
        return {
            mdv: state.odm.study.metaDataVersion,
            defineVersion: state.odm.study.metaDataVersion.defineVersion,
            sourceMdv: state.odm.study.metaDataVersion,
            sameDefine: true,
        };
    }
};

const copyItems = (currentGroup, sourceGroup, mdv, sourceMdv, selected, vlm) => {
    let itemDefs = {};
    let itemRefs = {};
    let valueLists = {};
    let whereClauses = {};
    let currentItemDefs = Object.keys(mdv.itemDefs);
    let currentItemRefs = currentGroup.itemRefOrder.slice();
    let currentValueLists = Object.keys(mdv.valueLists);
    let currentWhereClauses = Object.keys(mdv.whereClauses);
    selected.forEach( itemRefOid => {
        let itemRef = clone(sourceGroup.itemRefs[itemRefOid]);
        let newItemRefOid = getOid('ItemRef', undefined, currentItemRefs);
        let newItemDefOid = getOid('ItemDef', undefined, currentItemDefs);
        if (itemRef.whereClauseOid !== undefined) {
            let whereClause = clone(sourceMdv.whereClauses[itemRef.whereClauseOid]);
            let newWhereClauseOid = getOid('WhereClause', undefined, currentWhereClauses);
            currentWhereClauses.push(newWhereClauseOid);
            // TODO itemGroupOid and itemDefOid must be reset during that process
            whereClauses[newWhereClauseOid] = { ...new WhereClause({
                ...whereClause,
                oid: newWhereClauseOid,
                sources: { valueLists: [currentGroup.oid] }
            }) };
        }
        currentItemRefs.push(newItemRefOid);
        currentItemDefs.push(newItemDefOid);
        itemRefs[newItemRefOid] = { ...new ItemRef({ ...itemRef, oid: newItemRefOid, itemOid: newItemDefOid }) };
        let sources;
        if (vlm === true) {
            sources = {itemGroups: [], valueLists: [currentGroup.oid]};
        } else {
            sources = {itemGroups: [currentGroup.oid], valueLists: []};
        }
        itemDefs[newItemDefOid] = {...new ItemDef({
            ...clone(sourceMdv.itemDefs[itemRef.itemOid]),
            oid: newItemDefOid,
            sources})
        };
        // Check if VLM is attached
        if (itemDefs[newItemDefOid].valueListOid !== undefined) {
            let valueList = clone(sourceMdv.valueLists[itemDefs[newItemDefOid].valueListOid]);
            let newValueListOid = getOid('ValueList', undefined, currentValueLists);
            currentValueLists.push(newValueListOid);
            valueLists[newValueListOid] = { ...new ValueList({
                ...valueList, itemRefs: {}, itemRefOrder: [], oid: newValueListOid, sources: {itemDefs: [newItemDefOid]}
            }) };
            let vlCopy = copyItems(valueLists[newValueListOid], valueList, mdv, sourceMdv, valueList.itemRefOrder, true);
            valueLists[newValueListOid].itemRefs = vlCopy.itemRefs;
            valueLists[newValueListOid].itemRefOrder = Object.keys(vlCopy.itemRefs);
            itemDefs = { ...itemDefs, ...vlCopy.itemDefs };
            itemRefs = { ...itemRefs, ...vlCopy.itemRefs };
            valueLists = { ...valueLists, ...vlCopy.valueLists };
            whereClauses = { ...whereClauses, ...vlCopy.whereClauses };
        }
    });
    return { itemDefs, itemRefs, valueLists, whereClauses };
};

class ConnectedCodedValueSelector extends React.Component {
    constructor(props) {
        super(props);

        // Get a list of all datasets for selection
        const itemGroupList = {};
        props.sourceMdv.order.itemGroupOrder.forEach( itemGroupOid => {
            itemGroupList[itemGroupOid] = props.sourceMdv.itemGroups[itemGroupOid].name;
        });
        // Get initial data
        const sourceItemGroupOid = Object.keys(itemGroupList)[0];
        let itemGroupData = getTableDataForImport({
            source: props.sourceMdv.itemGroups[sourceItemGroupOid],
            datasetOid: sourceItemGroupOid,
            mdv: props.sourceMdv,
            defineVersion: props.defineVersion,
            vlmLevel: 0,
        });
        // Mark all items from the source codelist which are already present in the destination codelist
        this.state = {
            selected: [],
            searchString: '',
            itemGroupList,
            sourceItemGroupOid,
            itemGroupData,
            detachMethods: true,
            rowsPerPage : 25,
            page: 0,
        };
    }

    handleSelectAllClick = (event, checked) => {
        if (checked) {
            const itemRefOids = this.props.sourceMdv.itemGroups[this.state.sourceItemGroupOid].itemRefOrder;
            this.setState({ selected: itemRefOids });
        } else {
            this.setState({ selected: [] });
        }
    };

    handleClick = (event, oid) => {
        const { selected } = this.state;
        const selectedIndex = selected.indexOf(oid);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, oid);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        this.setState({ selected: newSelected });
    };

    handleAddVariables = () => {
        // Get new OIDs for each of the variables (both ItemRef and ItemDef)
        let currentGroup = this.props.mdv.itemGroups[this.props.itemGroupOid];
        let sourceGroup = this.props.sourceMdv.itemGroups[this.state.sourceItemGroupOid];
        let { itemDefs, itemRefs, valueLists, whereClauses } =
            copyItems(currentGroup, sourceGroup, this.props.mdv, this.props.sourceMdv, this.state.selected, false);
        // If it is the same define, then there is no need to rebuild codeLists, other than update sources
        let codeLists = {};
        if (this.props.sameDefine === false) {
            let codeListOids = Object.keys(this.props.mdv.codeLists);
            Object.keys(itemDefs).forEach( itemDefOid => {
                if (itemDefs[itemDefOid].codeListOid !== undefined) {
                    let codeList = clone(this.props.sourceMdv.codeLists[itemDefs[itemDefOid].codeListOid]);
                    let name = codeList.name;
                    // Search for the same name in the existing codelists
                    let matchingIds = [];
                    Object.keys(this.props.mdv.codeLists).forEach(codeListOid => {
                        if (this.props.mdv.codeLists[codeListOid].name === name) {
                            matchingIds.push(codeListOid);
                        }
                    });
                    // Perform deep compare of the codelists
                    let newCodeListOid;
                    matchingIds.some( codeListOid => {
                        if (compareCodeLists(this.props.mdv.codeLists[codeListOid], codeList)) {
                            newCodeListOid = codeListOid;
                        }
                    });
                    if (newCodeListOid === undefined) {
                        newCodeListOid = getOid('CodeList', undefined, codeListOids);
                        codeListOids.push(newCodeListOid);
                        codeList.oid = newCodeListOid;
                        // Remove all associations with a standard codelist
                        codeList.standardOid = undefined;
                        codeList.standardCodeListOid = undefined;
                        codeList.linkedCodeListOid = undefined;
                        codeList.cdiscSubmissionValue = undefined;
                        codeLists[newCodeListOid] = codeList;
                    }
                    // Update itemDef referece
                    itemDefs[itemDefOid].codeListOid = newCodeListOid;
                }
            });
        }
        // Copy methods;
        let methods = {};
        if (this.props.sameDefine === false || this.state.detachMethods === true) {
            let methodOids = Object.keys(this.props.mdv.methods);
            Object.keys(itemRefs).forEach( itemRefOid => {
                if (itemRefs[itemRefOid].methodOid !== undefined) {
                    let method = clone(this.props.sourceMdv.methods[itemRefs[itemRefOid].methodOid]);
                    let name = method.name;
                    // Search for the same name in the existing methods
                    let matchingIds = [];
                    Object.keys(this.props.mdv.methods).forEach(methodOid => {
                        if (this.props.mdv.methods[methodOid].name === name) {
                            matchingIds.push(methodOid);
                        }
                    });
                    let newMethodOid;
                    // Perform deep compare of the methods in case methods are not detached and coming from a different Define-XML
                    if (this.state.detachMethods === false && this.props.sameDefine === false) {
                        matchingIds.some( methodOid => {
                            if (compareMethods(this.props.mdv.methods[methodOid], method)) {
                                newMethodOid = methodOid;
                            }
                        });
                    }
                    if (newMethodOid === undefined) {
                        newMethodOid = getOid('Method', undefined, methodOids);
                        method.sources = { itemGroups: { [this.props.itemGroupOid]: [itemRefOid] }, valueLists: {} };
                        methodOids.push(newMethodOid);
                        method.oid = newMethodOid;
                        methods[newMethodOid] = method;
                    }
                    // Update itemRef referece
                    itemRefs[itemRefOid].methodOid = newMethodOid;
                }
            });
        }

        // Copy comments;
        let comments = {};

        // Get position to insert
        let position;
        if (this.props.position !== undefined) {
            position = this.props.position;
        } else {
            // If the position was not specified, add it to the end
            position = this.props.mdv.itemGroups[this.props.itemGroupOid].itemRefOrder.length + 1;
        }

        this.props.addVariables({
            itemGroupOid: this.props.itemGroupOid,
            position,
            itemDefs,
            itemRefs,
            codeLists,
            methods,
            comments,
            valueLists,
            whereClauses,
        });

        //this.props.onClose();
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handleItemGroupChange = event => {
        if (event.target.value !== this.state.sourceItemGroupOid) {
            let sourceItemGroupOid = event.target.value;
            let itemGroupData = getTableDataForImport({
                source: this.props.sourceMdv.itemGroups[sourceItemGroupOid],
                datasetOid: sourceItemGroupOid,
                mdv: this.props.sourceMdv,
                defineVersion: this.props.defineVersion,
                vlmLevel: 0,
            });
            this.setState({
                sourceItemGroupOid: event.target.value,
                itemGroupData,
                selected: [],
                page: 0,
            });
        }
    };


    handleChangeSearchString = event => {
        this.setState({ searchString: event.target.value });
    };

    getVariableTable(defineVersion, classes) {
        const { selected, page, rowsPerPage, searchString, itemGroupData } = this.state;

        let data = itemGroupData.slice();

        if (searchString !== '') {
            data = data.filter( row => {
                if (/[A-Z]/.test(searchString)) {
                    return row.name.includes(searchString) || row.label.includes(searchString);
                } else {
                    return row.name.toLowerCase().includes(searchString.toLowerCase())
                        || row.label.toLowerCase().includes(searchString.toLowerCase());
                }
            });
        }


        let numSelected = this.state.selected.length;

        return (
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <Grid
                        container
                        spacing={0}
                        justify="space-between"
                        alignItems="center"
                    >
                        {numSelected > 0 ? (
                            <Grid item>
                                <Button
                                    onClick={this.handleAddVariables}
                                    color="default"
                                    mini
                                    variant="raised"
                                    className={classes.addButton}
                                >
                                    Add {numSelected} variables
                                </Button>
                            </Grid>
                        ) : (
                            <Grid item>
                                <TextField
                                    label='Dataset'
                                    value={this.state.sourceItemGroupOid}
                                    onChange={this.handleItemGroupChange}
                                    className={classes.datasetSelector}
                                    select
                                >
                                    {getSelectionList(this.state.itemGroupList)}
                                </TextField>
                            </Grid>
                        )}
                        <Grid item>
                            <TextField
                                onChange={this.handleChangeSearchString}
                                value={this.state.searchString}
                                label='Search'
                                className={classes.searchField}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={numSelected > 0 && numSelected < data.length}
                                        checked={numSelected === data.length}
                                        onChange={this.handleSelectAllClick}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Label</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(row => {
                                    let isSelected = selected.includes(row.itemRefOid);
                                    return (
                                        <TableRow
                                            key={row.itemRefOid}
                                            onClick={ event => this.handleClick(event, row.itemRefOid) }
                                            role="checkbox"
                                            selected={isSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.label}</TableCell>
                                            <TableCell>
                                                <DescriptionFormatter model={this.props.sourceMdv.model} leafs={this.props.sourceMdv.leafs} value={row.description}/>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </Grid>
                <Grid item xs={12}>
                    <TablePagination
                        component="div"
                        count={this.state.itemGroupData.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        rowsPerPageOptions={[25,50,100]}
                    />
                </Grid>
            </Grid>
        );
    }

    render() {
        const { defineVersion, classes } = this.props;
        return (
            <div className={classes.root}>
                {this.getVariableTable(
                    defineVersion,
                    classes
                )}
            </div>
        );
    }
}

ConnectedCodedValueSelector.propTypes = {
    classes: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    sourceMdv: PropTypes.object.isRequired,
    sameDefine: PropTypes.bool.isRequired,
    defineVersion: PropTypes.string.isRequired,
    itemGroupOid: PropTypes.string.isRequired,
    position: PropTypes.string,
};

const CodedValueSelector = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedCodedValueSelector
);
export default withStyles(styles)(CodedValueSelector);
