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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import getSelectionList from 'utils/getSelectionList.js';
import getOid from 'utils/getOid.js';
import clone from 'clone';
import getTableDataForImport from 'utils/getTableDataForImport.js';
import compareCodeLists from 'utils/compareCodeLists.js';
import compareMethods from 'utils/compareMethods.js';
import compareComments from 'utils/compareComments.js';
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
    checkBoxes: {
        marginLeft: theme.spacing.unit * 2,
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

const copyItems = ({currentGroup, sourceGroup, mdv, sourceMdv, selected, parentItemDefOid, copyVlm} = {}) => {
    let itemDefs = {};
    let itemRefs = { [currentGroup.oid]: {} };
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
            itemRef.whereClauseOid = newWhereClauseOid;
        }
        currentItemRefs.push(newItemRefOid);
        currentItemDefs.push(newItemDefOid);
        itemRefs[currentGroup.oid][newItemRefOid] = { ...new ItemRef({ ...itemRef, oid: newItemRefOid, itemOid: newItemDefOid }) };
        let sources;
        if (parentItemDefOid !== undefined) {
            sources = {itemGroups: [], valueLists: [currentGroup.oid]};
        } else {
            sources = {itemGroups: [currentGroup.oid], valueLists: []};
        }
        itemDefs[newItemDefOid] = {...new ItemDef({
            ...clone(sourceMdv.itemDefs[itemRef.itemOid]),
            oid: newItemDefOid,
            parentItemDefOid,
            sources})
        };
        // Check if VLM is attached
        if (copyVlm === true && itemDefs[newItemDefOid].valueListOid !== undefined) {
            let valueList = clone(sourceMdv.valueLists[itemDefs[newItemDefOid].valueListOid]);
            let newValueListOid = getOid('ValueList', undefined, currentValueLists);
            itemDefs[newItemDefOid].valueListOid = newValueListOid;
            currentValueLists.push(newValueListOid);
            valueLists[newValueListOid] = { ...new ValueList({
                ...valueList, itemRefs: {}, itemRefOrder: [], oid: newValueListOid, sources: {itemDefs: [newItemDefOid]}
            }) };
            let vlCopy = copyItems({
                currentGroup: valueLists[newValueListOid],
                sourceGroup: valueList,
                mdv,
                sourceMdv,
                selected: valueList.itemRefOrder,
                parentItemDefOid: newItemDefOid,
                copyVlm,
            });
            valueLists[newValueListOid].itemRefs = vlCopy.itemRefs[newValueListOid];
            valueLists[newValueListOid].itemRefOrder = Object.keys(vlCopy.itemRefs[newValueListOid]);
            // No need to update itemRefs as VLM itemRefs are  already included in ValueList
            itemDefs = { ...itemDefs, ...vlCopy.itemDefs };
            valueLists = { ...valueLists, ...vlCopy.valueLists };
            whereClauses = { ...whereClauses, ...vlCopy.whereClauses };
        }
    });
    return { itemDefs, itemRefs, valueLists, whereClauses };
};

const copyMethod = ({sourceMethodOid, mdv, sourceMdv, searchForDuplicate, groupOid, itemRefOid, vlm} = {}) => {
    let method = clone(sourceMdv.methods[sourceMethodOid]);
    let methodOids = Object.keys(mdv.methods);
    let name = method.name;
    let newMethodOid;
    let duplicateFound = false;
    // Perform deep compare of the methods in case methods are not detached and coming from a different Define-XML
    if (searchForDuplicate === true) {
        // Search for the same name in the existing methods
        let matchingIds = [];
        Object.keys(mdv.methods).forEach(methodOid => {
            if (mdv.methods[methodOid].name === name) {
                matchingIds.push(methodOid);
            }
        });
        matchingIds.some( methodOid => {
            if (compareMethods(mdv.methods[methodOid], method)) {
                newMethodOid = methodOid;
                duplicateFound = true;
                return true;
            }
        });
    }
    if (!duplicateFound) {
        newMethodOid = getOid('Method', undefined, methodOids);
        if (vlm === true) {
            method.sources = { itemGroups: {}, valueLists: { [groupOid]: [itemRefOid] } };
        } else {
            method.sources = { itemGroups: { [groupOid]: [itemRefOid] }, valueLists: {} };
        }
        method.oid = newMethodOid;
    }
    return { newMethodOid, method, duplicateFound };
};

