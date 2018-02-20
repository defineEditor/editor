import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import SaveCancel from 'editors/saveCancel.js';

const styles = theme => ({
    textField: {
        margin : 'none',
        width  : '40px',
    },
});

class KeyOrderEditor extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        // Get the total number of variables in the dataset
        let maxOrderNum = props.itemGroup.itemRefs.length;
        // Get the number of keys and add 1 if the current variable is not a key
        let maxKeySeq = props.itemGroup.itemRefs.filter((itemRef) => {
            return itemRef.keySequence !== undefined;
        }).length + (this.props.defaultValue.keySequence === undefined ? 1 : 0);
        this.state = {
            key         : props.defaultValue.keySequence !== undefined,
            keySequence : props.defaultValue.keySequence,
            orderNumber : props.defaultValue.orderNumber,
            maxKeySeq   : maxKeySeq,
            maxOrderNum : maxOrderNum,
        };
    }

    handleChange = name => event => {
        // Update only if the values are within the allowed range;
        if (name === 'keySequence') {
            if (event.target.value >= 1 && event.target.value <= this.state.maxKeySeq) {
                this.setState({[name]: event.target.value});
            }
        } else if (name === 'orderNumber') {
            if (event.target.value >= 1 && event.target.value <= this.state.maxOrderNum) {
                this.setState({[name]: event.target.value});
            }
        } else if (name === 'key') {
            if (event.target.checked === true) {
                this.setState({
                    [name]      : event.target.checked,
                    keySequence : this.state.maxKeySeq,
                });
            } else {
                this.setState({
                    [name]      : event.target.checked,
                    keySequence : undefined,
                });
            }
        }
    };

    save = () => {
        let result = {
            keySequence : this.state.keySequence,
            orderNumber : this.state.orderNumber,
        };
        this.props.onUpdate(result);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <TextField
                        label='Position'
                        type='number'
                        autoFocus
                        InputLabelProps={{shrink: true}}
                        value={this.state.orderNumber}
                        onChange={this.handleChange('orderNumber')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.key}
                                onChange={this.handleChange('key')}
                                value="Key"
                            />
                        }
                        label="Key"
                        className={classes.textField}
                    />
                </Grid>
                {this.state.key && 
                        <Grid item xs={12}>
                            <TextField
                                label='Key Sequence'
                                type='number'
                                value={this.state.keySequence}
                                InputLabelProps={{shrink: true}}
                                onChange={this.handleChange('keySequence')}
                                className={classes.textField}
                            />
                        </Grid>
                }
                <Grid item xs={12}>
                    <SaveCancel mini icon save={this.save} cancel={this.cancel}/>
                </Grid>
            </Grid>
        );
    }
}

KeyOrderEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    itemGroup    : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func.isRequired,
};

export default withStyles(styles)(KeyOrderEditor);
