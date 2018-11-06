import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { addResultDisplay } from 'actions/index.js';

const styles = theme => ({
    inputField: {
        width: '200px',
    },
    addButton: {
        marginLeft: theme.spacing.unit * 2,
        marginTop: theme.spacing.unit * 2,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addResultDisplay: (updateObj) => dispatch(addResultDisplay(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        defineVersion : state.present.odm.study.metaDataVersion.defineVersion,
        resultDisplays : state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplays,
    };
};

class AddVariableSimpleConnected extends React.Component {
    constructor (props) {
        super(props);
        const maxOrderNum = Object.keys(this.props.resultDisplays).length + 1;
        this.state = {
            name         : '',
            orderNumber  : this.props.position || maxOrderNum,
            maxOrderNum  : maxOrderNum,
        };

    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let maxOrderNum = Object.keys(nextProps.resultDisplays).length + 1;
        if ( maxOrderNum !== prevState.maxOrderNum) {
            return ({
                orderNumber : nextProps.position || maxOrderNum,
                maxOrderNum : maxOrderNum,
            });
        } else {
            return null;
        }
    }

    resetState = () => {
        this.setState({
            name         : '',
            orderNumber  : this.props.position || this.state.maxOrderNum,
        });
    }

    handleChange = (name) => (event) => {
        if (name === 'name') {
            this.setState({ [name]: event.target.value });
        } else if (name === 'orderNumber') {
            if (event.target.value >= 1 && event.target.value <= this.state.maxOrderNum) {
                this.setState({[name]: event.target.value});
            }
        }
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.handleClose();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.handleSaveAndClose();
        }
    }

    handleSaveAndClose = (updateObj) => {
        this.props.addResultDisplay({ name: this.state.name, orderNumber: this.state.orderNumber });
        this.resetState();
        this.props.onClose();
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid container spacing={8} alignItems='flex-end' onKeyDown={this.onKeyDown} tabIndex='0'>
                <Grid item xs={12}>
                    <TextField
                        label='Name'
                        autoFocus
                        value={this.state.name}
                        onChange={this.handleChange('name')}
                        className={classes.inputField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label='Position'
                        type='number'
                        InputLabelProps={{shrink: true}}
                        value={this.state.orderNumber}
                        onChange={this.handleChange('orderNumber')}
                        className={classes.inputField}
                    />
                </Grid>
                <Grid item>
                    <Button
                        onClick={this.handleSaveAndClose}
                        color="default"
                        mini
                        variant="raised"
                        className={classes.addButton}
                    >
                        Add result display
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

AddVariableSimpleConnected.propTypes = {
    classes        : PropTypes.object.isRequired,
    resultDisplays : PropTypes.object.isRequired,
    defineVersion  : PropTypes.string.isRequired,
    position       : PropTypes.number,
    onClose        : PropTypes.func.isRequired,
};

const AddVariableSimple = connect(mapStateToProps, mapDispatchToProps)(AddVariableSimpleConnected);
export default withStyles(styles)(AddVariableSimple);

