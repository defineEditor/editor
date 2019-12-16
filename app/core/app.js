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
import FindInPage from 'components/utils/findInPage.js';
import saveState from 'utils/saveState.js';
import sendDefineObject from 'utils/sendDefineObject.js';
import changeAppTitle from 'utils/changeAppTitle.js';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import { initCdiscLibrary } from 'utils/cdiscLibraryUtils.js';
import quitApplication from 'utils/quitApplication.js';
import {
    openModal,
    updateMainUi,
    saveCdiscLibraryInfo
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
};

const disabledAnimationThemeObj = {
    ...baseThemeObj,
    transitions: {
        // So we have `transition: none;` everywhere
        create: () => 'none',
    },
    props: {
        MuiButtonBase: {
            // The properties to apply
            disableRipple: true, // No more ripple, on the whole application 💣!
        },
    }
};

const baseTheme = createMuiTheme(baseThemeObj);
const disabledAnimationTheme = createMuiTheme(disabledAnimationThemeObj);

// Redux functions
const mapStateToProps = state => {
    // On the variables tab of the editor Ctrl-F focused on a search bar
    let disableFindToggle = false;
    let currentPage = state.present.ui.main.currentPage;
    const tabs = state.present.ui.tabs;
    if (currentPage === 'editor' && tabs.hasOwnProperty('tabNames') && tabs.tabNames.hasOwnProperty(tabs.currentTab)) {
        disableFindToggle = ['Variables', 'Codelists', 'Coded Values', 'Review Comments'].includes(tabs.tabNames[tabs.currentTab]);
    } else if (currentPage === 'cdiscLibrary' || currentPage === 'controlledTerminology') {
        disableFindToggle = true;
    }
    let bugModalOpened = state.present.ui && state.present.ui.modal && state.present.ui.modal.type === 'BUG_REPORT';
    return {
        currentPage,
        showInitialMessage: state.present.settings.popUp.onStartUp,
        disableAnimations: state.present.settings.general.disableAnimations,
        disableFindToggle,
        sampleStudyCopied: state.present.ui.main.sampleStudyCopied,
        currentDefineId: state.present.ui.main.currentDefineId,
        currentStudyId: state.present.ui.main.currentStudyId,
        bugModalOpened,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        openModal: updateObj => dispatch(openModal(updateObj)),
        updateMainUi: (updateObj) => dispatch(updateMainUi(updateObj)),
        saveCdiscLibraryInfo: (updateObj) => dispatch(saveCdiscLibraryInfo(updateObj)),
    };
};

class ConnectedApp extends Component {
    constructor (props) {
        super(props);
        this.state = {
            showRedoUndo: false,
            showFindInPage: false,
            showShortcuts: false,
            cdiscLibraryKit: { cdiscLibrary: initCdiscLibrary(), updateCdiscLibrary: this.updateCdiscLibrary },
        };
    }

    componentDidMount () {
        // Comparing to other event listeners which are defined in index.js, this one needs to be here, so that CDISC Library object can be used
        ipcRenderer.on('quit', this.handleQuitApplication);
        window.addEventListener('keydown', this.onKeyDown);
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
        // Set title of the application
        if (this.props.currentStudyId && this.props.currentDefineId) {
            changeAppTitle({ studyId: this.props.currentStudyId, defineId: this.props.currentDefineId });
        }
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
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

    handleQuitApplication = () => {
        let cdiscLibrary = this.state.cdiscLibraryKit.cdiscLibrary;
        if (typeof cdiscLibrary === 'object' && cdiscLibrary.coreObject && cdiscLibrary.coreObject.traffic) {
            this.props.saveCdiscLibraryInfo({ traffic: cdiscLibrary.coreObject.traffic });
        }
        quitApplication();
    };

    onKeyDown = (event) => {
        if (event.ctrlKey && event.keyCode === 72 && this.props.currentPage === 'editor') {
            this.toggleRedoUndo();
        } else if (event.ctrlKey && event.keyCode === 70 && !this.props.disableFindToggle) {
            this.toggleFindInPage();
        } else if (event.ctrlKey && event.keyCode === 191) {
            event.preventDefault();
            this.toggleShortcuts();
        } else if ((event.ctrlKey || event.shiftKey) && event.keyCode === 123) {
            saveState();
        } else if (event.keyCode === 123) {
            sendDefineObject();
        }
    }

    toggleRedoUndo = () => {
        this.setState({ showRedoUndo: !this.state.showRedoUndo });
    }

    toggleShortcuts = () => {
        this.setState({ showShortcuts: !this.state.showShortcuts });
    }

    toggleFindInPage = (timeOut) => {
        if (timeOut > 0) {
            // Timeout is required when toggle is triggered from the main menu
            // Otherwise the input field gets unfocused after main menu closes
            setTimeout(() => { this.setState({ showFindInPage: !this.state.showFindInPage }); }, timeOut);
        } else {
            this.setState({ showFindInPage: !this.state.showFindInPage });
        }
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
                    <MainMenu
                        onToggleRedoUndo={this.toggleRedoUndo}
                        onToggleFindInPage={this.toggleFindInPage}
                        onToggleShortcuts={this.toggleShortcuts}
                    />
                    <KeyboardShortcuts open={this.state.showShortcuts} onToggleShortcuts={this.toggleShortcuts}/>
                    {this.props.currentPage === 'studies' && <Studies />}
                    {this.props.currentPage === 'editor' && <Editor onToggleRedoUndo={this.toggleRedoUndo}/>}
                    {this.props.currentPage === 'controlledTerminology' && <ControlledTerminology />}
                    {this.props.currentPage === 'cdiscLibrary' && <CdiscLibraryMain />}
                    {this.props.currentPage === 'settings' && <Settings />}
                    {this.props.currentPage === 'about' && <About />}
                    <ModalRoot />
                    <SnackbarRoot />
                    { this.state.showRedoUndo && <RedoUndo onToggleRedoUndo={this.toggleRedoUndo}/> }
                    { this.state.showFindInPage && <FindInPage onToggleFindInPage={this.toggleFindInPage}/> }
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
    bugModalOpened: PropTypes.bool,
    openModal: PropTypes.func,
    updateMainUi: PropTypes.func,
    saveCdiscLibraryInfo: PropTypes.func,
};

const App = connect(mapStateToProps, mapDispatchToProps)(ConnectedApp);
export default App;
