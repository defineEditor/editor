import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import SaveCancel from 'editors/saveCancel.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';

const styles = theme => ({
    textField: {
        margin : 'none',
        width  : '40px',
    },
    gridItemADaM: {
        textAlign: 'center',
    },
    checkbox: {
        margin: 'none',
    },
});

class roleMandatoryEditor extends React.Component {
    constructor (props) {
        super(props);
        if (props.model === 'SDTM' || props.model === 'SEND') {
            this.state = {
                role          : this.props.defaultValue.role,
                roleCodeList  : this.props.defaultValue.roleCodeList,
                mandatoryFlag : this.props.defaultValue.mandatory === 'Yes' ? true : false,
            };
        } else {
            this.state = {
                mandatoryFlag: this.props.defaultValue.mandatory === 'Yes' ? true : false,
            };
        }
    }

    handleChange = name => event => {
        if (name === 'mandatory') {
            this.setState({[name]: event.target.checked});
        }
        if (this.props.model === 'ADaM') {
            this.save();
        }
    };

    save = () => {
        let result = {};
        if (this.props.model === 'SDTM' || this.props.model === 'SEND') {
            result.role = this.state.role;
            result.roleCodeList = this.state.roleCodeList;
            result.mandatory = this.state.mandatoryFlag ? 'Yes' : 'No';
        } else {
            result.mandatory = this.state.mandatoryFlag ? 'Yes' : 'No';
        }
        this.props.onUpdate(result);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid
                container
                spacing={0}
                onKeyDown={ this.props.onKeyDown }
            >
                <Grid
                    item
                    xs={12}
                    className={this.props.model === 'ADaM' ? classes.gridItemADaM : false}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.mandatoryFlag}
                                onChange={this.handleChange('mandatory')}
                                value="Mandatory"
                                className={classes.checkbox}
                            />
                        }
                        label={this.props.model === 'ADaM' ? false : "Mandatory"}
                        className={classes.textField}
                    />
                </Grid>
                {(this.props.model === 'SDTM' || this.props.model === 'SEND') &&
                        <React.Fragment>
                            <Grid item xs={12}>
                                <SimpleSelectEditor/>
                            </Grid>
                            <Grid item xs={12}>
                                <SaveCancel mini icon save={this.save} cancel={this.cancel}/>
                            </Grid>
                        </React.Fragment>
                }
            </Grid>
        );
    }
}

roleMandatoryEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    model        : PropTypes.string.isRequired,
    onUpdate     : PropTypes.func.isRequired,
};

export default withStyles(styles)(roleMandatoryEditor);
