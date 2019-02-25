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
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Grid from '@material-ui/core/Grid';
import {
    toggleMainMenu,
} from 'actions/index.js';

const styles = theme => ({
    menuToggle: {
        marginLeft: theme.spacing.unit,
    },
    navBarItem: {
        marginTop: theme.spacing.unit,
    },
    menu: {
        marginRight: theme.spacing.unit * 2,
    },
});

const mapDispatchToProps = dispatch => {
    return {
        toggleMainMenu: () => dispatch(toggleMainMenu()),
    };
};

class ConnectedNavigationBar extends React.Component {
    renderChildElements = () => {
        return React.Children.map(this.props.children, (child) => (
            <Grid item className={this.props.classes.navBarItem}>
                {child}
            </Grid>
        ));
    }
    render () {
        const { classes } = this.props;
        return (
            <AppBar position="fixed" color='default'>
                <Grid container justify='flex-start'>
                    <Grid item className={classes.menu}>
                        <IconButton
                            color='default'
                            onClick={this.props.toggleMainMenu}
                            className={classes.menuToggle}
                        >
                            <MenuIcon/>
                        </IconButton>
                    </Grid>
                    {this.props.children !== undefined && (
                        <Grid item xs={10}>
                            <Grid container justify='flex-start' alignItems='center'>
                                {this.renderChildElements()}
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </AppBar>
        );
    }
}

ConnectedNavigationBar.propTypes = {
    classes: PropTypes.object.isRequired,
    toggleMainMenu: PropTypes.func.isRequired,
};

const NavigationBar = connect(undefined, mapDispatchToProps)(ConnectedNavigationBar);
export default withStyles(styles)(NavigationBar);
