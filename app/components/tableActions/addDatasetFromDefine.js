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
import getDatasetDataForImport from 'utils/getDatasetDataForImport.js';
import copyVariables from 'utils/copyVariables.js';
import { addItemGroups } from 'actions/index.js';
import { ItemGroup } from 'elements.js';
import CommentFormatter from 'formatters/commentFormatter.js';
import getOid from 'utils/getOid.js';

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
        addItemGroups: (updateObj) => dispatch(addItemGroups(updateObj))
    };
};

const mapStateToProps = (state, props) => {
    if (props.sourceMdv !== undefined) {
        return {
            mdv: state.present.odm.study.metaDataVersion,
            defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
            model: state.present.odm.study.metaDataVersion.model,
            sameDefine: false,
        };
    } else {
        return {
            mdv: state.present.odm.study.metaDataVersion,
            defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
            sourceMdv: state.present.odm.study.metaDataVersion,
            sourceDefineId: state.present.odm.defineId,
            model: state.present.odm.study.metaDataVersion.model,
            sameDefine: true,
        };
    }
};

const getInitialValues = (props) => {
    // Get initial data
    let itemGroupsData = getDatasetDataForImport({
        source: props.sourceMdv,
        defineVersion: props.defineVersion,
    });

    return { itemGroupsData };
};

class AddDatasetFromDefineConnected extends React.Component {
    constructor(props) {
        super(props);

        const { itemGroupsData } = getInitialValues(props);

        let purpose;
        if (this.props.model === 'ADaM') {
            purpose = 'Analysis';
        } else {
            purpose = 'Tabulation';
        }

        this.state = {
            selected: [],
            searchString: '',
            sourceDefineId: props.sourceDefineId,
            itemGroupsData,
            purpose,
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
            const itemGroupOids = this.props.sourceMdv.order.itemGroupOrder;
            this.setState({ selected: itemGroupOids });
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

    handleAddDatasets = () => {
        let { mdv, sourceMdv, position, sameDefine } = this.props;
        let itemGroups = {};
        let currentGroupOids = mdv.order.itemGroupOrder.slice();
        this.state.selected.forEach( sourceItemGroupOid => {
            let sourceGroup = sourceMdv.itemGroups[sourceItemGroupOid];
            let itemGroupOid = getOid('ItemGroup', undefined, currentGroupOids);
            currentGroupOids.push(itemGroupOid);
            let currentGroup = { ...new ItemGroup({ ...sourceGroup, oid: itemGroupOid, purpose: this.state.purpose }) };
            let existingOids = {
                itemDefs: [],
                methods: [],
                comments: [],
                codeLists: [],
                whereClauses: [],
                valueLists: [],
            };
            let result = copyVariables({
                mdv,
                sourceMdv,
                currentGroup,
                sourceGroup,
                itemRefList: Object.keys(sourceGroup.itemRefs),
                itemGroupOid,
                sameDefine,
                sourceItemGroupOid: sourceItemGroupOid,
                copyVlm: this.state.copyVlm,
                detachMethods: this.state.detachMethods,
                detachComments: this.state.detachComments,
                existingOids,
            });
            // Update the list of OIDs, so that they are not reused;
            ['itemDefs','methods', 'comments', 'codeLists', 'whereClauses', 'valueLists'].forEach( type => {
                existingOids[type] = existingOids[type].concat(Object.keys(result[type]));
            });
            currentGroup.itemRefs = result.itemRefs[itemGroupOid];
            currentGroup.keyOrder = currentGroup.keyOrder.map( itemRefOid => (result.processedItemRefs[itemRefOid]));
            currentGroup.itemRefOrder = currentGroup.itemRefOrder.map( itemRefOid => (result.processedItemRefs[itemRefOid]));
            result.itemGroup = currentGroup;
            delete result.itemRefs;

            itemGroups[itemGroupOid] = result;
        });

        // Get position to insert
        let positionUpd = position || (mdv.order.itemGroupOrder.length + 1);

        this.props.addItemGroups({
            position: positionUpd,
            itemGroups,
        });

        this.props.onClose();
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handleChangeSearchString = event => {
        this.setState({ searchString: event.target.value });
    };

    handleCheckBoxChange = name => event => {
        this.setState({ [name]: !this.state[name] });
    }

    getVariableTable(defineVersion, classes) {
        const { selected, page, rowsPerPage, searchString, itemGroupsData } = this.state;

        let data;

        if (searchString !== '') {
            data = itemGroupsData.filter( row => {
                if (/[A-Z]/.test(searchString)) {
                    return row.name.includes(searchString)
                        || row.description.includes(searchString)
                        || row.class.includes(searchString);
                } else {
                    return row.name.toLowerCase().includes(searchString.toLowerCase())
                        || row.description.toLowerCase().includes(searchString.toLowerCase())
                        || row.class.toLowerCase().includes(searchString.toLowerCase());
                }
            });
        } else {
            data = itemGroupsData;
        }

        let numSelected = this.state.selected.length;

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Grid container justify='space-between'>
                        <Grid item>
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
                    <Grid
                        container
                        spacing={0}
                        justify="space-between"
                        alignItems="center"
                    >
                        <Grid item>
                            <Button
                                onClick={this.handleAddDatasets}
                                color="default"
                                mini
                                variant="raised"
                                className={classes.addButton}
                            >
                                Add {numSelected} datasets
                            </Button>
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
                                <TableCell>Description</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Comment</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(row => {
                                    let isSelected = selected.includes(row.oid);
                                    return (
                                        <TableRow
                                            key={row.oid}
                                            onClick={ event => this.handleClick(event, row.oid) }
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
                                            <TableCell>{row.description}</TableCell>
                                            <TableCell>{row.class}</TableCell>
                                            <TableCell>
                                                { row.comment !== undefined &&
                                                        <CommentFormatter leafs={this.props.sourceMdv.leafs} comment={row.comment}/>
                                                }
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
                        count={data.length}
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

AddDatasetFromDefineConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    sourceMdv: PropTypes.object.isRequired,
    sameDefine: PropTypes.bool.isRequired,
    defineVersion: PropTypes.string.isRequired,
    sourceDefineId: PropTypes.string.isRequired,
    position: PropTypes.number,
    onClose: PropTypes.func.isRequired,
};

const addDatasetFromDefine = connect(mapStateToProps, mapDispatchToProps)(
    AddDatasetFromDefineConnected
);
export default withStyles(styles)(addDatasetFromDefine);
