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
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

const styles = theme => ({
    drawer: {
        zIndex: 9001,
        width: '500px',
    },
    category: {
        fontWeight: 'bold',
        fontSize: '14pt',
    },
    shortcut: {
        fontWeight: 'bold',
        backgroundColor: theme.palette.grey['200'],
    },
    headerTitle: {
        marginLeft: theme.spacing.unit * 1,
        color: 'white',
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 8px',
        backgroundColor: theme.palette.primary.main,
    },
    reviewModeSwitch: {
        margin: 'none',
    },
});

const shortcuts = {
    'General': {
        'Ctrl + /': 'Toggle this panel',
        'Ctrl + M': 'Toggle the application menu',
        'Ctrl + `': 'Toggle Dataset/Codelist/Arm Display selection. Key ` is to the left of 1.',
        'Ctrl + H': 'Toggle editing History',
        'Ctrl + N': 'Add new item (Dataset, Variable, Codelist, etc.)',
        'Ctrl + Z': 'Undo the last change when editing History is opened',
        'Ctrl + Y': 'Redo the change when editing History is opened',
        'Ctrl + F': 'Find in the page. Focus on the Search box when in the Variables tab',
        'Ctrl + [': 'Go the to next page when pagination is enabled in the Variable tab',
        'Ctrl + ]': 'Go the to previous page when pagination is enabled in the Variable tab',
        'Arrow keys': 'Navigation in editable tables',
    },
    'Cell/Field Editors': {
        'Ctrl + S': 'Save a change where there is a save button or icon available',
        'Escape': 'Cancel a change',
        'TAB': 'Focus on the next element of an editor (field/icon/button)',
        'Shift + TAB': 'Focus on the previous element of an editor',
    },
    'Tabs Navigation': {
        'Ctrl + 1': 'Switch to the Variable tab',
        'Ctrl + 2': 'Switch to the Coded Values tab',
        'Ctrl + 3': 'Switch to the Codelist tab',
        'Ctrl + 4': 'Switch to the Datasets tab',
        'Ctrl + 5': 'Switch to the Documents tab',
        'Ctrl + 6': 'Switch to the Standards tab',
        'Ctrl + 7': 'Switch to the ARM Summary tab',
        'Ctrl + 8': 'Switch to the Analysis Results tab',
        'Ctrl + =': 'Switch to the next tab',
        'Ctrl + -': 'Switch to the previous tab',
    },
};

class KeyboardShortcuts extends React.Component {
    getShortcutList = (shortcuts) => {
        let result = [];
        Object.keys(shortcuts).forEach(category => {
            result.push(
                <TableRow key={category}>
                    <TableCell colSpan={2}>
                        <Typography variant='h6'>
                            {category}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
            result = result.concat(Object.keys(shortcuts[category]).map(shortcut => {
                return (
                    <TableRow key={shortcut + category}>
                        <TableCell className={this.props.classes.shortcut}>
                            {shortcut}
                        </TableCell>
                        <TableCell>
                            {shortcuts[category][shortcut]}
                        </TableCell>
                    </TableRow>
                );
            }));
        });
        return result;
    }
    render () {
        const { classes } = this.props;
        return (
            <Drawer open={this.props.open} onClose={this.props.onToggleShortcuts} className={classes.drawer} anchor='right'>
                <div
                    tabIndex={0}
                    role="button"
                >
                    <div className={classes.drawerHeader}>
                        <IconButton onClick={this.props.onToggleShortcuts}>
                            <ChevronRightIcon/>
                        </IconButton>
                        <Typography variant='h6' className={classes.headerTitle}>
                            Shortcuts
                        </Typography>
                    </div>
                    <Divider/>
                    <Table className={classes.table}>
                        <TableBody>
                            {this.getShortcutList(shortcuts)}
                        </TableBody>
                    </Table>
                </div>
            </Drawer>
        );
    }
}

KeyboardShortcuts.propTypes = {
    classes: PropTypes.object.isRequired,
    onToggleShortcuts: PropTypes.func.isRequired,
};

export default withStyles(styles)(KeyboardShortcuts);
