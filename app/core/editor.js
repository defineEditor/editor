import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import EditorTabs from 'tabs/editorTabs.js';
import DataInput from 'components/utils/dataInput.js';
import CommentMethodTable from 'components/utils/commentMethodTable.js';
import {
    changePage,
    updateMainUi,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit * 3,
        backgroundColor: theme.palette.background.paper
    },
    progress: {
        margin: theme.spacing.unit * 2
    },
    noDefineMessage: {
        position: 'absolute',
        marginLeft: theme.spacing.unit * 2,
        top: '47%',
        transform: 'translate(0%, -47%)',
    },
    loading: {
        position: 'absolute',
        top: '47%',
        left: '47%',
        transform: 'translate(-47%, -47%)',
        textAlign: 'center'
    }
});

const mapDispatchToProps = dispatch => {
    return {
        changePage : (updateObj) => dispatch(changePage(updateObj)),
        updateMainUi : (updateObj) => dispatch(updateMainUi(updateObj)),
    };
};

const mapStateToProps = state => {
    let currentDefineId = state.present.ui.main.currentDefineId;
    let loadedDefineId = state.present.odm !== undefined && state.present.odm.defineId;
    let odmLoaded = false;
    if (state.present.odm !== undefined && state.present.odm.odmVersion !== undefined && loadedDefineId === currentDefineId) {
        odmLoaded = true;
    }
    return {
        odmLoaded,
        loadedDefineId,
        currentDefineId,
        codeLists: odmLoaded ? state.present.odm.study.metaDataVersion.codeLists : undefined,
        showDataInput: state.present.ui.main.showDataInput,
        showCommentMethodTable: state.present.ui.main.showCommentMethodTable,
    };
};

class ConnectedEditor extends React.Component {
    componentDidMount() {
        if (this.props.currentDefineId !== this.props.loadedDefineId && this.props.currentDefineId) {
            // If the currently loaded define is different, load the correct one
            ipcRenderer.send('loadDefineObject', this.props.currentDefineId, 'initialLoad');
        }
    }

    changePageToStudies = () => {
        this.props.changePage({ page: 'studies' });
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                {!this.props.currentDefineId && (
                    <Typography variant="display1" gutterBottom className={classes.noDefineMessage}>
                        No Define-XML documents are selected for editing. Select a Define-XML document to edit on the &nbsp;
                        <Button onClick={this.changePageToStudies} variant='raised'>
                            Studies
                        </Button> &nbsp; page.
                    </Typography>
                )}
                {this.props.currentDefineId && !this.props.odmLoaded && (
                    <div className={classes.loading}>
                        Loading Define-XML.
                        <Typography variant="caption" gutterBottom>
                            Taking too long? Use Ctrl+M to open the menu.
                        </Typography>
                        <br />
                        <CircularProgress className={classes.progress} />
                    </div>
                )}
                {this.props.odmLoaded && (
                    <EditorTabs />
                )}
                {this.props.showDataInput && this.props.odmLoaded && (
                    <DataInput />
                )}
                { this.props.showCommentMethodTable &&
                        <CommentMethodTable
                            type='Comment'
                            onClose={() => {this.props.updateMainUi({showCommentMethodTable: false});}}
                            listOnly={true}
                        />
                }
            </React.Fragment>
        );
    }
}

ConnectedEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    odmLoaded: PropTypes.bool.isRequired,
    currentDefineId: PropTypes.string.isRequired,
    changePage: PropTypes.func.isRequired,
    codeLists: PropTypes.object,
    showDataInput: PropTypes.bool
};

const Editor = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditor);
export default withStyles(styles)(Editor);
