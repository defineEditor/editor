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
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import withWidth from '@material-ui/core/withWidth';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import GeneralTable from 'components/utils/generalTable.js';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import getSelectionList from 'utils/getSelectionList.js';
import ControlledTerminologyBreadcrumbs from 'components/controlledTerminology/breadcrumbs.js';
import {
    updateControlledTerminology,
    addControlledTerminology,
    deleteControlledTerminology,
    openSnackbar,
    toggleCtCdiscLibrary
} from 'actions/index.js';
import { ControlledTerminology } from 'core/mainStructure.js';

const styles = theme => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    scanning: {
        marginTop: theme.spacing(10),
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
    loadButton: {
        backgroundColor: '#FFFFFF',
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
        currentView: state.present.ui.controlledTerminology.currentView,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateControlledTerminology: updateObj => dispatch(updateControlledTerminology(updateObj)),
        addControlledTerminology: updateObj => dispatch(addControlledTerminology(updateObj)),
        deleteControlledTerminology: deleteObj => dispatch(deleteControlledTerminology(deleteObj)),
        openSnackbar: updateObj => dispatch(openSnackbar(updateObj)),
        toggleCtCdiscLibrary: updateObj => dispatch(toggleCtCdiscLibrary(updateObj)),
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
    title: {
        flex: '1 1 100%',
    },
    type: {
        width: 140,
        marginRight: theme.spacing(3),
        marginLeft: theme.spacing(1),
    },
    deleteButton: {
        marginLeft: theme.spacing(3),
    },
    switch: {
        paddingTop: theme.spacing(2),
        width: 280,
    },
}));

const ctTypes = ['All', 'SDTM', 'ADaM', 'SEND', 'CDASH', 'COA', 'QS-FT', 'Protocol'];

