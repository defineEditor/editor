import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import RemoveIcon from 'material-ui-icons/RemoveCircleOutline';
import getSelectionList from 'utils/getSelectionList.js';
import SaveCancel from 'editors/saveCancel.js';
import clone from 'clone';


const styles = theme => ({
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
    andLine: {
        marginLeft : theme.spacing.unit * 8,
        marginTop  : theme.spacing.unit * 2,
    },
    button: {
        marginLeft: theme.spacing.unit,
    },
    saveCancelButtons: {
        marginTop: theme.spacing.unit * 4,
    },
    chips: {
        display  : 'flex',
        flexWrap : 'wrap',
    },
    chip: {
        margin: theme.spacing.unit / 4,
    },
});


const comparators = ['EQ','NE','LT','LE','GT','GE','IN','NOTIN'];
const comparatorsLimited = ['EQ','NE','LT','LE','GT','GE'];


class WhereClauseEditorInteractive extends React.Component {
    constructor (props) {
        super(props);
        // Split into parts for visual editing
        let rangeChecks = [];
        this.props.whereClause.rangeChecks.forEach( rawRangeCheck => {
            let rangeCheck = clone(rawRangeCheck);
            rangeCheck.itemName = this.props.mdv.itemDefs[rawRangeCheck.itemOid].name;
            if (rawRangeCheck.itemGroupOid !== undefined) {
                rangeCheck.itemGroupName = this.props.mdv.itemGroups[rawRangeCheck.itemGroupOid].name;
            } else {
                rangeCheck.itemGroupName = this.props.dataset.name;
                rangeCheck.itemGroupOid = this.props.dataset.oid;
            }
            rangeChecks.push(rangeCheck);
        });
        // Get the list of datasets for drop-down selection
        let listOfDatasets = [];
        Object.keys(this.props.mdv.itemGroups).forEach( itemGroupOid => {
            listOfDatasets.push(this.props.mdv.itemGroups[itemGroupOid].name);
        });
        // Get the list of varialbes for each dataset in range checks for drop-down selection
        let listOfVariables = {};
        rangeChecks.forEach( rangeCheck => {
            let currentItemGroupOid = rangeCheck.itemGroupOid;
            listOfVariables[currentItemGroupOid] = [];
            Object.keys(this.props.mdv.itemGroups[currentItemGroupOid].itemRefs).forEach( itemRefOid => {
                listOfVariables[currentItemGroupOid].push(this.props.mdv.itemGroups[currentItemGroupOid].itemRefs[itemRefOid].itemDef.name);
            });
        });
        // Get codelist for all of the variables in range checks
        let listOfCodeValues = {};
        rangeChecks.forEach( rangeCheck => {
            let currentItemOid = rangeCheck.itemOid;
            let currentCodeList = this.props.mdv.itemDefs[currentItemOid].codeList;
            if (currentCodeList !== undefined) {
                listOfCodeValues[currentItemOid] = [];
                if (currentCodeList.getCodeListType() === 'decoded') {
                    currentCodeList.codeListItems.forEach( item => {
                        listOfCodeValues[currentItemOid].push({[item.codedValue]: item.codedValue + ' (' + item.getDecode() + ')'});
                    });
                } else {
                    currentCodeList.enumeratedItems.forEach( item => {
                        listOfCodeValues[currentItemOid].push({[item.codedValue]: item.codedValue});
                    });
                }
            }
        });

        this.state = {
            rangeChecks      : rangeChecks,
            listOfDatasets   : listOfDatasets,
            listOfVariables  : listOfVariables,
            listOfCodeValues : listOfCodeValues,
        };
    }

    updateListOfVariables = (itemGroupOid) => {
        let result = Object.assign({},this.state.listOfVariables);
        // Update the list only if the dataset is not yet present
        if (Object.keys(result).indexOf(itemGroupOid) < 0) {
            result[itemGroupOid] = [];
            Object.keys(this.props.mdv.itemGroups[itemGroupOid].itemRefs).forEach( itemRefOid => {
                result[itemGroupOid].push(this.props.mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemDef.name);
            });
        }
        return result;
    }

