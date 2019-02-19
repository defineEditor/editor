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
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import ModalRoot from 'components/modal/modalRoot.js';
import MainMenu from 'core/mainMenu.js';
import Editor from 'core/editor.js';
import ControlledTerminology from 'core/controlledTerminology.js';
import Settings from 'core/settings.js';
import Studies from 'core/studies.js';
import About from 'core/about.js';
import RedoUndo from 'utils/redoUndo.js';
import FindInPage from 'utils/findInPage.js';
import {
    openModal,
} from 'actions/index.js';

const theme = createMuiTheme({
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
    }
});

// Redux functions
const mapStateToProps = state => {
    return {
        currentPage: state.present.ui.main.currentPage,
        showInitialMessage: state.present.settings.popUp.onStartUp,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        openModal: updateObj => dispatch(openModal(updateObj)),
    };
};

class ConnectedApp extends Component {
    constructor (props) {
        super(props);
        this.state = {
            showRedoUndo: false,
            showFindInPage: false,
        };
    }

    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
        if (this.props.showInitialMessage) {
            this.props.openModal({
                type: 'INITIAL_MESSAGE',
                props: {}
            });
        }
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && (event.keyCode === 72)) {
            this.toggleRedoUndo();
        }
        if (event.ctrlKey && (event.keyCode === 70)) {
            this.toggleFindInPage();
        }
    }

    toggleRedoUndo = () => {
        this.setState({ showRedoUndo: !this.state.showRedoUndo });
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
        return (
            <MuiThemeProvider theme={theme}>
                <MainMenu onToggleRedoUndo={this.toggleRedoUndo} onToggleFindInPage={this.toggleFindInPage}/>
                {this.props.currentPage === 'studies' && <Studies />}
                {this.props.currentPage === 'editor' && <Editor onToggleRedoUndo={this.toggleRedoUndo}/>}
                {this.props.currentPage === 'controlledTerminology' && <ControlledTerminology />}
                {this.props.currentPage === 'settings' && <Settings />}
                {this.props.currentPage === 'about' && <About />}
                <ModalRoot />
                { this.state.showRedoUndo && <RedoUndo onToggleRedoUndo={this.toggleRedoUndo}/> }
                { this.state.showFindInPage && <FindInPage onToggleFindInPage={this.toggleFindInPage}/> }
            </MuiThemeProvider>
        );
    }
}

ConnectedApp.propTypes = {
    currentPage: PropTypes.string.isRequired,
    showInitialMessage: PropTypes.bool.isRequired
};

const App = connect(mapStateToProps, mapDispatchToProps)(ConnectedApp);
export default App;
