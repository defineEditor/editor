import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import getSelectionList from 'utils/getSelectionList.js';
import SaveCancel from 'editors/saveCancel.js';
import clone from 'clone';


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
        width: '90%',
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


const comparators = ['EQ','NE','LT','LE','GT','GE','IN','NOTIN','STARTS','ENDS','CONTAINS'];
const comparatorsLimited = ['EQ','NE','LT','LE','GT','GE','STARTS','ENDS','CONTAINS'];
const filterFields = {
    'name' : 'Name',
    'dataType' : 'Data Type',
};


class VariableTabFilter extends React.Component {
    constructor (props) {
        super(props);
        let rangeChecks = [];
        if (this.props.filter !== undefined) {
            rangeChecks = clone(this.props.tab.filter);
        }
        let connectors = [];
        // Get possible values for all of the fields
        let values = {};
        Object.keys(filterFields).forEach( field => {
            let allValues = props.data.map(row => row[field]);
            values[field] = [];
            allValues.forEach( value => {
                if (!values[field].includes[value]) {
                    values[field].push(value);
                }
            });
        });

        this.state = {
            rangeChecks,
            connectors,
            values,
        };
    }

    handleChange = (name, index, connector) => (updateObj) => {
        let result = { ...this.state.rangeChecks };
        result[index] = { ...this.state.rangeChecks[index] };
        if (name === 'field') {
            // Do nothing if name did not change
            if (result[index].field === updateObj.target.event) {
                return;
            }
            result[index].field = updateObj.target.value;
            // Reset all other values
            result[index].comparator = 'EQ';
            result[index].checkValues = [''];
            this.setState({
                rangeChecks      : result,
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
                // Fix an issue when a blank values appreas when keyboard is used
                // TODO: Investigate issue, see https://trello.com/c/GVhBqI4W/65
                result[index].checkValues = updateObj.target.value.filter(value => value !== '');
            } else {
                result[index].checkValues = [updateObj.target.value];
            }
            this.setState({
                rangeChecks: result,
            });
        } else if (name === 'addRangeCheck') {
            let newIndex = result.length;
            let connectors = this.state.connectors.slice();
            connectors.push(connector);
            result[newIndex] = {};
            // Reset all other values
            result[newIndex].field = '';
            result[newIndex].comparator = 'EQ';
            result[newIndex].checkValues = [''];
            this.setState({
                rangeChecks: result,
                connectors,
            });
        } else if (name === 'deleteRangeCheck') {
            let connectors = this.state.connectors.slice();
            result.splice(index,1);
            if (index !== 0) {
                connectors.splice(index-1,1);
            }
            this.setState({
                rangeChecks: result,
                connectors,
            });
        }
    }

    save = () => {
        this.props.onClose();
    }

    cancel = () => {
        this.props.onClose();
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
                        onClick={this.handleChange('addRangeCheck',0,'AND')}
                        className={classes.button}
                    >
                       AND
                    </Button>
                    <Button
                        color='default'
                        size='small'
                        variant='raised'
                        onClick={this.handleChange('addRangeCheck',0,'OR')}
                        className={classes.button}
                    >
                       OR
                    </Button>
                </Grid>
            </Grid>
        )];
        this.state.rangeChecks.forEach( (rangeCheck, index) => {
            const hasCodeList = this.state.values[rangeCheck.field] !== undefined;
            const multipleValuesSelect = (['IN','NOTIN'].indexOf(rangeCheck.comparator) >= 0);
            const valueSelect = hasCodeList && ['EQ','NE','IN','NOTIN'].indexOf(rangeCheck.comparator) >= 0;
            const value = multipleValuesSelect && valueSelect ? rangeCheck.checkValues : rangeCheck.checkValues[0];

            result.push(
                <Grid container spacing={8} key={index} alignItems='flex-end'>
                    {index !== 0 &&
                            <Grid item xs={12} className={classes.connector}>
                                <Typography variant="subheading" >
                                    {this.state.connectors[index]}
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
                            label='Field'
                            fullWidth
                            autoFocus
                            select={true}
                            value={rangeCheck.field}
                            onChange={this.handleChange('field', index)}
                            className={classes.textField}
                        >
                            {getSelectionList(filterFields)}
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
                                {getSelectionList(this.state.values[rangeCheck.field])}
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
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open={this.props.open}
                PaperProps={{ className: classes.dialog }}
            >
                <DialogTitle>Filter</DialogTitle>
                <DialogContent>
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
                </DialogContent>
            </Dialog>
        );
    }
}

VariableTabFilter.propTypes = {
    classes  : PropTypes.object.isRequired,
    onClose  : PropTypes.func.isRequired,
    open     : PropTypes.bool.isRequired,
    data     : PropTypes.object.isRequired,
};

export default withStyles(styles)(VariableTabFilter);