    updateListOfCodeValues = (itemOid) => {
        let result = Object.assign({},this.state.listOfCodeValues);
        // Update the list only if the codes are not yet present
        if (Object.keys(result).indexOf(itemOid) < 0) {
            let currentCodeList = this.props.mdv.itemDefs[itemOid].codeList;
            if (currentCodeList !== undefined) {
                result[itemOid] = [];
                if (currentCodeList.getCodeListType() === 'decoded') {
                    currentCodeList.codeListItems.forEach( item => {
                        result[itemOid].push({[item.codedValue]: item.codedValue + ' (' + item.getDecode() + ')'});
                    });
                } else {
                    currentCodeList.enumeratedItems.forEach( item => {
                        result[itemOid].push({[item.codedValue]: item.codedValue});
                    });
                }
            }
        }
        return result;
    }

    handleChange = (name, index) => (updateObj) => {
        // Copy the whole object (checkValues array are not properly copied, but this is not important);
        let result = this.state.rangeChecks.map( rangeCheck => {
            return Object.assign({},rangeCheck);
        });
        if (name === 'itemGroup') {
            // Do nothing if name did not change
            if (result[index].itemGroupName === updateObj.target.value) {
                return;
            }
            result[index].itemGroupName = updateObj.target.value;
            result[index].itemGroupOid = this.props.mdv.getOidByName('itemGroups',updateObj.target.value);
            // Reset all other values
            let updatedListOfVariables = this.updateListOfVariables(result[index].itemGroupOid);
            result[index].itemName = updatedListOfVariables[result[index].itemGroupOid][0];
            result[index].itemOid = this.props.mdv.getOidByName('itemDefs',result[index].itemName);
            result[index].comparator = 'EQ';
            result[index].checkValues = [''];
            this.setState({
                rangeChecks     : result,
                listOfVariables : updatedListOfVariables,
            });
        } else if (name === 'item') {
            // Do nothing if name did not change
            if (result[index].itemName === updateObj.target.event) {
                return;
            }
            result[index].itemName = updateObj.target.value;
            result[index].itemOid = this.props.mdv.getOidByName('itemDefs',updateObj.target.value);
            // Reset all other values
            result[index].comparator = 'EQ';
            result[index].checkValues = [''];
            this.setState({
                rangeChecks      : result,
                listOfCodeValues : this.updateListOfCodeValues(result[index].itemOid)
            });
        } else if (name === 'comparator') {
            if (result[index].comparator === updateObj.target.event) {
                return;
            }
            result[index].comparator = updateObj.target.value;
            // Reset check values if there are multiple values selected and changing from IN/NOT to a comparator with a single value
            if (['NOTIN','IN'].indexOf(this.state.rangeChecks[index].comparator) >= 0
                &&
                ['NOTIN','IN'].indexOf(result[index].comparator) < 0
                &&
                result[index].checkValues.length > 1
            ) {
                result[index].checkValues = [''];
            }
            this.setState({
                rangeChecks: result,
            });
        } else if (name === 'checkValues') {
            if (typeof updateObj.target.value === 'object') {
                result[index].checkValues = updateObj.target.value;
            } else {
                result[index].checkValues = [updateObj.target.value];
            }
            this.setState({
                rangeChecks: result,
            });
        } else if (name === 'addRangeCheck') {
            let newIndex = result.length;
            result[newIndex] = {};
            result[newIndex].itemGroupName = this.props.dataset.name;
            result[newIndex].itemGroupOid = this.props.mdv.getOidByName('itemGroups',result[newIndex].itemGroupName);
            // Reset all other values
            let updatedListOfVariables = this.updateListOfVariables(result[newIndex].itemGroupOid);
            result[newIndex].itemName = updatedListOfVariables[result[newIndex].itemGroupOid][0];
            result[newIndex].itemOid = this.props.mdv.getOidByName('itemDefs',result[newIndex].itemName);
            result[newIndex].comparator = 'EQ';
            result[newIndex].checkValues = [''];
            this.setState({
                rangeChecks     : result,
                listOfVariables : updatedListOfVariables,
            });
        } else if (name === 'deleteRangeCheck') {
            result.splice(index,1);
            this.setState({
                rangeChecks: result,
            });
        }
    }

    save = () => {
        this.props.onSave(this.state.rangeChecks);
    }

