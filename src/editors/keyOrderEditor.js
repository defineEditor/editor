import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import SaveCancel from 'editors/saveCancel.js';

const styles = theme => ({
    textField: {
        margin : 'none',
        width  : '40px',
    },
    container: {
        minWidth: '110px',
    },
});

class KeyOrderEditor extends React.Component {
    constructor (props) {
        super(props);
        const itemGroup = props.defaultValue.itemGroup;
        // Get the total number of variables in the dataset
        const maxOrderNum = itemGroup.itemRefOrder.length;
        // Get the number of keys and add 1 if the current variable is not a key
        const key = props.defaultValue.keySequence !== undefined;
        const maxKeySeq = itemGroup.keyOrder.length + (key ? 0 : 1);
        this.state = {
            key         : key,
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

    onKeyDown = (event)  => {
        if (this.props.stateless !== true) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                this.cancel();
            } else if (event.ctrlKey && (event.keyCode === 83)) {
                this.save();
            }
        }
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid
                container
                spacing={0}
                className={classes.container}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
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
                                value='Key'
                                color='primary'
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
    onUpdate     : PropTypes.func.isRequired,
};

export default withStyles(styles)(KeyOrderEditor);
