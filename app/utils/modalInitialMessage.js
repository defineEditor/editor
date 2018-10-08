import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { shell } from 'electron';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import saveState from 'utils/saveState.js';
import {
    closeModal,
    updateMainUi,
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        top           : '40%',
        transform     : 'translate(0%, calc(-50%+0.5px))',
        overflowX     : 'auto',
        maxHeight     : '85%',
        overflowY     : 'auto',
    },
    checkbox: {
        position : 'relative',
        float    : 'right',
    },
});

const mapDispatchToProps = dispatch => {
    return {
        closeModal: () => dispatch(closeModal()),
        updateMainUi: (updateObj) => dispatch(updateMainUi(updateObj)),
    };
};

class ConnectedModalInitialMessage extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            doNotShowAgain: false,
        };
    }

    onClose = () => {
        this.props.closeModal();
        if (this.state.doNotShowAgain === true) {
            this.props.updateMainUi({ showInitialMessage: false });
            saveState();
        }
    }

    openLink = (event) => {
        event.preventDefault();
        shell.openExternal('http://defineeditor.com/downloads');
    }

    render () {
        const { classes } = this.props;

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                open
                PaperProps={{className: classes.dialog}}
            >
                <DialogTitle id="alert-dialog-title">
                    Visual Define-XML Editor
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This is a pre-release version of the application and it should not be used for production purposes.
                        <br/>
                        Check&nbsp;
                        <a onClick={this.openLink} href='http://defineeditor.com/downloads'>
                            defineeditor.com/downloads
                        </a>
                        &nbsp;for the latest available version.
                    </DialogContentText>
                </DialogContent>
                <FormGroup row className={classes.checkbox}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.doNotShowAgain}
                                onChange={() => { this.setState({doNotShowAgain: !this.state.doNotShowAgain});}}
                                color='primary'
                                value='doNotShowAgain'
                            />
                        }
                        label="Do not show again"
                    />
                </FormGroup>
                <br clear='all'/>
                <DialogActions>
                    <Button onClick={this.onClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalInitialMessage.propTypes = {
    classes: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
};

const ModalInitialMessage = connect(undefined, mapDispatchToProps)(ConnectedModalInitialMessage);
export default withStyles(styles)(ModalInitialMessage);