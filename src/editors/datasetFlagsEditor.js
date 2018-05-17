import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
//import IconButton from 'material-ui/IconButton';
import Checkbox from 'material-ui/Checkbox';
import { FormGroup, FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import SaveCancel from 'editors/saveCancel.js';

const styles = theme => ({
    formControl: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    },
});

class DatasetFlagsEditor extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            repeating       : this.props.defaultValue.repeating === 'Yes',
            isReferenceData : this.props.defaultValue.isReferenceData === 'Yes',
        };
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.checked });
    }

    save = () => {
        let result = {
            repeating       : this.state.repeating ? 'Yes' : 'No',
            isReferenceData : this.state.isReferenceData ? 'Yes' : 'No',
        };
        this.props.onUpdate(result);
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
        return (
            <Grid container spacing={0} onKeyDown={this.onKeyDown} tabIndex='0'>
                <Grid item xs={12}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.repeating}
                                    color='primary'
                                    onChange={this.handleChange('repeating')}
                                    value="Repeating"
                                />
                            }
                            label="Repeating"
                            className={classes.formControl}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.isReferenceData}
                                    color='primary'
                                    onChange={this.handleChange('isReferenceData')}
                                    value="isReferenceData"
                                />
                            }
                            label="Reference Data"
                            className={classes.formControl}
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <SaveCancel mini icon save={this.save} cancel={this.cancel}/>
                </Grid>
            </Grid>
        );
    }
}

DatasetFlagsEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func.isRequired,
};

export default withStyles(styles)(DatasetFlagsEditor);

