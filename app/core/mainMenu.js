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

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Switch from '@material-ui/core/Switch';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Settings from '@material-ui/icons/Settings';
import Save from '@material-ui/icons/Save';
import SaveAlt from '@material-ui/icons/SaveAlt';
import SystemUpdate from '@material-ui/icons/SystemUpdate';
import History from '@material-ui/icons/History';
import Info from '@material-ui/icons/Info';
import Keyboard from '@material-ui/icons/Keyboard';
import Print from '@material-ui/icons/Print';
import Search from '@material-ui/icons/Search';
import FindInPage from '@material-ui/icons/FindInPage';
import Review from '@material-ui/icons/RemoveRedEye';
import LocalLibrary from '@material-ui/icons/LocalLibrary';
import Description from '@material-ui/icons/Description';
import Close from '@material-ui/icons/Close';
import Assignment from '@material-ui/icons/Assignment';
import Edit from '@material-ui/icons/Edit';
import Public from '@material-ui/icons/Public';
import { FaTools } from 'react-icons/fa';
import sendDefineObject from 'utils/sendDefineObject.js';
import saveState from 'utils/saveState.js';
import {
    toggleMainMenu,
    changePage,
    updateMainUi,
    toggleReviewMode,
    openModal,
} from 'actions/index.js';

const styles = theme => ({
    drawer: {
        zIndex: 9001,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        backgroundColor: theme.palette.primary.main,
    },
    reviewModeSwitch: {
        margin: 'none',
    },
    faIcon: {
        marginLeft: '3px',
        fontSize: '18px',
    },
    update: {
        backgroundColor: '#42A5F5',
        '&:hover': {
            backgroundColor: '#BBDEFB',
        }
    },
});

