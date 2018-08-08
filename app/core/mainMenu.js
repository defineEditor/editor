import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Settings from '@material-ui/icons/Settings';
import Assignment from '@material-ui/icons/Assignment';
import Edit from '@material-ui/icons/Edit';
import Public from '@material-ui/icons/Public';
import Divider from '@material-ui/core/Divider';
import {
    toggleMainMenu,
    changePage,
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
        mainMenuOpened: state.ui.main.mainMenuOpened,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        toggleMainMenu : () => dispatch(toggleMainMenu()),
        changePage : (updateObj) => dispatch(changePage(updateObj)),
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
                        </List>
                    </div>
                </div>
            </Drawer>
        );
    }
}

ConnectedMainMenu.propTypes = {
    classes        : PropTypes.object.isRequired,
    mainMenuOpened : PropTypes.bool.isRequired,
    toggleMainMenu : PropTypes.func.isRequired,
    changePage     : PropTypes.func.isRequired,
};

const MainMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedMainMenu);
export default withStyles(styles)(MainMenu);
