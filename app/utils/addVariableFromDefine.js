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
import compareLeafs from 'utils/compareLeafs.js';
import DescriptionFormatter from 'formatters/descriptionFormatter.js';
import { addVariables } from 'actions/index.js';
import { ItemDef, ItemRef, ValueList, WhereClause, CodeList, Leaf } from 'elements.js';

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
            baseFolder: state.defines.byId[state.odm.defineId].pathToFile,
            sameDefine: false,
        };
    } else {
        return {
            mdv: state.odm.study.metaDataVersion,
            defineVersion: state.odm.study.metaDataVersion.defineVersion,
            baseFolder: state.defines.byId[state.odm.defineId].pathToFile,
            sourceMdv: state.odm.study.metaDataVersion,
            sourceDefineId: state.odm.defineId,
            sameDefine: true,
        };
    }
};

const copyItems = ({currentGroup, sourceGroup, mdv, sourceMdv, selected, parentItemDefOid, copyVlm} = {}) => {
    let itemDefs = {};
    let itemRefs = { [currentGroup.oid]: {} };
    let valueLists = {};
    let whereClauses = {};
    let processedItemDefs = {};
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
        processedItemDefs[itemRef.itemOid] = newItemDefOid;
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
            processedItemDefs = { ...processedItemDefs, ...vlCopy.processedItemDefs };
        }
    });
    return { itemDefs, itemRefs, valueLists, whereClauses, processedItemDefs };
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

const getInitialValues = (props) => {
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

    return { itemGroupList, sourceItemGroupOid, itemGroupData };
};

