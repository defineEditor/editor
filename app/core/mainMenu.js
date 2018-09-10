import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { remote } from 'electron';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Settings from '@material-ui/icons/Settings';
import Save from '@material-ui/icons/Save';
import SaveAlt from '@material-ui/icons/SaveAlt';
import History from '@material-ui/icons/History';
import Print from '@material-ui/icons/Print';
import Assignment from '@material-ui/icons/Assignment';
import Edit from '@material-ui/icons/Edit';
import Public from '@material-ui/icons/Public';
import sendDefineObject from 'utils/sendDefineObject.js';
import saveState from 'utils/saveState.js';
import {
    toggleMainMenu,
    changePage,
    updateMainUi,
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
});

// Redux functions
const mapStateToProps = state => {
    return {
        mainMenuOpened: state.present.ui.main.mainMenuOpened,
        currentPage: state.present.ui.main.currentPage,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        toggleMainMenu : () => dispatch(toggleMainMenu()),
        changePage : (updateObj) => dispatch(changePage(updateObj)),
        updateMainUi : (updateObj) => dispatch(updateMainUi(updateObj)),
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
        }
    }

    print = () => {
        remote.getCurrentWindow().webContents.print();
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
                            <ListItem button key='redoundo' onClick={() => {this.props.onToggleRedoUndo(); this.props.toggleMainMenu();}}>
                                <ListItemIcon>
                                    <History/>
                                </ListItemIcon>
                                <ListItemText primary='History'/>
                            </ListItem>
                            { this.props.currentPage === 'editor' && (
                                [(
                                    <ListItem button key='save' onClick={() => {saveState(); this.props.toggleMainMenu();}}>
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
    classes          : PropTypes.object.isRequired,
    mainMenuOpened   : PropTypes.bool.isRequired,
    currentPage      : PropTypes.string.isRequired,
    toggleMainMenu   : PropTypes.func.isRequired,
    onToggleRedoUndo : PropTypes.func.isRequired,
    changePage       : PropTypes.func.isRequired,
};

const MainMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedMainMenu);
export default withStyles(styles)(MainMenu);
