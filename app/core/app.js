/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { openDB } from 'idb';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import ModalRoot from 'components/modal/modalRoot.js';
import SnackbarRoot from 'components/utils/snackbarRoot.js';
import MainMenu from 'core/mainMenu.js';
import KeyboardShortcuts from 'components/utils/keyboardShortcuts.js';
import Editor from 'core/editor.js';
import ControlledTerminology from 'core/controlledTerminology.js';
import CdiscLibraryMain from 'core/cdiscLibraryMain.js';
import Settings from 'core/settings.js';
import Studies from 'core/studies.js';
import About from 'core/about.js';
import RedoUndo from 'components/utils/redoUndo.js';
import saveState from 'utils/saveState.js';
import sendDefineObject from 'utils/sendDefineObject.js';
import changeAppTitle from 'utils/changeAppTitle.js';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import { initCdiscLibrary, dummyRequest } from 'utils/cdiscLibraryUtils.js';
import { getUpdatedDefineBeforeSave } from 'utils/getUpdatedDefineBeforeSave.js';
import quitApplication from 'utils/quitApplication.js';
import {
    openModal,
    openSnackbar,
    updateMainUi,
    changePage,
    saveCdiscLibraryInfo,
    changeCdiscLibraryView,
    updateSearchInfo,
} from 'actions/index.js';

const baseThemeObj = {
    palette: {
        primary: {
            light: '#757ce8',
            main: '#3f50b5',
            dark: '#002884',
            contrastText: '#fff'
        },
        secondary: {
            light: '#ff7961',
            main: '#f44336',
            dark: '#ba000d',
            contrastText: '#000'
        }
    },
    props: {
        MuiInput: {
            inputProps: { spellCheck: 'false' }
        }
    },
    overrides: {
        MuiTableRow: {
            root: { '&$selected, &$selected:hover': { backgroundColor: '#eaebfb', } }
        },
    }
};

const disabledAnimationThemeObj = {
    ...baseThemeObj,
    transitions: {
        // So we have `transition: none;` everywhere
        create: () => 'none',
    },
    props: {
        ...baseThemeObj.props,
        MuiButtonBase: {
            // The properties to apply
            disableRipple: true, // No more ripple, on the whole application 💣!
        },
    }
};

const baseTheme = createMuiTheme(baseThemeObj);
const disabledAnimationTheme = createMuiTheme(disabledAnimationThemeObj);
const type = process.argv.filter(arg => arg.startsWith('--vdeType')).map(arg => arg.replace(/.*:\s*(.*)/, '$1').replace(/_/g, ' '))[0];

// Redux functions
const mapStateToProps = state => {
    // On the variables tab of the editor Ctrl-F focused on a search bar
    let disableFindToggle = false;
    let currentPage = state.present.ui.main.currentPage;
    const tabs = state.present.ui.tabs;
    if (currentPage === 'editor' && tabs.tabNames && tabs.tabNames[tabs.currentTab] !== undefined) {
        disableFindToggle = ['Variables', 'Codelists', 'Coded Values', 'Review Comments'].includes(tabs.tabNames[tabs.currentTab]);
    } else if (currentPage === 'cdiscLibrary' || currentPage === 'controlledTerminology') {
        disableFindToggle = true;
    }
    let bugModalOpened = state.present.ui && state.present.ui.modal && state.present.ui.modal.type.includes('BUG_REPORT');
    return {
        currentPage,
        showInitialMessage: state.present.settings.popUp.onStartUp,
        disableAnimations: state.present.settings.general.disableAnimations,
        checkForUpdates: state.present.settings.general.checkForUpdates,
        backup: state.present.settings.backup,
        lastBackupDate: state.present.ui.main.lastBackupDate,
        cdiscLibrarySettings: state.present.settings.cdiscLibrary,
        disableFindToggle,
        sampleStudyCopied: state.present.ui.main.sampleStudyCopied,
        currentDefineId: state.present.ui.main.currentDefineId,
        currentStudyId: state.present.ui.main.currentStudyId,
        cdiscLibraryInfo: state.present.ui.cdiscLibrary.info,
        windowType: state.present.ui.main.windowType,
        odm: state.present.odm,
        bugModalOpened,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        openModal: updateObj => dispatch(openModal(updateObj)),
        openSnackbar: (updateObj) => dispatch(openSnackbar(updateObj)),
        updateMainUi: (updateObj) => dispatch(updateMainUi(updateObj)),
        changePage: (updateObj) => dispatch(changePage(updateObj)),
        saveCdiscLibraryInfo: (updateObj) => dispatch(saveCdiscLibraryInfo(updateObj)),
        changeCdiscLibraryView: (updateObj, mountPoint) => dispatch(changeCdiscLibraryView(updateObj, mountPoint)),
        updateSearchInfo: (updateObj) => dispatch(updateSearchInfo(updateObj)),
    };
};

