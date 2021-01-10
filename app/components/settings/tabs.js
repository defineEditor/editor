/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2021 Dmitry Kolosov                                                *
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
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import GeneralSettings from 'components/settings/general.js';
import EditorSettings from 'components/settings/editor.js';
import NotificationSettings from 'components/settings/notification.js';
import SaveCancel from 'editors/saveCancel.js';
import OtherSettings from 'components/settings/other.js';
import {
    toggleMainMenu,
} from 'actions/index.js';

const TabPanel = (props) => {
    const { children, value, index, classes } = props;

    return (
        <Grid
            container
            spacing={2}
            hidden={value !== index}
            className={classes.body}
        >
            {value === index && children}
        </Grid>
    );
};

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    body: {
        width: '95%',
        marginTop: theme.spacing(7),
        marginBottom: theme.spacing(6),
        marginLeft: theme.spacing(2),
        outline: 'none'
    },
    tabs: {
        marginLeft: theme.spacing(6),
    },
    menuToggle: {
        top: 0,
        position: 'fixed',
        zIndex: '1190',
    },
    saveCancel: {
        marginLeft: theme.spacing(6),
        top: 'auto',
        bottom: 0,
    },
}));

const SettingTabs = (props) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const onToggleMainMenu = () => {
        dispatch(toggleMainMenu());
    };

    return (
        <div className={classes.root}>
            <IconButton
                onClick={onToggleMainMenu}
                className={classes.menuToggle}
            >
                <MenuIcon/>
            </IconButton>
            <AppBar
                position='fixed'
                color='default'
            >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant='scrollable'
                    indicatorColor='primary'
                    textColor='primary'
                    className={classes.tabs}
                    scrollButtons='auto'
                >
                    <Tab label='General' />
                    <Tab label='Editor' />
                    <Tab label='Notifications' />
                    <Tab label='Other' />
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0} classes={classes}>
                <GeneralSettings {...props} />
            </TabPanel>
            <TabPanel value={value} index={1} classes={classes}>
                <EditorSettings {...props} />
            </TabPanel>
            <TabPanel value={value} index={2} classes={classes}>
                <NotificationSettings {...props} />
            </TabPanel>
            <TabPanel value={value} index={3} classes={classes}>
                <OtherSettings {...props} />
            </TabPanel>
            <AppBar
                position='fixed'
                color='default'
                className={classes.saveCancel}
            >
                <SaveCancel save={props.save} cancel={props.cancel} disabled={props.settingsNotChanged} justify='flex-end' />
            </AppBar>
        </div>
    );
};

export default SettingTabs;
