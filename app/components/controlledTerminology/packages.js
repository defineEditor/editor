/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, lighten, makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { openDB } from 'idb';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import CloudDownload from '@material-ui/icons/CloudDownload';
import Forward from '@material-ui/icons/Forward';
import Add from '@material-ui/icons/Add';
import Cached from '@material-ui/icons/Cached';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import withWidth from '@material-ui/core/withWidth';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import InternalHelp from 'components/utils/internalHelp.js';
import GeneralTable from 'components/utils/generalTable.js';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import getSelectionList from 'utils/getSelectionList.js';
import ControlledTerminologyBreadcrumbs from 'components/controlledTerminology/breadcrumbs.js';
import {
    updateControlledTerminology,
    addControlledTerminology,
    deleteControlledTerminology,
    openSnackbar,
    toggleCtCdiscLibrary,
    deleteStdCodeLists,
    changeCtView,
    changeCtSettings,
} from 'actions/index.js';
import { ControlledTerminology } from 'core/mainStructure.js';

const styles = theme => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        display: 'flex',
        width: '100%',
    },
    scanning: {
        marginTop: theme.spacing(10),
    },
    scanBox: {
        flex: '1 1 auto',
    },
    progress: {
        marginTop: theme.spacing(10),
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
    },
    noCTMessage: {
        position: 'absolute',
        marginLeft: theme.spacing(2),
        top: '47%',
        transform: 'translate(0%, -47%)',
    },
    actionIcon: {
        height: 28,
        width: 28,
    },
    inTextButton: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
});

const UpdatedLinearProgress = withStyles({
    root: {
        height: 40,
        backgroundColor: lighten('#3f51b5', 0.5),
        borderRadius: 30,
    },
    bar: {
        borderRadius: 30,
        backgroundColor: '#3f51b5',
    },
})(LinearProgress);

const mapStateToProps = state => {
    return {
        controlledTerminologyLocation: state.present.settings.general.controlledTerminologyLocation,
        controlledTerminology: state.present.controlledTerminology,
        enableCdiscLibrary: state.present.settings.cdiscLibrary.enableCdiscLibrary,
        useCdiscLibrary: state.present.ui.controlledTerminology.useCdiscLibrary,
        useCdiscLibraryForCt: state.present.ui.controlledTerminology.useCdiscLibraryForCt,
        ctUiSettings: state.present.ui.controlledTerminology.packages,
        currentView: state.present.ui.controlledTerminology.currentView,
        stdCodeLists: state.present.stdCodeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateControlledTerminology: updateObj => dispatch(updateControlledTerminology(updateObj)),
        addControlledTerminology: updateObj => dispatch(addControlledTerminology(updateObj)),
        deleteControlledTerminology: deleteObj => dispatch(deleteControlledTerminology(deleteObj)),
        openSnackbar: updateObj => dispatch(openSnackbar(updateObj)),
        toggleCtCdiscLibrary: updateObj => dispatch(toggleCtCdiscLibrary(updateObj)),
        deleteStdCodeLists: deleteObj => dispatch(deleteStdCodeLists(deleteObj)),
        changeCtView: updateObj => dispatch(changeCtView(updateObj)),
        changeCtSettings: updateObj => dispatch(changeCtSettings(updateObj)),
    };
};

const useToolbarStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
        color: theme.palette.text.primary,
        backgroundColor: lighten(theme.palette.primary.light, 0.85),
    },
    type: {
        width: 140,
        marginRight: theme.spacing(4),
    },
    deleteButton: {
        marginLeft: theme.spacing(3),
    },
    switch: {
        paddingTop: theme.spacing(1),
        marginRight: theme.spacing(4),
        marginLeft: theme.spacing(1),
    },
    toolbarFab: {
        marginRight: theme.spacing(1),
    },
    toolbarIcon: {
        height: 31,
        width: 31,
    },
}));

const ctTypes = ['All', 'SDTM', 'ADaM', 'SEND', 'CDASH', 'COA', 'QS-FT', 'Protocol', 'Def-XML', 'Glossary'];

