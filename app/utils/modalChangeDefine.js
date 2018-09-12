import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { ipcRenderer } from 'electron';
import {
    changePage,
    closeModal,
    appSave,
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
});

// Redux functions
const mapStateToProps = state => {
    return {
        odm: state.present.odm,
        tabs: state.present.ui.tabs,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changePage: updateObj => dispatch(changePage(updateObj)),
        appSave : (updateObj) => dispatch(appSave(updateObj)),
        closeModal: () => dispatch(closeModal()),
    };
};

class ConnectedModalChangeDefine extends React.Component {

    onSave = () => {
        ipcRenderer.send('writeDefineObject', {
            odm: this.props.odm,
            tabs: this.props.tabs,
            defineId: this.props.currentDefineId,
        });
        this.props.appSave({defineId: this.props.currentDefineId});
        this.props.changePage({ page: 'editor', defineId: this.props.defineId });
        this.props.closeModal();
    }

    onCancel = () => {
        this.props.closeModal();
    }

    onDiscard = () => {
        this.props.changePage({ page: 'editor', defineId: this.props.defineId });
        this.props.closeModal();
    }


    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.onSave();
        }
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
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle id="alert-dialog-title">
                    Change Define
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You have unsaved changed in your current Define-XML. Save them before opening a new Define-XML document?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onSave} color="primary">
                        Save
                    </Button>
                    <Button onClick={this.onDiscard} color="primary">
                       Discard
                    </Button>
                    <Button onClick={this.onCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalChangeDefine.propTypes = {
    classes: PropTypes.object.isRequired,
    defineId: PropTypes.string.isRequired,
    currentDefineId: PropTypes.string.isRequired,
    odm: PropTypes.object.isRequired,
    tabs: PropTypes.object.isRequired,
    appSave: PropTypes.func.isRequired,
    changePage: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
};

const ModalChangeDefine = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalChangeDefine);
export default withStyles(styles)(ModalChangeDefine);