    cancel = () => {
        this.props.onCancel();
    }

    getRangeChecks = () => {
        const {classes} = this.props;

        let result = [(
            <Grid container spacing={8} key='buttonLine' alignItems='flex-end'>
                <Grid item xs={12} className={classes.buttonLine}>
                    <Button
                        color='default'
                        size='small'
                        variant='raised'
                        onClick={this.handleChange('addRangeCheck',0)}
                        className={classes.button}
                    >
                        Add condition
                    </Button>
                </Grid>
            </Grid>
        )];
        this.state.rangeChecks.forEach( (rangeCheck, index) => {
            const hasCodeList = this.state.listOfCodeValues[rangeCheck.itemOid] !== undefined;
            const multipleValuesSelect = (['IN','NOTIN'].indexOf(rangeCheck.comparator) >= 0);
            const valueSelect = hasCodeList && ['EQ','NE','IN','NOTIN'].indexOf(rangeCheck.comparator) >= 0;
            const value = multipleValuesSelect && valueSelect ? rangeCheck.checkValues : rangeCheck.checkValues[0];

            result.push(
                <Grid container spacing={8} key={index} alignItems='flex-end'>
                    {index !== 0 &&
                            <Grid item xs={12} className={classes.andLine}>
                                <Typography variant="subheading" >
                                    AND
                                </Typography>
                            </Grid>
                    }
                    <Grid item>
                        <IconButton
                            color='secondary'
                            onClick={this.handleChange('deleteRangeCheck',index)}
                            className={classes.button}
                        >
                            <RemoveIcon />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Dataset'
                            fullWidth
                            select={true}
                            value={rangeCheck.itemGroupName||this.state.listOfDatasets[0]}
                            onChange={this.handleChange('itemGroup', index)}
                            className={classes.textField}
                        >
                            {getSelectionList(this.state.listOfDatasets)}
                        </TextField>
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Variable'
                            fullWidth
                            autoFocus
                            select={true}
                            value={rangeCheck.itemName||this.state.listOfVariables[rangeCheck.itemGroupOid][0]}
                            onChange={this.handleChange('item', index)}
                            className={classes.textField}
                        >
                            {getSelectionList(this.state.listOfVariables[rangeCheck.itemGroupOid],true)}
                        </TextField>
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Comparator'
                            fullWidth
                            select={true}
                            value={rangeCheck.comparator}
                            onChange={this.handleChange('comparator', index)}
                            className={classes.textFieldComparator}
                        >
                            {getSelectionList(hasCodeList ? comparators : comparatorsLimited)}
                        </TextField>
                    </Grid>
                    { valueSelect ? (
                        <Grid item className={classes.valuesGridItem}>
                            <TextField
                                label='Values'
                                select
                                fullWidth
                                multiline
                                value={value}
                                SelectProps={{multiple: multipleValuesSelect}}
                                onChange={this.handleChange('checkValues', index)}
                                className={classes.textFieldValues}
                            >
                                {getSelectionList(this.state.listOfCodeValues[rangeCheck.itemOid])}
                            </TextField>
                        </Grid>
                    ) : (
                        <Grid item>
                            <TextField
                                label='Values'
                                fullWidth
                                multiline
                                defaultValue={value}
                                onBlur={this.handleChange('checkValues', index)}
                                className={classes.textFieldValues}
                            />
                        </Grid>
                    )
                    }
                </Grid>
            );

        });
        return result;
    }

    render() {
        const {classes} = this.props;

        return (
            <Grid container spacing={16} alignItems='flex-end'>
                {this.getRangeChecks()}
                <Grid item xs={12} className={classes.saveCancelButtons}>
                    <Grid container spacing={16} justify='flex-start'>
                        <Grid item>
                            <SaveCancel save={this.save} cancel={this.cancel}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

WhereClauseEditorInteractive.propTypes = {
    classes     : PropTypes.object.isRequired,
    onSave      : PropTypes.func.isRequired,
    onCancel    : PropTypes.func.isRequired,
    whereClause : PropTypes.object.isRequired,
    mdv         : PropTypes.object.isRequired,
    dataset     : PropTypes.object.isRequired,
};

export default withStyles(styles)(WhereClauseEditorInteractive);