class ConnectedPackages extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            externalCts: [],
            selected: [],
            reloadingCts: false,
            searchString: '',
            scanning: false,
            totalCount: 0,
            count: 0,
        };
    }

    static contextType = CdiscLibraryContext;

    componentDidMount () {
        ipcRenderer.on('controlledTerminologyData', this.loadPackage);
        ipcRenderer.on('scanCtFolderFinishedFile', this.updateCount);
        ipcRenderer.on('scanCtFolderStarted', this.initiateScanning);
        ipcRenderer.on('scanCtFolderError', this.showError);
        ipcRenderer.on('ctFolderError', this.showError);
        if (this.context) {
            this.getCtFromCdiscLibrary();
        }
    }

    componentWillUnmount () {
        ipcRenderer.removeListener('controlledTerminologyData', this.loadPackage);
        ipcRenderer.removeListener('scanCtFolderFinishedFile', this.updateCount);
        ipcRenderer.removeListener('scanCtFolderStarted', this.initiateScanning);
        ipcRenderer.removeListener('scanCtFolderError', this.showError);
        ipcRenderer.removeListener('ctFolderError', this.showError);
    }

    dummyRequest = async () => {
        // There is a glitch, which causes the response not to come back in some cases
        // It is currently fixed by sending a dummy request if the main response did not come back
        try {
            await this.context.cdiscLibrary.coreObject.apiRequest('/health', { noCache: true });
        } catch (error) {
            // It is expected to fail, so do nothing
        }
    }

    getCtFromCdiscLibrary = async () => {
        // As a temporary bugfix, send a dummy request if the object did not load
        setTimeout(() => {
            if (this.state.externalCts.length === 0) {
                this.dummyRequest();
            }
        }, 1000);

        // In case CDISC Library is not used, the data is obtained from NCI site
        if (!this.props.useCdiscLibraryForCt) {
            await this.context.cdiscLibrary.getCtFromNciSite();
        }
        let productClasses = await this.context.cdiscLibrary.getProductClasses();
        let cts = productClasses.terminology.productGroups.packages.products;

        let externalCts = Object.values(cts).map(ct => {
            let terminologyType = '';
            if (ct.label.toLowerCase().includes('glossary')) {
                terminologyType = 'Glossary';
            } else {
                terminologyType = ct.label.replace(/^\s*(\S+).*/, '$1');
            }
            if (terminologyType === 'PROTOCOL') {
                terminologyType = 'Protocol';
            } else if (terminologyType.toLowerCase() === 'define-xml' || terminologyType.toLowerCase() === 'def-xml') {
                terminologyType = 'Def-XML';
            } else if (terminologyType.toLowerCase() === 'glosarry') {
                terminologyType = 'Glossary';
            }
            return ({
                ...new ControlledTerminology({
                    id: ct.id,
                    type: terminologyType,
                    name: ct.label,
                    version: ct.version,
                }),
                notLoaded: true,
                loading: false,
                __styleClass: { backgroundColor: '#E0E0E0' },
                __disableSelection: true
            });
        });

        this.setState({ externalCts, reloadingCts: false });
    }

    updateCount = () => {
        this.setState({ count: this.state.count + 1 });
    }

    initiateScanning = (event, value) => {
        this.setState({ scanning: true, totalCount: value });
    }

    showError = (event, msg) => {
        this.props.openSnackbar({
            type: 'error',
            message: msg,
            props: { duration: 10000 },
        });
    }

    loadPackage = (event, data) => {
        let ctList = {};
        Object.keys(data).forEach(ctId => {
            let ct = data[ctId];
            ctList[ct.id] = { ...new ControlledTerminology({ ...ct }) };
        });
        this.props.addControlledTerminology({ ctList });
        if (this.state.scanning === true) {
            // Reset scan UI values
            this.setState({ scanning: false, totalCount: 0, count: 0 });
        }
    }

    scanControlledTerminologyFolder = () => {
        ipcRenderer.send('scanControlledTerminologyFolder', this.props.controlledTerminologyLocation);
    }

    addControlledTerminology = () => {
        ipcRenderer.send('addControlledTerminology');
    }

    toggleDefault = (ctId) => (event) => {
        event.stopPropagation();
        let currentCt = this.props.controlledTerminology.byId[ctId];
        let updatedCt = { ...currentCt, isDefault: !currentCt.isDefault };
        this.props.updateControlledTerminology({ ctList: { [ctId]: updatedCt } });
    }

    addByDefault = (props) => {
        return (
            <Switch
                checked={props.isDefault}
                onChange={this.toggleDefault(props.row.id)}
                onClick={(event) => { event.stopPropagation(); }}
                color='primary'
            />
        );
    }

    handleSearchUpdate = (event) => {
        this.setState({ searchString: event.target.value });
    }

    actions = (props) => {
        const { id, row } = props;
        if (row.notLoaded && !row.loading) {
            return (
                <Tooltip title='Download Controlled Terminology' placement='bottom' enterDelay={500}>
                    <Fab
                        onClick={(event) => { event.stopPropagation(); this.loadCtFromCdiscLibrary(id); }}
                        color='default'
                        size='medium'
                    >
                        <CloudDownload className={this.props.classes.actionIcon}/>
                    </Fab>
                </Tooltip>
            );
        } else if (row.loading === true) {
            return (
                <Fab
                    color='default'
                    size='medium'
                >
                    <CircularProgress size={35}/>
                </Fab>
            );
        } else {
            return (
                <Tooltip title='Open Controlled Terminology' placement='bottom' enterDelay={500}>
                    <Fab
                        onClick={this.openCt(id)}
                        color='default'
                        size='medium'
                    >
                        <Forward className={this.props.classes.actionIcon}/>
                    </Fab>
                </Tooltip>
            );
        }
    }

    handleTypeChange = event => {
        this.props.changeCtSettings({ view: 'packages', settings: { packageType: event.target.value } });
    };

    handleNCISiteCtVisibility = event => {
        this.props.changeCtSettings({ view: 'packages', settings: { showNCISiteCts: !this.props.ctUiSettings.showNCISiteCts } });
    };

    handleShowCdiscLibraryChange = (event, checked) => {
        this.props.toggleCtCdiscLibrary({ status: checked });
    };

    handleSelectChange = selected => {
        this.setState({ selected });
    };

    deletePackage = () => {
        // Exclude those CTs which are not loaded (coming from CDISC Library)
        let ctOids = [];
        let filesToDelete = [];
        this.state.selected.forEach(id => {
            if (this.props.controlledTerminology.allIds.includes(id)) {
                ctOids.push(id);
                filesToDelete.push(this.props.controlledTerminology.byId[id].pathToFile);
            }
        });
        ipcRenderer.send('deleteFiles', filesToDelete);
        this.props.deleteControlledTerminology({ ctOids });
        this.handleSelectChange([]);
    };

    loadCtFromCdiscLibrary = async (id) => {
        // As a temporary bugfix, send a dummy request if the object did not load
        const ctNum = this.state.externalCts.length;
        setTimeout(() => {
            if (this.state.externalCts.length === ctNum) {
                this.dummyRequest();
            }
        }, 2000);
        // Change CT to loading
        const newExternalCts = this.state.externalCts.map(ct => {
            if (ct.id === id) {
                return { ...ct, loading: true };
            } else {
                return ct;
            }
        });
        this.setState({ externalCts: newExternalCts });
        let ct = await this.context.cdiscLibrary.getFullProduct(id);
        // IPCRender requires serialized objects
        let ctSerialized = JSON.parse(JSON.stringify(ct));
        ipcRenderer.send('saveCtFromCdiscLibrary', ctSerialized);
        // As CT uses a lot of memory, manually delete it as it is not needed
        Object.values(this.context.cdiscLibrary.productClasses.terminology.productGroups.packages.products).forEach(product => {
            if (product.fullyLoaded) {
                product.fullyLoaded = false;
                product.codelists = undefined;
            }
        });
    };

    openCt = (id) => (event) => {
        event.stopPropagation();
        // Remove all CTs, which were previously loaded for review purposes
        let currentStdCodeListIds = Object.keys(this.props.stdCodeLists);
        let ctIdsToRemove = currentStdCodeListIds.filter(ctId => (ctId !== id && this.props.stdCodeLists[ctId].loadedForReview));
        if (ctIdsToRemove.length > 0) {
            this.props.deleteStdCodeLists({ ctIds: ctIdsToRemove });
        }
        // If was loaded for study purposes, do not mark it as loaded for review
        let loadedForReview;
        if (!(currentStdCodeListIds.includes(id) && this.props.stdCodeLists[id].loadedForReview !== true)) {
            loadedForReview = true;
        }

        ipcRenderer.send('loadControlledTerminology', { [id]: { ...this.props.controlledTerminology.byId[id], loadedForReview } });
        this.props.changeCtView({ view: 'codeLists', packageId: id });
    };

    setRowsPerPage = (rowsPerPage) => {
        this.props.changeCtSettings({ view: 'packages', settings: { rowsPerPage } });
    }

    reloadCtList = async () => {
        if (this.context) {
            // Remove cached objects
            this.setState({ externalCts: {}, reloadingCts: true });
            const db = await openDB('cdiscLibrary-store', 1, {
                upgrade (db) {
                    // Create a store of objects
                    db.createObjectStore('cdiscLibrary', {});
                },
            });

            if (this.props.useCdiscLibraryForCt) {
                // Remove products in case CT is loaded from CDISC Library
                await db.delete('cdiscLibrary', 'products');
            } else {
                // Remove all cached endpoints for NCI site
                let allKeys = await db.getAllKeys('cdiscLibrary');
                for (let i = 0; i < allKeys.length; i++) {
                    let key = allKeys[i];
                    if (key.startsWith('nci/')) {
                        await db.delete('cdiscLibrary', key);
                    }
                }
            }

            // Reset the library contents
            this.context.cdiscLibrary.reset();

            this.getCtFromCdiscLibrary();
        }
    }

    additionalActions = (classes) => {
        let result = [];
        result.push(
            <Tooltip title='Add Controlled Terminology' placement='bottom' enterDelay={500}>
                <Fab
                    onClick={this.addControlledTerminology}
                    color='default'
                    size='medium'
                    className={classes.toolbarFab}
                >
                    <Add className={classes.toolbarIcon}/>
                </Fab>
            </Tooltip>
        );
        result.push(
            <Tooltip title='Scan Controlled Terminology Folder' placement='bottom' enterDelay={500}>
                <Fab
                    onClick={this.scanControlledTerminologyFolder}
                    disabled={this.props.controlledTerminologyLocation === ''}
                    color='default'
                    size='medium'
                    className={classes.toolbarFab}
                >
                    <CreateNewFolderIcon className={classes.toolbarIcon}/>
                </Fab>
            </Tooltip>
        );
        result.push(
            <Tooltip title='Reload CT list' placement='bottom' enterDelay={500}>
                <Fab
                    onClick={this.reloadCtList}
                    color='default'
                    size='medium'
                    className={classes.toolbarFab}
                >
                    {this.state.reloadingCts ? (
                        <CircularProgress size={35}/>
                    ) : (
                        <Cached className={classes.toolbarIcon}/>
                    )}
                </Fab>
            </Tooltip>
        );
        result.push(
            <Tooltip title='Toggle NCI site CT visibility' placement='bottom' enterDelay={500}>
                <Fab
                    onClick={this.handleNCISiteCtVisibility}
                    color='default'
                    size='medium'
                    className={classes.toolbarFab}
                >
                    { this.props.ctUiSettings.showNCISiteCts ? (
                        <VisibilityOff className={classes.toolbarIcon}/>
                    ) : (
                        <Visibility className={classes.toolbarIcon}/>
                    )}
                </Fab>
            </Tooltip>
        );
        result.push(
            <InternalHelp
                helpId='CT_LOCATION'
                size='medium'
                buttonClass={classes.toolbarFab}
            />
        );
        if (this.props.enableCdiscLibrary) {
            result.push(
                <FormControlLabel
                    control={
                        <Switch
                            checked={this.props.useCdiscLibrary}
                            onChange={this.handleShowCdiscLibraryChange}
                            color='primary'
                            size='medium'
                        />
                    }
                    label='CDISC Library'
                    className={classes.switch}
                />
            );
        }
        result.push(
            <TextField
                select
                value={this.props.ctUiSettings.packageType}
                onChange={this.handleTypeChange}
                className={classes.type}
            >
                {getSelectionList(ctTypes)}
            </TextField>
        );
        return result;
    }

    CtToolbar = props => {
        const classes = useToolbarStyles();
        let numSelected = this.state.selected.filter(id => this.props.controlledTerminology.allIds.includes(id)).length;

        return (
            <Toolbar className={numSelected > 0 ? classes.highlight : classes.root}>
                { numSelected > 0 ? (
                    <Typography variant='subtitle1'>
                        {numSelected} selected
                        <Button
                            size='medium'
                            variant='contained'
                            color='secondary'
                            onClick={this.deletePackage}
                            className={classes.deleteButton}
                        >
                            Delete
                        </Button>
                    </Typography>
                ) : (
                    <ControlledTerminologyBreadcrumbs
                        searchString={this.state.searchString}
                        onSearchUpdate={this.handleSearchUpdate}
                        additionalActions={this.additionalActions(classes)}
                    />
                )}
            </Toolbar>
        );
    };

    render () {
        const { classes } = this.props;

        let header = [
            { id: 'id', label: 'id', hidden: true, key: true },
            { id: 'name', label: 'Name' },
            { id: 'type', label: 'Type' },
            { id: 'version', label: 'Version', defaultOrder: 'desc' },
            { id: 'codeListCount', label: '# Codelists' },
            { id: 'isDefault', label: 'Add by Default', formatter: this.addByDefault, noSort: true },
            { id: 'id', label: '', formatter: this.actions, noSort: true },
        ];

        let data = Object.values(this.props.controlledTerminology.byId);
        if (this.state.externalCts.length > 0 && this.props.ctUiSettings.showNCISiteCts) {
            // Remove CDISC CTs which are already loaded
            let loadedIds = data.filter(ct => (ct.isCdiscNci)).map(ct => (ct.type + ct.version));
            data = data.concat(this.state.externalCts.filter(ct => (!loadedIds.includes(ct.type + ct.version))));
        }

        let packageType = this.props.ctUiSettings.packageType;
        if (packageType && packageType !== 'All') {
            data = data.filter(row => (row.type === packageType));
        }

        const searchString = this.state.searchString;

        if (searchString !== '') {
            const caseSensitiveSearch = /[A-Z]/.test(searchString);
            data = data.filter(row => (Object.keys(row)
                .filter(item => (!['id', 'isDefault'].includes(item)))
                .some(item => {
                    if (caseSensitiveSearch) {
                        return typeof row[item] === 'string' && row[item].includes(searchString);
                    } else {
                        return typeof row[item] === 'string' && row[item].toLowerCase().includes(searchString);
                    }
                })
            ));
        }

        return (
            <React.Fragment>
                <div className={classes.root}>
                    { this.state.scanning === false && (
                        <GeneralTable
                            data={data}
                            header={header}
                            sorting
                            pagination={{ rowsPerPage: this.props.ctUiSettings.rowsPerPage, setRowsPerPage: this.setRowsPerPage }}
                            customToolbar={this.CtToolbar}
                            selection = {{ selected: this.state.selected, setSelected: this.handleSelectChange }}
                        />
                    )}
                    { this.state.scanning === true && (
                        <Box textAlign='center' className={classes.scanBox}>
                            <Typography variant='h4' color='textSecondary' className={classes.scanning}>
                                Scanning Controlled Terminology
                            </Typography>
                            <Typography variant='h6' color='textSecondary'>
                                Finished {this.state.count} of {this.state.totalCount} files
                            </Typography>
                            <UpdatedLinearProgress
                                variant='determinate'
                                value={this.state.totalCount > 0 ? this.state.count / this.state.totalCount * 100 : 0}
                                className={classes.progress}
                            />
                        </Box>
                    )}
                </div>
            </React.Fragment>
        );
    }
}

ConnectedPackages.propTypes = {
    classes: PropTypes.object.isRequired,
    updateControlledTerminology: PropTypes.func.isRequired,
    addControlledTerminology: PropTypes.func.isRequired,
    deleteControlledTerminology: PropTypes.func.isRequired,
    openSnackbar: PropTypes.func.isRequired,
    deleteStdCodeLists: PropTypes.func.isRequired,
    controlledTerminology: PropTypes.object.isRequired,
    ctUiSettings: PropTypes.object,
    enableCdiscLibrary: PropTypes.bool.isRequired,
    useCdiscLibrary: PropTypes.bool.isRequired,
    useCdiscLibraryForCt: PropTypes.bool.isRequired,
    stdCodeLists: PropTypes.object.isRequired,
};

const Packages = connect(mapStateToProps, mapDispatchToProps)(ConnectedPackages);
export default withWidth()(withStyles(styles)(Packages));
