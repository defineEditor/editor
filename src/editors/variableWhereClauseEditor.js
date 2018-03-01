import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Switch from 'material-ui/Switch';
import { FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import EditIcon from 'material-ui-icons/Edit';
import Dialog, {DialogContent, DialogTitle} from 'material-ui/Dialog';
import WhereClauseInteractiveEditor from 'editors/whereClauseInteractiveEditor.js';
import Button from 'material-ui/Button';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 4,
        paddingRight  : theme.spacing.unit * 4,
        paddingTop    : theme.spacing.unit * 1,
        paddingBottom : theme.spacing.unit * 3,
        position      : 'absolute',
        borderRadius  : '10px',
        border        : '2px solid',
        borderColor   : 'primary',
        top           : '20%',
        left          : '20%',
        transform     : 'translate(-20%, -20%)',
        overflowX     : 'auto',
        maxHeight     : '90%',
        maxWidth      : '90%',
        overflowY     : 'auto',
    },
    formControl: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    },
    editButton: {
        marginLeft: theme.spacing.unit,
    },
    whereClause: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    },
    switch: {
    },
});

class VariableWhereClauseEditor extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            dialogOpened: false,
        };

    }

    handleOpen = () => {
        this.setState({ dialogOpened: true });
    }

    handleCancelAndClose = (updateObj) => {
        this.setState({dialogOpened: false});
    }

    handleSaveAndClose = () => {
        this.props.handleChange('whereClauseInteractive')(updateObj);
        this.setState({dialogOpened: false});
    }

    render() {
        const {classes} = this.props;
        const interactiveMode = this.props.wcEditingMode === 'interactive';
        const manualWCIsInvalid = !this.props.validationCheck('manual');

        return (
            <Grid container spacing={0} alignItems='flex-end'>
                <Grid item>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={interactiveMode}
                                onChange={this.props.handleChange('wcEditingMode')}
                                className={classes.switch}
                                color='primary'
                            />
                        }
                        label={interactiveMode ? 'Interactive Mode' : 'Manual Mode'}
                        className={classes.formControl}
                    />
                </Grid>
                { !interactiveMode &&
                        <Grid item xs={12}>
                            <TextField
                                label='Where Clause'
                                multiline
                                fullWidth
                                value={this.props.whereClauseManual}
                                onChange={this.props.handleChange('whereClauseManual')}
                                onBlur={this.props.handleChange('whereClause')}
                                error={manualWCIsInvalid}
                                className={classes.textField}
                            />
                        </Grid>
                }
                {interactiveMode &&
                        <Grid item xs={12} className={classes.whereClause}>
                            {this.props.whereClauseManual}
                            <Button
                                variant="fab"
                                mini
                                color="default"
                                onClick={this.handleOpen}
                                className={classes.editButton}
                            >
                                <EditIcon/>
                            </Button>
                            <Dialog
                                disableBackdropClick
                                disableEscapeKeyDown
                                open={this.state.dialogOpened}
                                onClose={this.handleClose}
                                PaperProps={{className: classes.dialog}}
                            >
                                <DialogTitle>Where Clause</DialogTitle>
                                <DialogContent>
                                    <WhereClauseInteractiveEditor
                                        whereClauseInteractive={this.props.whereClauseInteractive}
                                        mdv={this.props.mdv}
                                        onSave={this.handleSaveAndClose}
                                        onCancel={this.handleCancelAndClose}
                                    />
                                </DialogContent>
                            </Dialog>
                        </Grid>
                }
            </Grid>
        );
    }
}

VariableWhereClauseEditor.propTypes = {
    classes                : PropTypes.object.isRequired,
    handleChange           : PropTypes.func.isRequired,
    onNameBlur             : PropTypes.func.isRequired,
    validationCheck        : PropTypes.func.isRequired,
    whereClause            : PropTypes.object,
    whereClauseManual      : PropTypes.string,
    whereClauseInteractive : PropTypes.array,
    whereClauseComment     : PropTypes.object,
    mdv                    : PropTypes.object,
    wcEditingMode          : PropTypes.string.isRequired,
};

export default withStyles(styles)(VariableWhereClauseEditor);

