/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    list: {
        minWidth: 250,
    },
    currentItem: {
        fontWeight: 'bold',
    },
    currentLine: {
        backgroundColor: '#EEEEEE',
    },
    filteredGroup: {
        color: theme.palette.primary.main,
    },
    notFilteredGroup: {
        color: theme.palette.grey[500],
    },
    drawer: {
        zIndex: 9001,
    },
    divDrawer: {
        outline: 'none',
    },
    textField: {
        marginLeft: theme.spacing.unit * 1.3,
        marginTop: theme.spacing.unit * 1.3,
        paddingRight: theme.spacing.unit * 2.5
    },
});

class GroupTabDrawer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            textFieldString: '',
        };
    }

    componentDidMount() {
        let groupInitialFilter = this.props.groupOrder
            .filter(groupOid => {
                if (this.props.groupClass === 'Coded Values') {
                    return ['decoded','enumerated'].includes(this.props.groups[groupOid].codeListType);
                } else {
                    return true;
                }
            });
        let groupSearchFilter = groupInitialFilter
            .filter(groupOid => {
                return this.props.groups[groupOid].name.toUpperCase().includes(this.state.textFieldString.toUpperCase());
            });
        this.setState({
            groupInitialFilter: groupInitialFilter,
            groupSearchFilter: groupSearchFilter,
        });
    }


    getGroupList = (currentGroupOid, filteredGroupOids) => {
        let lastItemToolTip = this.state.groupSearchFilter.length === 1 ? "<Enter> to open" : null;
        let result = this.state.groupSearchFilter.map(groupOid => {
            if (groupOid === currentGroupOid) {
                return (
                    <ListItem button key={groupOid} className={this.props.classes.currentLine} onClick={this.props.selectGroup(groupOid)}>
                        <ListItemText
                            primary={
                                <span className={this.props.classes.currentItem}>
                                    {this.props.groups[groupOid].name}
                                </span>
                            }
                            secondary={lastItemToolTip}
                        />
                    </ListItem>
                );
            } else if (!this.props.filter.isEnabled || this.props.groupClass !== 'Variables') {
                return (
                    <ListItem button key={groupOid} onClick={this.props.selectGroup(groupOid)}>
                        <ListItemText
                            primary={this.props.groups[groupOid].name}
                            secondary={lastItemToolTip}
                        />
                    </ListItem>
                );
            } else {
                return (
                    <ListItem button key={groupOid} onClick={this.props.selectGroup(groupOid)}>
                        <ListItemText
                            primary={
                                <span className={filteredGroupOids.includes(groupOid) ? this.props.classes.filteredGroup : this.props.classes.notFilteredGroup}>
                                    {this.props.groups[groupOid].name}
                                </span>
                            }
                            secondary={lastItemToolTip}
                        />
                    </ListItem>
                );
            }
        });
        return result;
    }

    handleChangeTextField = event => {
        let groupSearchFilter = this.state.groupInitialFilter
            .filter(groupOid => {
                return this.props.groups[groupOid].name.toUpperCase().includes(event.target.value.toUpperCase());
            });
        this.setState({
            textFieldString: event.target.value,
            groupSearchFilter: groupSearchFilter,
        });
    }

    handleKeyDownTextField = keyPressed => {
        if (keyPressed.keyCode === 13) {
            if (this.state.groupSearchFilter.length === 1) {
                this.props.selectGroup(this.state.groupSearchFilter[0])();
            }
        }
    }

    handleFocusTextField = event => {
        event.target.select();
    }

    render() {
        const { classes } = this.props;

        return(
            <Drawer
                className={classes.drawer}
                open={this.props.isOpened}
                onClose={this.props.onClose}
            >
                <div
                    className={classes.divDrawer}
                    tabIndex={0}
                    role='button'
                >
                    <div className={classes.list}>
                        <TextField
                            className={classes.textField}
                            id='outlined-filter'
                            variant='outlined'
                            fullWidth
                            label={this.props.groupName}
                            autoFocus={true}
                            onFocus={this.handleFocusTextField}
                            value={this.state.textFieldString}
                            onChange={this.handleChangeTextField}
                            onKeyDown={this.handleKeyDownTextField}
                        />
                        <List>
                            {this.props.isOpened && this.getGroupList(this.props.groupOid, this.props.filteredGroupOids)}
                        </List>
                    </div>
                </div>
            </Drawer>
        );
    }
}

export default withStyles(styles)(GroupTabDrawer);
