import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import ModalRoot from 'utils/modalRoot.js';
import MainMenu from 'core/mainMenu.js';
import Editor from 'core/editor.js';
import ControlledTerminology from 'core/controlledTerminology.js';
import Settings from 'core/settings.js';
import Studies from 'core/studies.js';
import RedoUndo from 'utils/redoUndo.js';
import FindInPage from 'utils/findInPage.js';

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
        currentPage: state.present.ui.main.currentPage
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

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event)  => {
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
            setTimeout(() => {this.setState({ showFindInPage: !this.state.showFindInPage });} , timeOut);
        } else {
            this.setState({ showFindInPage: !this.state.showFindInPage });
        }
    }

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <MainMenu onToggleRedoUndo={this.toggleRedoUndo} onToggleFindInPage={this.toggleFindInPage}/>
                {this.props.currentPage === 'studies' && <Studies />}
                {this.props.currentPage === 'editor' && <Editor />}
                {this.props.currentPage === 'controlledTerminology' && <ControlledTerminology />}
                {this.props.currentPage === 'settings' && <Settings />}
                <ModalRoot />
                { this.state.showRedoUndo && <RedoUndo onToggleRedoUndo={this.toggleRedoUndo}/> }
                { this.state.showFindInPage && <FindInPage onToggleFindInPage={this.toggleFindInPage}/> }
            </MuiThemeProvider>
        );
    }
}

ConnectedApp.propTypes = {
    currentPage: PropTypes.string.isRequired
};

const App = connect(mapStateToProps)(ConnectedApp);
export default App;
