import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Editor from 'core/editor.js';
import Settings from 'core/settings.js';
import MainMenu from 'core/mainMenu.js';

const theme = createMuiTheme({
    palette: {
        primary: {
            light        : '#757ce8',
            main         : '#3f50b5',
            dark         : '#002884',
            contrastText : '#fff',
        },
        secondary: {
            light        : '#ff7961',
            main         : '#f44336',
            dark         : '#ba000d',
            contrastText : '#000',
        },
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        currentPage: state.ui.main.currentPage,
    };
};

class ConnectedApp extends Component {
    render () {
        return (
            <MuiThemeProvider theme={theme}>
                <MainMenu/>
                { this.props.currentPage === 'editor' && <Editor/> }
                { this.props.currentPage === 'settings' && <Settings/> }
            </MuiThemeProvider>
        );
    }
}

ConnectedApp.propTypes = {
    currentPage: PropTypes.string.isRequired,
};

const App = connect(mapStateToProps)(ConnectedApp);
export default App;
