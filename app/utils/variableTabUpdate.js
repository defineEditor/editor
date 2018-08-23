import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import VariableTabFilter from 'utils/variableTabFilter.js';
import Switch from '@material-ui/core/Switch';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
//import TextField from '@material-ui/core/TextField';
//import IconButton from '@material-ui/core/IconButton';
import FilterListIcon from '@material-ui/icons/FilterList';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
//import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
//import getSelectionList from 'utils/getSelectionList.js';
import getTableDataForFilter from 'utils/getTableDataForFilter.js';
import applyFilter from 'utils/applyFilter.js';
//import clone from 'clone';
import {
    updateFilter
} from 'actions/index.js';


const styles = theme => ({
    dialog: {
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 1,
        position: 'absolute',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        top: '20%',
        transform: 'translate(0%, calc(-20%+0.5px))',
        overflowX: 'auto',
        maxHeight: '80%',
        width: '60%',
        overflowY: 'auto'
    },
    textField: {
        whiteSpace : 'normal',
        minWidth   : '120px',
    },
    textFieldComparator: {
        whiteSpace : 'normal',
        minWidth   : '50px',
    },
    textFieldValues: {
        whiteSpace : 'normal',
        minWidth   : '100px',
        marginLeft : theme.spacing.unit,
    },
    valuesGridItem: {
        maxWidth   : '60%',
        marginLeft : theme.spacing.unit,
    },
    buttonLine: {
        marginTop    : theme.spacing.unit * 2,
        marginBottom : theme.spacing.unit * 2,
    },
    connector: {
        marginLeft : theme.spacing.unit * 7,
        marginTop  : theme.spacing.unit * 2,
    },
    firstRangeCheck: {
        marginLeft : theme.spacing.unit * 8,
        marginTop  : theme.spacing.unit * 2,
    },
    button: {
        marginLeft: theme.spacing.unit,
    },
    controlButtons: {
        marginTop: theme.spacing.unit * 4,
        marginLeft: theme.spacing.unit,
    },
    paper: {
        padding: theme.spacing.unit,
        minWidth: '400px',
    },
    filteredItemsCount: {
        color: theme.palette.primary.main,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateVariables: (oid, updateObj) => dispatch(updateFilter(oid, updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        mdv           : state.odm.study.metaDataVersion,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
    };
};

/*const updateFields = {
    'dataset'       : { label: 'Dataset', type: 'flag' },
    'name'          : { label: 'Name', type: 'string' },
    'label'         : { label: 'Label', type: 'string' },
    'dataType'      : { label: 'Data Type', type: 'string' },
    'codeList'      : { label: 'Codelist', type: 'string' },
    'origin'        : { label: 'Origin', type: 'string' },
    'length'        : { label: 'Length', type: 'number' },
    'method'        : { label: 'Method', type: 'string' },
    'comment'       : { label: 'Comment', type: 'string' },
    'hasDocument'   : { label: 'Has Document', type: 'flag' },
    'mandatory'     : { label: 'Mandatory', type: 'flag' },
    'displayFormat' : { label: 'Display Format', type: 'string' },
    'role'          : { label: 'Role', type: 'flag' },
    'isVlm'         : { label: 'Is VLM', type: 'flag' },
    'parentItemDef' : { label: 'Parent Variable', type: 'string' },
    'hasVlm'        : { label: 'Has VLM', type: 'flag' },
};
*/

class ConnectedVariableTabUpdate extends React.Component {
    constructor (props) {
        super(props);

        let selectedItems = this.props.selectedItems || [];
        let filter = {
            isEnabled: false,
            applyToVlm: true,
            conditions : [{field: 'dataset', comparator: 'IN', selectedValues: [this.props.mdv.itemGroups[this.props.itemGroupOid].name]}],
            connectors: [],
        };

        this.state = {
            selectedItems,
            field : 'dataset',
            updateType: 'set',
            updateObj: {},
            anchorEl: null,
            showFilter: false,
            filter,
        };
    }

    handleChange = (name, index, connector) => (updateObj) => {
        let result = [ ...this.state.conditions ];
        result[index] = { ...this.state.conditions[index] };
        if (name === 'field') {
            // Do nothing if name did not change
            if (result[index].field === updateObj.target.event) {
                return;
            }
            result[index].field = updateObj.target.value;
            // Reset all other values
            result[index].comparator = 'IN';
            result[index].selectedValues = [];
            this.setState({
                conditions      : result,
            });
        } else if (name === 'comparator') {
            if (result[index].comparator === updateObj.target.event) {
                return;
            }
            result[index].comparator = updateObj.target.value;
            // Reset check values if there are multiple values selected and changing from IN/NOT to a comparator with a single value
            if (['NOTIN','IN'].indexOf(this.state.conditions[index].comparator) >= 0
                &&
                ['NOTIN','IN'].indexOf(result[index].comparator) < 0
                &&
                result[index].selectedValues.length > 1
            ) {
                result[index].selectedValues = [];
            }
            this.setState({
                conditions: result,
            });
        } else if (name === 'selectedValues') {
            if (typeof updateObj.target.value === 'object') {
                // Fix an issue when a blank values appreas when keyboard is used
                // TODO: Investigate issue, see https://trello.com/c/GVhBqI4W/65
                result[index].selectedValues = updateObj.target.value.filter(value => value !== '');
            } else {
                result[index].selectedValues = [updateObj.target.value];
            }
            this.setState({
                conditions: result,
            });
        }
    }

    getData = () => {
        const mdv = this.props.mdv;
        const dataset = mdv.itemGroups[this.props.itemGroupOid];
        // Get variable level metadata
        let variables = getTableDataForFilter({
            source        : dataset,
            datasetName   : dataset.name,
            datasetOid    : dataset.oid,
            itemDefs      : mdv.itemDefs,
            codeLists     : mdv.codeLists,
            mdv           : mdv,
            defineVersion : this.props.defineVersion,
            vlmLevel      : 0,
        });

        variables
            .filter( item => (item.valueListOid !== undefined) )
            .forEach( item => {
                let vlmData = getTableDataForFilter({
                    source        : mdv.valueLists[item.valueListOid],
                    datasetName   : dataset.name,
                    datasetOid    : dataset.oid,
                    itemDefs      : mdv.itemDefs,
                    codeLists     : mdv.codeLists,
                    mdv           : mdv,
                    defineVersion : this.props.defineVersion,
                    vlmLevel      : 1,
                });
                let startIndex = variables.map(item => item.oid).indexOf(item.oid) + 1;
                variables.splice.apply(variables, [startIndex, 0].concat(vlmData));
            });

        return variables;
    }

    onFilterUpdate = (filter) => {
        // In case the filter is used to select itemOids, build the list of OIDs
        let selectedItems=[];
        const mdv = this.props.mdv;
        // Get itemGroupOids from name
        let itemGroupOids = [];
        Object.keys(mdv.itemGroups).forEach( itemGroupOid => {
            if (
                (filter.conditions[0].comparator === 'IN'
                    && filter.conditions[0].selectedValues.includes(this.props.mdv.itemGroups[itemGroupOid].name)
                )
                ||
                (filter.conditions[0].comparator === 'NOTIN'
                    && !filter.conditions[0].selectedValues.includes(this.props.mdv.itemGroups[itemGroupOid].name)
                )
            )
            {
                itemGroupOids.push(itemGroupOid);
            }
        });
        // Delete the first condition, as it contains only the list of datasets and cannot be used for filtering
        let updatedFilter = { ...filter };
        updatedFilter.conditions = filter.conditions.slice();
        updatedFilter.conditions.splice(0,1);
        if (updatedFilter.connectors.length > 0) {
            updatedFilter.connectors = filter.connectors.slice();
            updatedFilter.connectors.splice(0,1);
        }

        itemGroupOids.forEach( itemGroupOid => {
            const dataset = mdv.itemGroups[itemGroupOid];
            // If only datasets were selected, collect all OIDs
            if (updatedFilter.conditions.length === 0) {
                Object.keys(dataset.itemRefs).forEach( itemRefOid => {
                    selectedItems.push({ itemGroupOid: itemGroupOid, itemDefOid: dataset.itemRefs[itemRefOid].itemOid });
                    if (updatedFilter.applyToVlm) {
                        if (mdv.itemDefs[dataset.itemRefs[itemRefOid].itemOid].valueListOid !== undefined) {
                            let valueList = mdv.valueLists[mdv.itemDefs[dataset.itemRefs[itemRefOid].itemOid].valueListOid];
                            Object.keys(valueList.itemRefs).forEach( itemRefOid => {
                                selectedItems.push({ itemGroupOid: itemGroupOid, valueListOid: valueList.oid, itemDefOid: valueList.itemRefs[itemRefOid].itemOid });
                            });
                        }
                    }
                });
            } else {
                let data = getTableDataForFilter({
                    source        : dataset,
                    datasetName   : dataset.name,
                    datasetOid    : dataset.oid,
                    itemDefs      : mdv.itemDefs,
                    codeLists     : mdv.codeLists,
                    mdv           : mdv,
                    defineVersion : this.props.defineVersion,
                    vlmLevel      : 0,
                });
                let filteredOids = applyFilter(data, updatedFilter);
                filteredOids.forEach( itemOid => {
                    selectedItems.push({ itemGroupOid: itemGroupOid, itemDefOid: itemOid });
                });
                if (updatedFilter.applyToVlm) {
                    // Search in VLM
                    data
                        .filter( item => (item.valueListOid !== undefined) )
                        .forEach( item => {
                            let vlmData = getTableDataForFilter({
                                source        : mdv.valueLists[item.valueListOid],
                                datasetName   : dataset.name,
                                datasetOid    : dataset.oid,
                                itemDefs      : mdv.itemDefs,
                                codeLists     : mdv.codeLists,
                                mdv           : mdv,
                                defineVersion : this.props.defineVersion,
                                vlmLevel      : 1,
                            });
                            let vlmFilteredOids = applyFilter(vlmData, updatedFilter);
                            vlmFilteredOids.forEach( itemOid => {
                                selectedItems.push({ itemGroupOid: itemGroupOid, valueListOid: item.valueListOid, itemDefOid: itemOid });
                            });
                        });
                }
            }
        });
        this.setState({ filter, selectedItems });
    }

    handlePopoverOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handlePopoverClose = () => {
        this.setState({ anchorEl: null });
    };

    getSelectedRecords = () => {
        const mdv = this.props.mdv;
        let result = [];
        this.state.selectedItems.forEach( item => {
            let name = mdv.itemDefs[item.itemDefOid].name;
            let dsName = mdv.itemGroups[item.itemGroupOid].name;
            if (item.valueListOid) {
                let parentItemName = mdv.itemDefs[mdv.itemDefs[item.itemDefOid].parentItemDefOid].name;
                result.push(
                    <ListItem key={dsName + '.' + parentItemName + '.' + name}>
                        <ListItemText primary={dsName + '.' + parentItemName + '.' + name}/>
                    </ListItem>
                );
            } else {
                result.push(
                    <ListItem key={dsName + '.' + name}>
                        <ListItemText primary={dsName + '.' + name}/>
                    </ListItem>
                );
            }
        });
        return (
            <List>
                {result}
            </List>
        );
    }

    cancel = () => {
        this.props.onClose();
    }

    render() {
        const {classes} = this.props;
        const itemNum = this.state.selectedItems.length;
        const { anchorEl } = this.state;
        const showSelectedRecords = Boolean(anchorEl);

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open
                PaperProps={{ className: classes.dialog }}
            >
                <DialogTitle>Variable Update</DialogTitle>
                <DialogContent>
                    <Grid container spacing={16} alignItems='flex-end'>
                        <Grid item xs={12}>
                            <Typography>
                                <Button
                                    aria-owns={showSelectedRecords ? 'selectedRecordsPopover' : null}
                                    aria-haspopup="true"
                                    variant='fab'
                                    mini
                                    onClick={(event) => {event.preventDefault(); this.handlePopoverOpen(event);}}
                                    className={classes.filteredItemsCount}
                                    disabled={ this.state.selectedItems.length === 0 }
                                >
                                    {itemNum}
                                </Button>
                                &nbsp;&nbsp;items are selected for update.&nbsp;&nbsp;&nbsp;&nbsp;
                                <Button
                                    color='default'
                                    variant='fab'
                                    mini
                                    onClick={ () => { this.setState({ showFilter: true }); } }
                                >
                                    <FilterListIcon />
                                </Button>
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.applyToVlm}
                                                onChange={() => {this.setState({ applyToVlm: !this.state.applyToVlm });}}
                                                color='primary'
                                            />
                                        }
                                        label='Apply Update to VLM'
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} className={classes.controlButtons}>
                            <Grid container spacing={16} justify='flex-start'>
                                <Grid item>
                                    <Button
                                        color='primary'
                                        size='small'
                                        onClick={this.apply}
                                        variant='raised'
                                        className={classes.button}
                                    >
                                        Update
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        color='secondary'
                                        size='small'
                                        onClick={this.cancel}
                                        variant='raised'
                                        className={classes.button}
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Popover
                        id='selectedRecordsPopover'
                        classes={{
                            paper: classes.paper,
                        }}
                        open={showSelectedRecords}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={this.handlePopoverClose}
                    >
                        <Typography>{this.getSelectedRecords()}</Typography>
                    </Popover>
                    { this.state.showFilter &&
                            <VariableTabFilter
                                filter={this.state.filter}
                                onUpdate={this.onFilterUpdate}
                                onClose={ () => { this.setState({ showFilter: false }); } }
                            />
                    }
                </DialogContent>
            </Dialog>
        );
    }
}

ConnectedVariableTabUpdate.propTypes = {
    classes         : PropTypes.object.isRequired,
    onClose         : PropTypes.func.isRequired,
    mdv             : PropTypes.object.isRequired,
    selectedItems   : PropTypes.array,
    itemGroupOid    : PropTypes.string.isRequired,
    defineVersion   : PropTypes.string.isRequired,
    updateVariables : PropTypes.func.isRequired,
};

const VariableTabUpdate = connect(mapStateToProps, mapDispatchToProps)(ConnectedVariableTabUpdate);
export default withStyles(styles)(VariableTabUpdate);

