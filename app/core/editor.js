import React from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import EditorTabs from 'tabs/editorTabs.js';
import parseStdCodeLists from 'parsers/parseStdCodeLists.js';
import { connect } from 'react-redux';
import {
    addOdm,
    addStdControlledTerminology,
    updateCodeListStandardOids,
    updateStandards
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
        addOdm: odm => dispatch(addOdm(odm)),
        addStdControlledTerminology: codeListsOdm => dispatch(addStdControlledTerminology(codeListsOdm)),
        updateCodeListStandardOids: updateObj => dispatch(updateCodeListStandardOids(updateObj)),
        updateStandards: updateObj => dispatch(updateStandards(updateObj))
    };
};

const mapStateToProps = state => {
    let currentDefineId = state.ui.main.currentDefineId;
    let loadedDefineId = state.odm !== undefined && state.odm.defineId;
    let odmLoaded = false;
    if (state.odm !== undefined && state.odm.odmVersion !== undefined && loadedDefineId === currentDefineId) {
        odmLoaded = true;
    }
    return {
        odmLoaded,
        loadedDefineId,
        currentDefineId,
        codeLists: odmLoaded ? state.odm.study.metaDataVersion.codeLists : undefined
    };
};

class ConnectedEditor extends React.Component {
    componentDidMount() {
        if (this.props.currentDefineId !== this.props.loadedDefineId && this.props.currentDefineId) {
            // If the currently loaded define is different, load the correct one
            ipcRenderer.send('loadDefineObject', this.props.currentDefineId);
        }
    }

    loadStdCodeLists = (error, data) => {
        let stdCodeListsOdm = parseStdCodeLists(data);

        // Check if any codelist with alias, but without a standard assigned matches the loaded standard
        let codeLists = this.props.codeLists;
        if (codeLists !== undefined) {
            let updateObj = {};
            Object.keys(codeLists).forEach(codeListOid => {
                if (
                    codeLists[codeListOid].alias !== undefined &&
                    codeLists[codeListOid].standardOid === undefined &&
                    codeLists[codeListOid].alias.context === 'nci:ExtCodeID'
                ) {
                    if (
                        Object.keys(
                            stdCodeListsOdm.study.metaDataVersion.nciCodeOids
                        ).includes(codeLists[codeListOid].alias.name)
                    ) {
                        let stdCodeListOid =
                            stdCodeListsOdm.study.metaDataVersion.nciCodeOids[codeLists[codeListOid].alias.name];
                        updateObj[codeListOid] = {
                            standardOid: stdCodeListsOdm.study.oid,
                            cdiscSubmissionValue:
                            stdCodeListsOdm.study.metaDataVersion.codeLists[stdCodeListOid].cdiscSubmissionValue
                        };
                    }
                }
            });
            // TODO: Move default standard population to standards tab and check if loaded standard impacts existing codelists
            Promise.resolve(
                this.props.addStdControlledTerminology(stdCodeListsOdm)
            ).then(this.props.updateCodeListStandardOids(updateObj));
        }
    };

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                {!this.props.currentDefineId && (
                    <div>No Define-XML documentes were chosen for editing. Select a Define-XML document to edit on the Studies tab.</div>
                )}
                {this.props.currentDefineId && !this.props.odmLoaded && (
                    <div className={classes.loading}>
                        Loading Define-XML
                        <br />
                        <CircularProgress className={classes.progress} />
                    </div>
                )}
                {this.props.odmLoaded && (
                    <EditorTabs />
                )}
            </React.Fragment>
        );
    }
}

ConnectedEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    odmLoaded: PropTypes.bool.isRequired,
    currentDefineId: PropTypes.string.isRequired,
    codeLists: PropTypes.object
};

const Editor = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditor);
export default withStyles(styles)(Editor);
