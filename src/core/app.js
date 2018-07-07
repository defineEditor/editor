import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Editor from 'core/editor.js';
import MainMenu from 'core/mainMenu.js';

// Redux functions
const mapStateToProps = state => {
    return {
        currentPage: state.ui.main.currentPage,
    };
};

class ConnectedApp extends Component {
    render () {
        return (
            <div>
                <MainMenu/>
                { this.props.currentPage === 'editor' && <Editor/> }
            </div>
        );
    }
}

ConnectedApp.propTypes = {
    currentPage: PropTypes.string.isRequired,
};

const App = connect(mapStateToProps)(ConnectedApp);
export default App;