class ConnectedApp extends Component {
    constructor (props) {
        super(props);
        this.state = {
            showRedoUndo: false,
            showShortcuts: false,
            cdiscLibraryKit: { cdiscLibrary: initCdiscLibrary(), updateCdiscLibrary: this.updateCdiscLibrary },
        };
    }

    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
        // Window type
        if (type === 'reviewWindow') {
            this.props.updateMainUi({
                currentDefineId: '',
                currentStudyId: '',
                reviewMode: true,
                windowType: type,
            });
            this.props.changePage({
                page: 'studies',
            });
            ipcRenderer.once('reviewWindowData', (event, data) => {
                if (data.selectedItem !== undefined) {
                    this.props.updateSearchInfo({
                        matchedStudies: {},
                        selectedItem: data.selectedItem
                    });
                }
                changeAppTitle({ studyId: data.studyId, defineId: data.defineId });
                this.props.changePage({
                    page: 'editor',
                    defineId: data.defineId,
                    studyId: data.studyId,
                    origin: 'reviewInNewWindow',
                });
            });
            ipcRenderer.send('reviewWindowGetData');
        } else {
            // Comparing to other event listeners which are defined in index.js, this one needs to be here, so that CDISC Library object can be used
            ipcRenderer.on('quit', this.handleQuitApplication);
            ipcRenderer.once('updateInformationStartup', this.handleUpdateInformation);
            if (this.props.checkForUpdates) {
                ipcRenderer.send('checkForUpdates', 'updateInformationStartup');
            }
            if (this.props.showInitialMessage) {
                this.props.openModal({
                    type: 'INITIAL_MESSAGE',
                    props: {}
                });
            }
            if (!this.props.sampleStudyCopied) {
                ipcRenderer.once('sampleStudyCopied', (event) => {
                    this.props.updateMainUi({ sampleStudyCopied: true });
                });
                ipcRenderer.send('copySampleStudy');
            }
            if (this.props.cdiscLibrarySettings) {
                const { enableCdiscLibrary, checkForCLUpdates } = this.props.cdiscLibrarySettings;
                if (enableCdiscLibrary === true && checkForCLUpdates === true) {
                    this.checkCdiscLibraryForUpdates();
                }
            }
            // Set title of the application
            if (this.props.currentStudyId && this.props.currentDefineId) {
                changeAppTitle({ studyId: this.props.currentStudyId, defineId: this.props.currentDefineId });
            }
            if (this.props.backup.enableBackup) {
                // Perform backup if needed
                let lastBackupDate = new Date(this.props.lastBackupDate ? this.props.lastBackupDate : '2000-01-01');
                let compareDate = new Date(lastBackupDate.toISOString());
                compareDate = new Date(compareDate.setDate(lastBackupDate.getDate() + this.props.backup.backupInterval));
                // Perform backup once per time interval
                if ((new Date() > compareDate)) {
                    ipcRenderer.send('autoBackup', this.props.backup);
                }
            }
        }
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
        ipcRenderer.remove('updateInformationStartup', this.handleUpdateInformation);
        ipcRenderer.remove('quit', this.handleQuitApplication);
    }

    componentDidCatch (error, info) {
        this.props.openModal({
            type: 'BUG_REPORT',
            props: { error, info }
        });
    }

    updateCdiscLibrary = (value) => {
        this.setState({ cdiscLibraryKit: { cdiscLibrary: value, updateCdiscLibrary: this.state.cdiscLibraryKit.updateCdiscLibrary } });
    };

    checkCdiscLibraryForUpdates = async (value) => {
        let { cdiscLibraryVersion, cdiscLibraryLastChecked } = this.props.cdiscLibraryInfo;
        let lastCheckedDate = new Date(cdiscLibraryLastChecked || '2000-01-01');
        let compareDate = new Date(lastCheckedDate.toISOString());
        compareDate = new Date(compareDate.setDate(lastCheckedDate.getDate() + 1));
        // Check only once a day
        if ((new Date() > compareDate) && this.state.cdiscLibraryKit) {
            let cl = this.state.cdiscLibraryKit.cdiscLibrary;
            // As bug workaround, send a dummy request in 1 seconds if the object did not load
            if (process.platform === 'linux') {
                setTimeout(() => {
                    dummyRequest(cl);
                }, 1000);
            }
            let lastUpdated = await cl.getLastUpdated();
            if (typeof lastUpdated === 'object' && lastUpdated.overall && lastUpdated.overall > (cdiscLibraryVersion || '')) {
                const db = await openDB('cdiscLibrary-store', 1, {
                    upgrade (db) {
                        // Create a store of objects
                        db.createObjectStore('cdiscLibrary', {});
                    },
                });

                await db.delete('cdiscLibrary', 'products');
                // Delete all root keys as they can be also updated
                let allKeys = await db.getAllKeys('cdiscLibrary');
                for (let i = 0; i < allKeys.length; i++) {
                    let key = allKeys[i];
                    if (key.startsWith('r/')) {
                        await db.delete('cdiscLibrary', key);
                    }
                }

                // Reset the library contents
                cl.reset();
                // Reset view to products, so that they can be loaded when user open CDISC Library
                this.props.changeCdiscLibraryView({ view: 'products' }, 'main');

                this.props.saveCdiscLibraryInfo({ cdiscLibraryVersion: lastUpdated.overall, cdiscLibraryLastChecked: Date().toString() });
                this.props.openSnackbar({
                    type: 'success',
                    message: `CDISC Library updated to version ${lastUpdated.overall}`,
                });
            }
        }
    };

    handleQuitApplication = () => {
        let cdiscLibrary = this.state.cdiscLibraryKit.cdiscLibrary;
        if (typeof cdiscLibrary === 'object' && cdiscLibrary.coreObject && cdiscLibrary.coreObject.traffic) {
            this.props.saveCdiscLibraryInfo({ traffic: cdiscLibrary.coreObject.traffic });
        }
        quitApplication();
    };

    handleUpdateInformation = (event, updateAvailable, data) => {
        if (updateAvailable) {
            this.props.updateMainUi({ updateInfo: { releaseNotes: data.updateInfo.releaseNotes, version: data.updateInfo.version } });
        }
    };

    openWithStylesheet = (event) => {
        const updatedOdm = getUpdatedDefineBeforeSave(this.props.odm);
        ipcRenderer.send('openWithStylesheet', updatedOdm.odm);
    };

    onKeyDown = (event) => {
        if (event.ctrlKey && event.keyCode === 72 && this.props.currentPage === 'editor' && type !== 'reviewWindow') {
            this.toggleRedoUndo();
        } else if (event.shiftKey && event.ctrlKey && event.keyCode === 70) {
            this.findInPage();
        } else if (event.ctrlKey && event.keyCode === 70 && !this.props.disableFindToggle) {
            this.findInPage();
        } else if (event.ctrlKey && event.keyCode === 191) {
            event.preventDefault();
            this.toggleShortcuts();
        } else if ((event.ctrlKey || event.shiftKey) && event.keyCode === 123 && type !== 'reviewWindow') {
            saveState();
        } else if (event.keyCode === 123 && type !== 'reviewWindow') {
            sendDefineObject();
        } else if (event.keyCode === 122 && this.props.currentPage === 'editor') {
            this.openWithStylesheet();
        }
    }

    toggleRedoUndo = () => {
        this.setState({ showRedoUndo: !this.state.showRedoUndo });
    }

    toggleShortcuts = () => {
        this.setState({ showShortcuts: !this.state.showShortcuts });
    }

    findInPage = () => {
        ipcRenderer.send('openFindInPage');
    }

    render () {
        if (this.props.bugModalOpened) {
            return (
                <MuiThemeProvider theme={this.props.disableAnimations ? disabledAnimationTheme : baseTheme}>
                    <ModalRoot />
                </MuiThemeProvider>
            );
        }
        return (
            <CdiscLibraryContext.Provider value={this.state.cdiscLibraryKit}>
                <MuiThemeProvider theme={this.props.disableAnimations ? disabledAnimationTheme : baseTheme}>
                    { this.props.windowType !== 'reviewWindow' && (
                        <MainMenu
                            onToggleRedoUndo={this.toggleRedoUndo}
                            onToggleFindInPage={this.findInPage}
                            onToggleShortcuts={this.toggleShortcuts}
                        />
                    )}
                    <KeyboardShortcuts open={this.state.showShortcuts} onToggleShortcuts={this.toggleShortcuts}/>
                    {this.props.currentPage === 'studies' && <Studies />}
                    {this.props.currentPage === 'editor' && <Editor onToggleRedoUndo={this.toggleRedoUndo}/>}
                    {this.props.currentPage === 'controlledTerminology' && <ControlledTerminology />}
                    {this.props.currentPage === 'cdiscLibrary' && <CdiscLibraryMain mountPoint='main'/>}
                    {this.props.currentPage === 'settings' && <Settings />}
                    {this.props.currentPage === 'about' && <About />}
                    <ModalRoot />
                    <SnackbarRoot />
                    { this.state.showRedoUndo && <RedoUndo onToggleRedoUndo={this.toggleRedoUndo}/> }
                </MuiThemeProvider>
            </CdiscLibraryContext.Provider>
        );
    }
}

ConnectedApp.propTypes = {
    currentPage: PropTypes.string.isRequired,
    currentStudyId: PropTypes.string.isRequired,
    currentDefineId: PropTypes.string.isRequired,
    showInitialMessage: PropTypes.bool.isRequired,
    disableFindToggle: PropTypes.bool.isRequired,
    disableAnimations: PropTypes.bool.isRequired,
    checkForUpdates: PropTypes.bool.isRequired,
    cdiscLibrarySettings: PropTypes.object,
    backup: PropTypes.object,
    lastBackupDate: PropTypes.string,
    bugModalOpened: PropTypes.bool,
    openModal: PropTypes.func.isRequired,
    openSnackbar: PropTypes.func.isRequired,
    updateSearchInfo: PropTypes.func.isRequired,
    changeCdiscLibraryView: PropTypes.func.isRequired,
    updateMainUi: PropTypes.func,
    saveCdiscLibraryInfo: PropTypes.func,
    cdiscLibraryInfo: PropTypes.object,
    odm: PropTypes.object,
    windowType: PropTypes.string,
};

const App = connect(mapStateToProps, mapDispatchToProps)(ConnectedApp);
export default App;