class AddVariableFromDefineConnected extends React.Component {
    constructor(props) {
        super(props);

        const { itemGroupList, sourceItemGroupOid, itemGroupData } = getInitialValues(props);

        this.state = {
            selected: [],
            searchString: '',
            itemGroupList,
            sourceDefineId: props.sourceDefineId,
            sourceItemGroupOid,
            itemGroupData,
            detachMethods: true,
            detachComments: true,
            copyVlm: true,
            rowsPerPage : 25,
            page: 0,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // If source ODM has changed
        if (nextProps.sourceDefineId !== prevState.sourceDefineId) {
            return ({ ...getInitialValues(nextProps), sourceDefineId: nextProps.sourceDefineId });
        } else {
            return null;
        }
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
        let { mdv, sourceMdv, baseFolder, itemGroupOid, position, sameDefine } = this.props;
        // Get new OIDs for each of the variables (both ItemRef and ItemDef)
        let currentGroup = mdv.itemGroups[itemGroupOid];
        let sourceGroup = sourceMdv.itemGroups[this.state.sourceItemGroupOid];
        let { itemDefs, itemRefs, valueLists, whereClauses, processedItemDefs } = copyItems({
            currentGroup,
            sourceGroup,
            mdv: mdv,
            sourceMdv: sourceMdv,
            selected: this.state.selected,
            parentItemDefOid: undefined,
            copyVlm: this.state.copyVlm,
        });
        // If it is the same define, then there is no need to rebuild codeLists, other than update sources
        let codeLists = {};
        let processedCodeLists = {};
        let codeListSources = {};
        if (sameDefine === false) {
            let codeListOids = Object.keys(mdv.codeLists);
            Object.keys(itemDefs).forEach( itemDefOid => {
                let sourceCodeListOid = itemDefs[itemDefOid].codeListOid;
                if (sourceCodeListOid !== undefined && !processedCodeLists.hasOwnProperty(sourceCodeListOid)) {
                    let codeList = { ...new CodeList({
                        ...sourceMdv.codeLists[sourceCodeListOid],
                        sources: undefined,
                    }) };
                    let name = codeList.name;
                    // Search for the same name in the existing codelists
                    let matchingIds = [];
                    Object.keys(mdv.codeLists).forEach(codeListOid => {
                        if (mdv.codeLists[codeListOid].name === name) {
                            matchingIds.push(codeListOid);
                        }
                    });
                    // Perform deep compare of the codelists
                    let newCodeListOid;
                    matchingIds.some( codeListOid => {
                        if (compareCodeLists(mdv.codeLists[codeListOid], codeList)) {
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

                    codeListSources[newCodeListOid] = { itemDefs: [itemDefOid] };
                    processedCodeLists[sourceCodeListOid] = newCodeListOid;
                    itemDefs[itemDefOid].codeListOid = newCodeListOid;
                } else if (sourceCodeListOid !== undefined && processedCodeLists.hasOwnProperty(sourceCodeListOid)) {
                    // If the codelist was already processed in some other ItemDef
                    let newCodeListOid = processedCodeLists[sourceCodeListOid];
                    codeListSources[newCodeListOid].itemDefs.push(itemDefOid);
                    itemDefs[itemDefOid].codeListOid = newCodeListOid;
                }
            });
            // Add sources for all newly added codelists
            Object.keys(codeLists).forEach( codeListOid => {
                let codeList = codeLists[codeListOid];
                codeList.sources.itemDefs = codeListSources[codeListOid].itemDefs;
            });
        }
        // Copy methods;
        let methods = {};
        if (sameDefine === false || this.state.detachMethods === true) {
            // Variable-level methods
            Object.keys(itemRefs[itemGroupOid]).forEach( itemRefOid => {
                let itemRef = itemRefs[itemGroupOid][itemRefOid];
                if (itemRef.methodOid !== undefined) {
                    let { newMethodOid, method, duplicateFound } = copyMethod({
                        sourceMethodOid: itemRef.methodOid,
                        mdv: mdv,
                        sourceMdv: sourceMdv,
                        searchForDuplicate: (this.state.detachMethods === false && sameDefine === false),
                        groupOid: itemGroupOid,
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
                                mdv: mdv,
                                sourceMdv: sourceMdv,
                                searchForDuplicate: (this.state.detachMethods === false && sameDefine === false),
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
        if (sameDefine === false || this.state.detachComments === true) {
            // ItemDef comments
            Object.keys(itemDefs).forEach( itemDefOid => {
                let itemDef = itemDefs[itemDefOid];
                if (itemDef.commentOid !== undefined) {
                    let { newCommentOid, comment, duplicateFound } = copyComment({
                        sourceCommentOid: itemDef.commentOid,
                        mdv: mdv,
                        sourceMdv: sourceMdv,
                        searchForDuplicate: (this.state.detachComments === false && sameDefine === false),
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
                            mdv: mdv,
                            sourceMdv: sourceMdv,
                            searchForDuplicate: (this.state.detachComments === false && sameDefine === false),
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

        // Copy Leafs
        let leafs = {};
        if (sameDefine === false) {
            let leafIds = [];
            // Check which documents are referenced in methods or comments
            Object.keys(methods).forEach( methodOid => {
                let documents = methods[methodOid].documents;
                if (documents.length > 0) {
                    documents.forEach( doc =>  {
                        if (!leafIds.includes[doc.leafId]) {
                            leafIds.push(doc.leafId);
                        }
                    });
                }
            });
            Object.keys(comments).forEach( commentOid => {
                let documents = comments[commentOid].documents;
                if (documents.length > 0) {
                    documents.forEach( doc =>  {
                        if (!leafIds.includes[doc.leafId]) {
                            leafIds.push(doc.leafId);
                        }
                    });
                }
            });
            // Compare leafs with the existing leafs;
            let finalLeafIds = leafIds.slice();
            leafIds.forEach( sourceLeafId => {
                Object.keys(mdv.leafs).some( leafId => {
                    if (compareLeafs(sourceMdv.leafs[sourceLeafId], mdv.leafs[leafId])) {
                        finalLeafIds.splice(finalLeafIds.indexOf(sourceLeafId), 1);
                        return true;
                    }
                });
            });

            finalLeafIds.forEach( leafId => {
                leafs[leafId] = { ...new Leaf({ ...sourceMdv.leafs[leafId], baseFolder }) };
            });
        }

        // Update WhereClause refereces;
        Object.keys(whereClauses).forEach( whereClauseOid => {
            let whereClause = whereClauses[whereClauseOid];
            whereClause.rangeChecks.forEach( rangeCheck => {
                if (rangeCheck.itemGroupOid === sourceGroup.oid && Object.keys(processedItemDefs).includes(rangeCheck.itemOid)) {
                    rangeCheck.itemGroupOid = currentGroup.oid;
                    rangeCheck.itemOid = processedItemDefs[rangeCheck.itemOid];
                } else {
                    rangeCheck.itemGroupOid = undefined;
                    rangeCheck.itemOid = undefined;
                }
            });
        });

        // Get position to insert
        let positionUpd = position || (mdv.itemGroups[itemGroupOid].itemRefOrder.length + 1);

        this.props.addVariables({
            itemGroupOid: this.props.itemGroupOid,
            position: positionUpd,
            itemDefs,
            itemRefs,
            codeLists,
            methods,
            leafs,
            comments,
            valueLists,
            whereClauses,
        });

        this.props.onClose();
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
                                    disabled={!this.props.sameDefine}
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
                                    disabled={!this.props.sameDefine}
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

AddVariableFromDefineConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    sourceMdv: PropTypes.object.isRequired,
    sameDefine: PropTypes.bool.isRequired,
    defineVersion: PropTypes.string.isRequired,
    itemGroupOid: PropTypes.string.isRequired,
    sourceDefineId: PropTypes.string.isRequired,
    baseFolder: PropTypes.string,
    position: PropTypes.number,
    onClose: PropTypes.func.isRequired,
};

const addVariableFromDefine = connect(mapStateToProps, mapDispatchToProps)(
    AddVariableFromDefineConnected
);
export default withStyles(styles)(addVariableFromDefine);
