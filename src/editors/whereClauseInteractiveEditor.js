import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import RemoveIcon from 'material-ui-icons/RemoveCircleOutline';
import getSelectionList from 'utils/getSelectionList.js';
import Chip from 'material-ui/Chip';

const styles = theme => ({
    textField: {
        whiteSpace: 'normal',
    },
    textFieldValues: {
        whiteSpace : 'normal',
        maxWidth   : '30%',
    },
    button: {
        marginLeft: theme.spacing.unit,
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


class WhereClauseEditorInteractive extends React.Component {
    constructor (props) {
        super(props);
        let whereClauseInteractive = this.props.whereClauseInteractive;
        // Get the list of datasets for drop-down selection
        let listOfDatasets = [];
        Object.keys(this.props.mdv.itemGroups).forEach( itemGroupOid => {
            listOfDatasets.push(this.props.mdv.itemGroups[itemGroupOid].name);
        });
        // Get the list of varialbes for each dataset in range checks for drop-down selection
        let listOfVariables = {};
        whereClauseInteractive.forEach( rangeCheck => {
            let currentItemGroupOid = rangeCheck.itemGroupOid;
            listOfVariables[currentItemGroupOid] = [];
            Object.keys(this.props.mdv.itemGroups[currentItemGroupOid].itemRefs).forEach( itemRefOid => {
                listOfVariables[currentItemGroupOid].push(this.props.mdv.itemGroups[currentItemGroupOid].itemRefs[itemRefOid].itemDef.name);
            });
        });
        // Get codelist for all of the variables in range checks
        let listOfCodeValues = {};
        whereClauseInteractive.forEach( rangeCheck => {
            let currentItemOid = rangeCheck.itemOid;
            listOfCodeValues[currentItemOid] = [];
            let currentCodeList = this.props.mdv.itemDefs[currentItemOid].codeList;
            if (currentCodeList.getCodeListType() === 'decoded') {
                currentCodeList.codeListItems.forEach( item => {
                    listOfCodeValues[currentItemOid].push({[item.codedValue]: item.codedValue + ' (' + item.getDecode() + ')'});
                });
            } else {
                currentCodeList.enumeratedItems.forEach( item => {
                    listOfCodeValues[currentItemOid].push({[item.codedValue]: item.codedValue});
                });
            }
        });

        this.state = {
            whereClauseInteractive : whereClauseInteractive,
            listOfDatasets         : listOfDatasets,
            listOfVariables        : listOfVariables,
            listOfCodeValues       : listOfCodeValues,
        };
    }

    handleChange = (name, index) => (updateObj) => {

    }

    getRangeChecks = () => {
        let result = [];
        const {classes} = this.props;

        this.state.whereClauseInteractive.forEach( (rangeCheck, index) => {
            result.push(
                <Grid container spacing={16} key={index} >
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
                            value={rangeCheck.itemGroupName}
                            onChange={this.handleChange('itemGroup')}
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
                            value={rangeCheck.itemName}
                            onChange={this.handleChange('item')}
                            className={classes.textField}
                        >
                            {getSelectionList(this.state.listOfVariables[rangeCheck.itemGroupOid])}
                        </TextField>
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Comparator'
                            fullWidth
                            select={true}
                            value={rangeCheck.comparator||'EQ'}
                            onChange={this.handleChange('comparator')}
                            className={classes.textField}
                        >
                            {getSelectionList(comparators)}
                        </TextField>
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Values'
                            select
                            value={rangeCheck.checkValues}
                            SelectProps={{
                                multiple    : true,
                                renderValue : selected => (
                                    <div className={classes.chips}>
                                        {selected.map(value => <Chip key={value} label={value} className={classes.chip} />)}
                                    </div>
                                ),
                            }}
                            onChange={this.handleChange('checkValues')}
                            className={classes.textFieldValues}
                        >
                            {getSelectionList(this.state.listOfCodeValues[rangeCheck.itemOid])}
                        </TextField>
                    </Grid>
                </Grid>
            );

        });
        return result;
    }

    render() {
        return (
            <Grid container spacing={16} alignItems='flex-end'>
                {this.getRangeChecks()}
            </Grid>
        );
    }
}

WhereClauseEditorInteractive.propTypes = {
    classes                : PropTypes.object.isRequired,
    onSave                 : PropTypes.func.isRequired,
    onCancel               : PropTypes.func.isRequired,
    whereClauseInteractive : PropTypes.array.isRequired,
    mdv                    : PropTypes.object.isRequired,
};

export default withStyles(styles)(WhereClauseEditorInteractive);

