import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import SaveCancel from 'editors/saveCancel.js';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    formControl: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    },
    textField: {
    },
    switch: {
    },
});

class VariableLengthEditor extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            length           : this.props.defaultValue.length,
            fractionDigits   : this.props.defaultValue.fractionDigits,
            lengthAsData     : this.props.defaultValue.lengthAsData ? true : false,
            lengthAsCodeList : this.props.defaultValue.lengthAsCodeList ? true : false,
        };
    }

    handleChange = name => event => {
        if (name === 'lengthAsData') {
            this.setState({ [name]: event.target.checked });
            if (this.state.lengthAsCodeList === true) {
                this.setState({lengthAsCodeList: false});
            }
        } else if (name === 'lengthAsCodeList') {
            this.setState({ [name]: event.target.checked });
            if (this.state.lengthAsData === true) {
                this.setState({lengthAsData: false});
            }
        } else {
            this.setState({ [name]: event.target.value });
        }
    }

    save = () => {
        this.props.onUpdate(this.state);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render() {
        const {classes} = this.props;
        const lengthAsData = this.state.lengthAsData;
        const lengthAsCodeList = this.state.lengthAsCodeList;
        const hasCodeList = this.props.row.codeList !== undefined;
        const dataType = this.props.row.dataType;
        const lengthNotApplicable = (['float','text','integer'].indexOf(dataType) === -1);

        let length;
        if (lengthAsData) {
            length = 'No Data';
        } else if (lengthAsCodeList && hasCodeList) {
            length = this.props.row.codeList.getMaxLength();
        } else if (lengthNotApplicable) {
            length = 'Not Applicable';
        } else {
            length = this.state.length || '';
        }
        const fractionDigits = this.state.fractionDigits || '';
        return (
            <Grid container spacing={0} onKeyDown={this.onKeyDown} tabIndex='0'>
                <Grid item xs={12}>
                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Switch
                                    color='primary'
                                    checked={this.state.lengthAsData}
                                    onChange={this.handleChange('lengthAsData')}
                                    className={classes.switch}
                                    disabled={lengthNotApplicable}
                                />
                            }
                            label="Actual Length"
                            className={classes.formControl}
                        />
                        { hasCodeList &&
                                <FormControlLabel
                                    control={
                                        <Switch
                                            color='primary'
                                            checked={this.state.lengthAsCodeList}
                                            onChange={this.handleChange('lengthAsCodeList')}
                                            className={classes.switch}
                                        />
                                    }
                                    label="Codelist Length"
                                    className={classes.formControl}
                                    disabled={lengthNotApplicable}
                                />
                        }
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label='Length'
                        autoFocus
                        value={length}
                        onChange={this.handleChange('length')}
                        className={classes.textField}
                        disabled={lengthAsData || lengthAsCodeList || lengthNotApplicable}
                    />
                </Grid>
                { dataType === 'float' &&
                        <Grid item xs={12}>
                            <TextField
                                label='Fraction Digits'
                                value={fractionDigits}
                                onChange={this.handleChange('fractionDigits')}
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

VariableLengthEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func.isRequired,
};

export default withStyles(styles)(VariableLengthEditor);