class ConnectedPackage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            cdiscLibraryCts: [],
            currentType: 'All',
            selected: [],
            showCdiscLibrary: false,
            searchString: '',
            scanning: false,
            totalCount: 0,
            count: 0,
        };
    }

    static contextType = CdiscLibraryContext;

    componentDidMount () {
        ipcRenderer.on('controlledTerminologyFolderData', this.loadPackage);
        ipcRenderer.on('scanCtFolderFinishedFile', this.updateCount);
        ipcRenderer.on('scanCtFolderStarted', this.initiateScanning);
        ipcRenderer.on('scanCtFolderError', this.showError);
        ipcRenderer.on('ctFolderError', this.showError);
        if (this.props.enableCdiscLibrary && this.context) {
            this.getCtFromCdiscLibrary();
        }
    }

    componentWillUnmount () {
        ipcRenderer.removeListener('controlledTerminologyFolderData', this.loadPackage);
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
            if (this.state.cdiscLibraryCts.length === 0) {
                this.dummyRequest();
            }
        }, 1000);
        let productClasses = await this.context.cdiscLibrary.getProductClasses();
        let cts = productClasses.terminology.productGroups.packages.products;

        let cdiscLibraryCts = Object.values(cts).map(ct => {
            let terminologyType = ct.label.replace(/^\s*(\S+).*/, '$1');
            if (terminologyType === 'PROTOCOL') {
                terminologyType = 'Protocol';
            }
            return ({
                ...new ControlledTerminology({
                    id: ct.id,
                    type: terminologyType,
                    name: ct.label,
                    version: ct.version,
                }),
                notLoaded: true,
                styleClass: { backgroundColor: '#F7F7F7', opacity: '0.5' }
            });
        });

        this.setState({ cdiscLibraryCts });
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

    toggleDefault = (ctId) => () => {
        let currentCt = this.props.controlledTerminology.byId[ctId];
        let updatedCt = { ...currentCt, isDefault: !currentCt.isDefault };
        this.props.updateControlledTerminology({ ctList: { [ctId]: updatedCt } });
    }

    addByDefault = (value, row) => {
        return (
            <Switch
                checked={value}
                onChange={this.toggleDefault(row.id)}
                color='primary'
            />
        );
    }

    actions = (id, row) => {
        if (row.notLoaded === true) {
            return (
                <Button
                    variant='contained'
                    color='default'
                    onClick={this.loadCtFromCdiscLibrary(id)}
                    className={this.props.classes.loadButton}
                >
                    Load
                </Button>
            );
        } else {
            return (
                <Button
                    variant='contained'
                    color='default'
                    onClick={this.openCt(id)}
                >
                    Open
                </Button>
            );
        }
    }

    handleTypeChange = event => {
        this.setState({ currentType: event.target.value });
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

    loadCtFromCdiscLibrary = (id) => async () => {
        // As a temporary bugfix, send a dummy request if the object did not load
        const ctNum = this.state.cdiscLibraryCts.length;
        setTimeout(() => {
            if (this.state.cdiscLibraryCts.length === ctNum) {
                this.dummyRequest();
            }
        }, 2000);
        let ct = await this.context.cdiscLibrary.getFullProduct(id);
        ipcRenderer.send('saveCtFromCdiscLibrary', ct);
        // As CT uses a lot of memory, manually delete it as it is not needed
        Object.values(this.context.cdiscLibrary.productClasses.terminology.productGroups.packages.products).forEach(product => {
            if (product.fullyLoaded) {
                product.fullyLoaded = false;
                product.codelists = undefined;
                console.log('Deleted' + product.id);
            }
        });
    };

    openCt = (id) => () => {
        //
    };

    CtToolbar = props => {
        const classes = useToolbarStyles();
        let title = 'Controlled Terminology';
        let numSelected = this.state.selected.length;

        return (
            <Toolbar className={numSelected > 0 ? classes.highlight : classes.root}>
                { numSelected > 0 ? (
                    <Typography className={classes.title} variant='subtitle1'>
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
                    <Typography className={classes.title} variant='h6' id='tableTitle'>
                        {title}
                    </Typography>
                )}
                { numSelected === 0 && (
                    <React.Fragment>
                        { this.props.enableCdiscLibrary && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={this.props.useCdiscLibrary}
                                        onChange={this.handleShowCdiscLibraryChange}
                                        color='primary'
                                    />
                                }
                                label='CDISC Library'
                                className={classes.switch}
                            />
                        )}
                        <TextField
                            label='Type'
                            select
                            value={this.state.currentType}
                            onChange={this.handleTypeChange}
                            className={classes.type}
                        >
                            {getSelectionList(ctTypes)}
                        </TextField>
                    </React.Fragment>
                )}
            </Toolbar>
        );
    };

    render () {
        const { classes } = this.props;
        let ctNum = this.props.controlledTerminology.allIds.length;

        let header = [
            { id: 'id', label: 'id', hidden: true, key: true },
            { id: 'name', label: 'Name' },
            { id: 'type', label: 'Type' },
            { id: 'version', label: 'Version', defaultOrder: true },
            { id: 'codeListCount', label: '# Codelists' },
            { id: 'isDefault', label: 'Add by Default', formatter: this.addByDefault, noSort: true },
            { id: 'id', label: 'Action', formatter: this.actions, noSort: true },
        ];

        let data = Object.values(this.props.controlledTerminology.byId);
        if (this.state.cdiscLibraryCts.length > 0 && this.props.useCdiscLibrary) {
            // Remove CDISC CTs which are already loaded
            let loadedIds = data.filter(ct => (ct.isCdiscNci)).map(ct => (ct.type + ct.version));
            data = data.concat(this.state.cdiscLibraryCts.filter(ct => (!loadedIds.includes(ct.type + ct.version))));
        }

        if (this.state.currentType !== 'All') {
            data = data.filter(row => (row.type === this.state.currentType));
        }

        return (
            <React.Fragment>
                <ControlledTerminologyBreadcrumbs scanControlledTerminologyFolder={this.scanControlledTerminologyFolder} />
                <div className={classes.root}>
                    { this.state.scanning === false && ctNum === 0 && this.props.useCdiscLibrary === false && (
                        <Typography variant='h4' gutterBottom className={classes.noCTMessage} color='textSecondary'>
                            There is no Controlled Terminology available.
                            Download the NCI/CDISC CT in XML format, specify the folder in settings and press the &nbsp;
                            <Button
                                size='small'
                                variant='contained'
                                disabled={this.props.controlledTerminologyLocation === ''}
                                onClick={this.scanControlledTerminologyFolder}>
                                Scan CT Folder
                            </Button> &nbsp; button
                            { this.props.enableCdiscLibrary && this.props.useCdiscLibrary === false && (
                                <React.Fragment>
                                    <span>&nbsp; or&nbsp; </span>
                                    <Button
                                        size='small'
                                        variant='contained'
                                        onClick={() => { this.handleShowCdiscLibraryChange({}, true); }}>
                                        Enable
                                    </Button> &nbsp; CDISC Library
                                </React.Fragment>
                            )}
                        </Typography>
                    )}
                    { this.state.scanning === false && (ctNum !== 0 || this.props.useCdiscLibrary) && (
                        <GeneralTable
                            data={data}
                            header={header}
                            sorting
                            pagination
                            customToolbar={this.CtToolbar}
                            initialPagesPerRow={25}
                            selection = {{ selected: this.state.selected, setSelected: this.handleSelectChange }}
                        />
                    )}
                    { this.state.scanning === true && (
                        <Box textAlign='center'>
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

ConnectedPackage.propTypes = {
    classes: PropTypes.object.isRequired,
    updateControlledTerminology: PropTypes.func.isRequired,
    addControlledTerminology: PropTypes.func.isRequired,
    deleteControlledTerminology: PropTypes.func.isRequired,
    openSnackbar: PropTypes.func.isRequired,
    controlledTerminology: PropTypes.object.isRequired,
    enableCdiscLibrary: PropTypes.bool.isRequired,
    useCdiscLibrary: PropTypes.bool.isRequired,
};

const PackagePage = connect(mapStateToProps, mapDispatchToProps)(ConnectedPackage);
export default withWidth()(withStyles(styles)(PackagePage));
