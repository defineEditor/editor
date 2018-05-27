import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import SaveCancel from 'editors/saveCancel.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';

const styles = theme => ({
    textField: {
        width  : '40px',
        height : '20px',
    },
    gridItemADaM: {
        flexBasis : 'unset',
        textAlign : 'center',
        height    : '20px',
    },
    checkbox: {
        margin: 'none',
    },
    root: {
        outline: 'none',
    },
});

class roleMandatoryEditor extends React.Component {
    constructor (props) {
        super(props);
        this.rootRef = React.createRef();
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
        if (this.props.model === 'ADaM') {
            if (name === 'mandatoryFlag') {
                this.setState({[name]: event.target.checked}, this.save);
            }
        } else {
            if (name === 'mandatoryFlag') {
                this.setState({[name]: event.target.checked});
            }
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

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.keyCode === 13) {
            this.save();
        } else if (event.keyCode === 32) {
            if (this.props.model === 'ADaM') {
                event.preventDefault();
                this.setState({mandatoryFlag: !this.state.mandatoryFlag});
            }
        }
    }

    componentDidMount() {
        this.rootRef.current.focus();
    }

    render () {
        const { classes } = this.props;

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                ref={this.rootRef}
                className={classes.root}
            >
                <Grid
                    container
                    spacing={0}
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
                                    onChange={this.handleChange('mandatoryFlag')}
                                    value='Mandatory'
                                    color='primary'
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
            </div>
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