const copyComment = ({sourceCommentOid, mdv, sourceMdv, searchForDuplicate, itemDefOid, whereClauseOid} = {}) => {
    let comment = clone(sourceMdv.comments[sourceCommentOid]);
    let commentOids = Object.keys(mdv.comments);
    // Search for the same name in the existing comments
    let newCommentOid;
    let duplicateFound = false;
    // Perform deep compare of the comments in case comments are not detached and coming from a different Define-XML
    if (searchForDuplicate === true) {
        Object.keys(mdv.comments).forEach(commentOid => {
            if (compareComments(mdv.comments[commentOid], comment)) {
                newCommentOid = commentOid;
                duplicateFound = true;
                return true;
            }
        });
    }
    if (!duplicateFound) {
        newCommentOid = getOid('Comment', undefined, commentOids);
        comment.sources = {
            itemDefs: itemDefOid !== undefined ? [itemDefOid] : [],
            itemGroups: [],
            whereClauses: whereClauseOid !== undefined ? [whereClauseOid] : [],
            codeLists: [],
            metaDataVersion: [],
        };
        comment.oid = newCommentOid;
    }
    return { newCommentOid, comment, duplicateFound };
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
            detachComments: true,
            copyVlm: true,
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
        let { itemDefs, itemRefs, valueLists, whereClauses } = copyItems({
            currentGroup,
            sourceGroup,
            mdv: this.props.mdv,
            sourceMdv: this.props.sourceMdv,
            selected: this.state.selected,
            parentItemDefOid: undefined,
            copyVlm: this.state.copyVlm,
        });
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
                            return true;
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
            // Variable-level methods
            Object.keys(itemRefs[this.props.itemGroupOid]).forEach( itemRefOid => {
                let itemRef = itemRefs[this.props.itemGroupOid][itemRefOid];
                if (itemRef.methodOid !== undefined) {
                    let { newMethodOid, method, duplicateFound } = copyMethod({
                        sourceMethodOid: itemRef.methodOid,
                        mdv: this.props.mdv,
                        sourceMdv: this.props.sourceMdv,
                        searchForDuplicate: (this.state.detachMethods === false && this.props.sameDefine === false),
                        groupOid: this.props.itemGroupOid,
                        itemRefOid,
                        vlm: false,
                    });
                    itemRef.methodOid = newMethodOid;
                    if (!duplicateFound) {
                        methods[newMethodOid] = method;
                    }
                }
            });
            // Value-level methods
            if (this.state.copyVlm === true) {
                Object.keys(valueLists).forEach( valueListOid => {
                    Object.keys(valueLists[valueListOid].itemRefs).forEach( itemRefOid => {
                        let itemRef = valueLists[valueListOid].itemRefs[itemRefOid];
                        if (itemRef.methodOid !== undefined) {
                            let { newMethodOid, method, duplicateFound } = copyMethod({
                                sourceMethodOid: itemRef.methodOid,
                                mdv: this.props.mdv,
                                sourceMdv: this.props.sourceMdv,
                                searchForDuplicate: (this.state.detachMethods === false && this.props.sameDefine === false),
                                groupOid: valueListOid,
                                itemRefOid,
                                vlm: true,
                            });
                            itemRef.methodOid = newMethodOid;
                            if (!duplicateFound) {
                                methods[newMethodOid] = method;
                            }
                        }
                    });
                });
            }
        }

        // Copy comments;
        let comments = {};
        if (this.props.sameDefine === false || this.state.detachComments === true) {
            // ItemDef comments
            Object.keys(itemDefs).forEach( itemDefOid => {
                let itemDef = itemDefs[itemDefOid];
                if (itemDef.commentOid !== undefined) {
                    let { newCommentOid, comment, duplicateFound } = copyComment({
                        sourceCommentOid: itemDef.commentOid,
                        mdv: this.props.mdv,
                        sourceMdv: this.props.sourceMdv,
                        searchForDuplicate: (this.state.detachComments === false && this.props.sameDefine === false),
                        itemDefOid,
                    });
                    itemDef.commentOid = newCommentOid;
                    if (!duplicateFound) {
                        comments[newCommentOid] = comment;
                    }
                }
            });
            // Where Clause Comments
            if (this.state.copyVlm === true) {
                Object.keys(whereClauses).forEach( whereClauseOid => {
                    let whereClause = whereClauses[whereClauseOid];
                    if (whereClause.commentOid !== undefined) {
                        let { newCommentOid, comment, duplicateFound } = copyComment({
                            sourceCommentOid: whereClause.commentOid,
                            mdv: this.props.mdv,
                            sourceMdv: this.props.sourceMdv,
                            searchForDuplicate: (this.state.detachComments === false && this.props.sameDefine === false),
                            whereClauseOid,
                        });
                        WhereClause.commentOid = newCommentOid;
                        if (!duplicateFound) {
                            comments[newCommentOid] = comment;
                        }
                    }
                });
            }
        }

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

    handleCheckBoxChange = name => event => {
        this.setState({ [name]: !this.state[name] });
    }

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
                    <FormGroup row className={classes.checkBoxes}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.copyVlm}
                                    onChange={this.handleCheckBoxChange('copyVlm')}
                                    color='primary'
                                    value='copyVlm'
                                />
                            }
                            label="Copy VLM"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.detachMethods}
                                    onChange={this.handleCheckBoxChange('detachMethods')}
                                    color='primary'
                                    value='detachMethods'
                                />
                            }
                            label="Detach Methods"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.detachComments}
                                    onChange={this.handleCheckBoxChange('detachComments')}
                                    color='primary'
                                    value='detachComments'
                                />
                            }
                            label="Detach Comments"
                        />
                    </FormGroup>
                </Grid>
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
