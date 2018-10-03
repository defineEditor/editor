import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { remote } from 'electron';
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
import History from '@material-ui/icons/History';
import Print from '@material-ui/icons/Print';
import Search from '@material-ui/icons/Search';
import Review from '@material-ui/icons/RemoveRedEye';
import Archive from '@material-ui/icons/Archive';
import Assignment from '@material-ui/icons/Assignment';
import Edit from '@material-ui/icons/Edit';
import Public from '@material-ui/icons/Public';
import sendDefineObject from 'utils/sendDefineObject.js';
import saveState from 'utils/saveState.js';
import {
    toggleMainMenu,
    changePage,
    updateMainUi,
    appSave,
    toggleReviewMode,
} from 'actions/index.js';

const styles = theme => ({
    drawer: {
        zIndex: 9001,
    },
    drawerHeader: {
        display         : 'flex',
        alignItems      : 'center',
        justifyContent  : 'flex-end',
        padding         : '0 8px',
        backgroundColor : theme.palette.primary.main,
    },
    reviewModeSwitch: {
        margin     : 'none',
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        mainMenuOpened: state.present.ui.main.mainMenuOpened,
        currentPage: state.present.ui.main.currentPage,
        currentDefineId: state.present.ui.main.currentDefineId,
        reviewMode: state.present.ui.main.reviewMode,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        toggleMainMenu : () => dispatch(toggleMainMenu()),
        changePage : (updateObj) => dispatch(changePage(updateObj)),
        updateMainUi : (updateObj) => dispatch(updateMainUi(updateObj)),
        appSave : (updateObj) => dispatch(appSave(updateObj)),
        toggleReviewMode : (updateObj) => dispatch(toggleReviewMode(updateObj)),
    };
};

class ConnectedMainMenu extends React.Component {

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event)  => {
        if (event.ctrlKey && (event.keyCode === 77)) {
            this.props.toggleMainMenu();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save(true);
        }
    }

    print = () => {
        remote.getCurrentWindow().webContents.print();
    }

    save = (noToggle) => {
        saveState();
        if (!(noToggle === true)) {
            this.props.toggleMainMenu();
        }
    }

    render() {
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
                            <ListItem button key='studies' onClick={() => this.props.changePage({ page: 'studies' })}>
                                <ListItemIcon>
                                    <Assignment/>
                                </ListItemIcon>
                                <ListItemText primary='Studies'/>
                            </ListItem>
                            <ListItem button key='editor' onClick={() => this.props.changePage({ page: 'editor' })}>
                                <ListItemIcon>
                                    <Edit/>
                                </ListItemIcon>
                                <ListItemText primary='Editor'/>
                            </ListItem>
                            <ListItem button key='controlledTerminology' onClick={() => this.props.changePage({ page: 'controlledTerminology' })}>
                                <ListItemIcon>
                                    <Public/>
                                </ListItemIcon>
                                <ListItemText primary='Controlled Teminology'/>
                            </ListItem>
                            <ListItem button key='settings' onClick={() => this.props.changePage({ page: 'settings' })}>
                                <ListItemIcon>
                                    <Settings/>
                                </ListItemIcon>
                                <ListItemText primary='Settings'/>
                            </ListItem>
                            <Divider/>
                            <ListItem button key='redoundo' onClick={() => {this.props.toggleMainMenu(); this.props.onToggleRedoUndo(); }}>
                                <ListItemIcon>
                                    <History/>
                                </ListItemIcon>
                                <ListItemText primary='History'/>
                            </ListItem>
                            <ListItem button key='search' onClick={() => {this.props.toggleMainMenu(); this.props.onToggleFindInPage(300);}}>
                                <ListItemIcon>
                                    <Search/>
                                </ListItemIcon>
                                <ListItemText primary='Search'/>
                            </ListItem>
                            { this.props.currentPage === 'editor' && (
                                [(
                                    <ListItem button key='save' onClick={this.save}>
                                        <ListItemIcon>
                                            <Save/>
                                        </ListItemIcon>
                                        <ListItemText primary='Save'/>
                                    </ListItem>
                                ) , (
                                        <ListItem button key='saveAs' onClick={() => {sendDefineObject(); this.props.toggleMainMenu();}}>
                                            <ListItemIcon>
                                                <SaveAlt/>
                                            </ListItemIcon>
                                            <ListItemText primary='Save As'/>
                                        </ListItem>
                                    ) , (
                                        <ListItem button key='print' onClick={() => {this.print(); this.props.toggleMainMenu();}}>
                                            <ListItemIcon>
                                                <Print/>
                                            </ListItemIcon>
                                            <ListItemText primary='Print'/>
                                        </ListItem>
                                    ) , (
                                        <ListItem button key='dataInput' onClick={() => {this.props.updateMainUi({showDataInput: true}); this.props.toggleMainMenu();}}>
                                            <ListItemIcon>
                                                <Archive/>
                                            </ListItemIcon>
                                            <ListItemText primary='Import Length'/>
                                        </ListItem>
                                    ) , (
                                        <ListItem button key='reviewModeToggle' onClick={() => {this.props.toggleReviewMode();}}>
                                            <ListItemIcon>
                                                { this.props.reviewMode === true ? (
                                                    <Review/>
                                                ) : (
                                                    <Edit/>
                                                )}
                                            </ListItemIcon>
                                            <ListItemText primary={
                                                [(
                                                    <Switch
                                                        checked={this.props.reviewMode === true}
                                                        color='primary'
                                                        className={classes.reviewModeSwitch}
                                                        key='switch'
                                                    />
                                                ),(
                                                        <span key='modeText'> Review Mode</span>
                                                    )]
                                            }/>
                                        </ListItem>
                                    )
                                ]
                            )}
                        </List>
                    </div>
                </div>
            </Drawer>
        );
    }
}

ConnectedMainMenu.propTypes = {
    classes            : PropTypes.object.isRequired,
    mainMenuOpened     : PropTypes.bool.isRequired,
    currentPage        : PropTypes.string.isRequired,
    currentDefineId    : PropTypes.string.isRequired,
    reviewMode         : PropTypes.bool.isRequired,
    toggleMainMenu     : PropTypes.func.isRequired,
    onToggleRedoUndo   : PropTypes.func.isRequired,
    onToggleFindInPage : PropTypes.func.isRequired,
    changePage         : PropTypes.func.isRequired,
    appSave            : PropTypes.func.isRequired,
    toggleReviewMode   : PropTypes.func.isRequired,
    updateMainUi       : PropTypes.func.isRequired,
};

const MainMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedMainMenu);
export default withStyles(styles)(MainMenu);