// Redux functions
const mapStateToProps = state => {
    let currentPage = state.present.ui.main.currentPage;
    let pathToDefine;
    if (currentPage === 'editor') {
        if (state.present.odm && state.present.odm.defineId) {
            pathToDefine = state.present.defines.byId[state.present.odm.defineId].pathToFile || '';
        }
    }
    return {
        mainMenuOpened: state.present.ui.main.mainMenuOpened,
        updateInfo: state.present.ui.main.updateInfo,
        currentPage,
        pathToDefine,
        currentDefineId: state.present.ui.main.currentDefineId,
        reviewMode: state.present.ui.main.reviewMode,
        enableCdiscLibrary: state.present.settings.cdiscLibrary.enableCdiscLibrary,
        actionsDone: state.index,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        toggleMainMenu: () => dispatch(toggleMainMenu()),
        changePage: (updateObj) => dispatch(changePage(updateObj)),
        updateMainUi: (updateObj) => dispatch(updateMainUi(updateObj)),
        toggleReviewMode: (updateObj) => dispatch(toggleReviewMode(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
    };
};

class ConnectedMainMenu extends React.Component {
    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && (event.keyCode === 77)) {
            this.props.toggleMainMenu();
        }
        if (this.props.mainMenuOpened === true) {
            if (event.keyCode === 83) {
                this.openStudies();
            } else if (event.keyCode === 69) {
                this.openEditor();
            } else if (event.keyCode === 84) {
                this.openSettings();
            } else if (event.keyCode === 67) {
                this.openControlledTerminology();
            } else if (event.keyCode === 82 && this.props.currentPage === 'studies') {
                this.openStudySearch();
            } else if (event.keyCode === 70) {
                this.props.toggleMainMenu();
                this.props.onToggleFindInPage();
            } else if (event.keyCode === 76 && this.props.enableCdiscLibrary) {
                this.openCdiscLibrary();
            } else if (event.keyCode === 80) {
                this.print();
            }
        }
    }

    print = () => {
        ipcRenderer.send('printCurrentView');
    }

    save = (noToggle) => {
        saveState();
        if (!(noToggle === true)) {
            this.props.toggleMainMenu();
        }
    }

    saveAs = () => {
        sendDefineObject();
        this.props.toggleMainMenu();
    }

    openStudies = () => {
        this.props.changePage({ page: 'studies' });
    }

    openEditor = () => {
        if (this.props.currentDefineId !== '') {
            this.props.changePage({ page: 'editor' });
        }
    }

    openControlledTerminology = () => {
        this.props.changePage({ page: 'controlledTerminology' });
    }

    openCdiscLibrary = () => {
        this.props.changePage({ page: 'cdiscLibrary' });
    }

    openSettings = () => {
        this.props.changePage({ page: 'settings' });
    }

    openStudySearch = () => {
        this.props.openModal({
            type: 'SEARCH_STUDIES'
        });
        this.props.toggleMainMenu();
    }

    openTools = () => {
        this.props.openModal({
            type: 'DEFINE_TOOLS'
        });
        this.props.toggleMainMenu();
    }

    onUpdate = () => {
        this.props.openModal({
            type: 'UPDATE_APPLICATION',
            props: { releaseNotes: this.props.updateInfo.releaseNotes, version: this.props.updateInfo.version }
        });
    }

    render () {
        const { classes } = this.props;
        return (
            <Drawer open={this.props.mainMenuOpened} onClose={this.props.toggleMainMenu} className={classes.drawer}>
                <div
                    tabIndex={0}
                    role="button"
                >
                    <div className={classes.drawerHeader}>
                        <IconButton onClick={this.props.toggleMainMenu}>
                            <ChevronLeftIcon/>
                        </IconButton>
                    </div>
                    <Divider/>
                    <div className={classes.list}>
                        <List>
                            <ListItem button key='studies' onClick={this.openStudies}>
                                <ListItemIcon>
                                    <Assignment/>
                                </ListItemIcon>
                                <ListItemText primary={<span><u>S</u>tudies</span>}/>
                            </ListItem>
                            <ListItem button key='editor' onClick={this.openEditor} disabled={this.props.currentDefineId === ''}>
                                <ListItemIcon>
                                    <Edit/>
                                </ListItemIcon>
                                <ListItemText primary={<span><u>E</u>ditor</span>}/>
                            </ListItem>
                            <ListItem button key='controlledTerminology' onClick={this.openControlledTerminology}>
                                <ListItemIcon>
                                    <Public/>
                                </ListItemIcon>
                                <ListItemText primary={<span><u>C</u>ontrolled Teminology</span>}/>
                            </ListItem>
                            <ListItem button key='cdiscLibrary' onClick={this.openCdiscLibrary} disabled={!this.props.enableCdiscLibrary}>
                                <ListItemIcon>
                                    <LocalLibrary/>
                                </ListItemIcon>
                                <ListItemText primary={<span>CDISC <u>L</u>ibrary</span>}/>
                            </ListItem>
                            <ListItem button key='settings' onClick={this.openSettings}>
                                <ListItemIcon>
                                    <Settings/>
                                </ListItemIcon>
                                <ListItemText primary={<span>Se<u>t</u>tings</span>}/>
                            </ListItem>
                            <ListItem button key='about' onClick={() => this.props.changePage({ page: 'about' })}>
                                <ListItemIcon>
                                    <Info/>
                                </ListItemIcon>
                                <ListItemText primary='About'/>
                            </ListItem>
                            <ListItem button key='shortcuts' onClick={() => { this.props.toggleMainMenu(); this.props.onToggleShortcuts(); }}>
                                <ListItemIcon>
                                    <Keyboard/>
                                </ListItemIcon>
                                <ListItemText primary='Keyboard Shortcuts'/>
                            </ListItem>
                            { this.props.updateInfo && this.props.updateInfo.version &&
                                <ListItem button key='update' onClick={this.onUpdate} className={classes.update}>
                                    <ListItemIcon>
                                        <SystemUpdate/>
                                    </ListItemIcon>
                                    <ListItemText primary='Update'/>
                                </ListItem>
                            }
                            <Divider/>
                            <ListItem button key='findInPage' onClick={() => { this.props.toggleMainMenu(); this.props.onToggleFindInPage(); }}>
                                <ListItemIcon>
                                    <FindInPage/>
                                </ListItemIcon>
                                <ListItemText primary={<span><u>F</u>ind in Page</span>}/>
                            </ListItem>
                            { this.props.currentPage === 'studies' && (
                                <ListItem button key='searchStudies' onClick={this.openStudySearch}>
                                    <ListItemIcon>
                                        <Search/>
                                    </ListItemIcon>
                                    <ListItemText primary={<span>Sea<u>r</u>ch Studies</span>}/>
                                </ListItem>
                            )}
                            { this.props.currentPage === 'editor' && ([
                                (
                                    <ListItem button key='redoundo' onClick={() => { this.props.toggleMainMenu(); this.props.onToggleRedoUndo(); }}>
                                        <ListItemIcon>
                                            <History/>
                                        </ListItemIcon>
                                        <ListItemText primary='History'/>
                                    </ListItem>
                                ), (
                                    <ListItem button key='save' onClick={this.save}>
                                        <ListItemIcon>
                                            <Save/>
                                        </ListItemIcon>
                                        <ListItemText primary='Save'/>
                                    </ListItem>
                                ), (
                                    <ListItem button key='saveAs' onClick={this.saveAs}>
                                        <ListItemIcon>
                                            <SaveAlt/>
                                        </ListItemIcon>
                                        <ListItemText primary='Save As'/>
                                    </ListItem>
                                ), (
                                    <ListItem button key='print' onClick={() => { this.print(); this.props.toggleMainMenu(); }}>
                                        <ListItemIcon>
                                            <Print/>
                                        </ListItemIcon>
                                        <ListItemText primary='Print'/>
                                    </ListItem>
                                ), (
                                    <ListItem button key='commentMethod' onClick={() => { this.props.updateMainUi({ showCommentMethodTable: true }); this.props.toggleMainMenu(); }}>
                                        <ListItemIcon>
                                            <Description/>
                                        </ListItemIcon>
                                        <ListItemText primary='Comments/Methods'/>
                                    </ListItem>
                                ), (
                                    <ListItem button key='tools' onClick={this.openTools}>
                                        <ListItemIcon>
                                            <FaTools className={classes.faIcon}/>
                                        </ListItemIcon>
                                        <ListItemText primary='Tools'/>
                                    </ListItem>
                                ), (
                                    <ListItem button key='reviewModeToggle' onClick={() => { this.props.toggleReviewMode(); }}>
                                        <ListItemIcon>
                                            { this.props.reviewMode === true ? (
                                                <Review/>
                                            ) : (
                                                <Edit/>
                                            )}
                                        </ListItemIcon>
                                        <ListItemText primary={[
                                            (
                                                <Switch
                                                    checked={this.props.reviewMode === true}
                                                    color='primary'
                                                    className={classes.reviewModeSwitch}
                                                    key='switch'
                                                />
                                            ), (
                                                <span key='modeText'> Review Mode</span>
                                            )]
                                        }/>
                                    </ListItem>
                                )]
                            )}
                            <ListItem button key='quit' onClick={() => { this.props.toggleMainMenu(); ipcRenderer.send('appQuit'); }}>
                                <ListItemIcon>
                                    <Close/>
                                </ListItemIcon>
                                <ListItemText primary='Quit'/>
                            </ListItem>
                        </List>
                    </div>
                </div>
            </Drawer>
        );
    }
}

ConnectedMainMenu.propTypes = {
    classes: PropTypes.object.isRequired,
    mainMenuOpened: PropTypes.bool.isRequired,
    updateInfo: PropTypes.object.isRequired,
    currentPage: PropTypes.string.isRequired,
    pathToDefine: PropTypes.string,
    currentDefineId: PropTypes.string.isRequired,
    reviewMode: PropTypes.bool.isRequired,
    toggleMainMenu: PropTypes.func.isRequired,
    onToggleRedoUndo: PropTypes.func.isRequired,
    onToggleFindInPage: PropTypes.func.isRequired,
    onToggleShortcuts: PropTypes.func.isRequired,
    changePage: PropTypes.func.isRequired,
    toggleReviewMode: PropTypes.func.isRequired,
    updateMainUi: PropTypes.func.isRequired,
    actionsDone: PropTypes.number.isRequired,
    enableCdiscLibrary: PropTypes.bool,
};

const MainMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedMainMenu);
export default withStyles(styles)(MainMenu);
