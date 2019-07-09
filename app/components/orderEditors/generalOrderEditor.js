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
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import deepEqual from 'fast-deep-equal';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import LowPriority from '@material-ui/icons/LowPriority';
import { FaSortAlphaUp, FaSortAlphaDown, FaBook } from 'react-icons/fa';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import SaveCancel from 'editors/saveCancel.js';
import classNames from 'classnames';

const styles = theme => ({
    dialog: {
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 1,
        position: 'absolute',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        top: '10%',
        transform: 'translate(0%, calc(-10%+0.5px))',
        overflowX: 'none',
        maxHeight: '90%',
        overflowY: 'auto',
    },
    editButton: {
        transform: 'translate(0%, -6%)',
    },
    list: {
        backgroundColor: '#F9F9F9',
        padding: '0px',
        maxHeight: '600px',
        overflowX: 'auto',
    },
    listItem: {
        borderWidth: '1px',
        backgroundColor: '#FFFFFF',
        borderStyle: 'solid',
        borderColor: 'rgba(0, 0, 0, 0.12)',
    },
    sortableHelper: {
        zIndex: 3000,
    },
    noSelect: {
        userSelect: 'none',
    },
    icon: {
        transform: 'translate(0, -5%)',
    },
});

const SortableItem = SortableElement(({
    value,
    className,
}) =>
    <ListItem className={className}>
        <ListItemText>{value}</ListItemText>
    </ListItem>
);

const SortableList = SortableContainer(({
    items,
    className,
    itemClass,
}) => {
    return (
        <List className={className}>
            {items.map((value, index) => (
                <SortableItem key={value.oid} index={index} value={value.name} className={itemClass} />
            ))}
        </List>
    );
});

class GeneralOrderEditor extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            dialogOpened: !!props.noButton,
            items: props.items,
            initialItems: props.items,
            sortAscending: true,
        };
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        // Store prevUserId in state so we can compare when props change.
        // Clear out any previously-loaded user data (so we don't render stale stuff).
        if (!deepEqual(nextProps.items, prevState.initialItems)) {
            return {
                items: nextProps.items,
                initialItems: nextProps.items,
            };
        }

        return null;
    }

    resetState = () => {
        this.setState({
            dialogOpened: !!this.props.noButton,
            items: this.props.items,
        });
    }

    handleOpen = () => {
        this.setState({ dialogOpened: true });
    }

    handleCancelAndClose = () => {
        this.resetState();
        if (this.props.onCancel !== undefined) {
            this.props.onCancel();
        }
    }

    handleSaveAndClose = () => {
        // Check if the order changed
        if (!deepEqual(this.state.items, this.props.items)) {
            this.props.onSave(this.state.items);
        }
        this.resetState();
        if (this.props.noButton) {
            // In case of noButton, open/close state is controlled outside
            // and onCancel should be used as onClose in this case
            this.props.onCancel();
        }
    }

    handleChange = ({ oldIndex, newIndex }) => {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex),
        });
    };

    sortPerSpecification = () => {
        let sortedItems = this.state.items.slice();
        let classOrder = Object.keys(this.props.classTypes[this.props.model]);
        sortedItems.sort((item1, item2) => {
            let item1Order = classOrder.indexOf(item1.class);
            let item2Order = classOrder.indexOf(item2.class);
            if (item1Order === item2Order) {
                if (item1.name < item2.name) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                return item1Order - item2Order;
            }
        });

        this.setState({
            items: sortedItems,
        });
    }

    sortAlphabetically = () => {
        let sortedItems = this.state.items.slice();
        sortedItems.sort((item1, item2) => {
            if (this.state.sortAscending) {
                return item1.name > item2.name ? 1 : -1;
            } else {
                return item1.name < item2.name ? 1 : -1;
            }
        });

        this.setState({
            items: sortedItems,
            sortAscending: !this.state.sortAscending,
        });
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.handleCancelAndClose();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.handleSaveAndClose();
        }
    }

    render () {
        const { classes } = this.props;
        const paperWidth = this.props.width ? this.props.width : '300px';

        return (
            <React.Fragment>
                { !this.props.noButton &&
                    <Tooltip title={`Change ${this.props.title.toLowerCase()}`} placement='bottom' enterDelay={1000}>
                        <Fab
                            color='default'
                            size='small'
                            onClick={this.handleOpen}
                            className={classNames(classes.editButton, this.props.iconClass)}
                            disabled={this.props.disabled}
                        >
                            <LowPriority/>
                        </Fab>
                    </Tooltip>
                }
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={this.state.dialogOpened}
                    PaperProps={{ className: classes.dialog, style: { width: paperWidth } }}
                    onKeyDown={this.onKeyDown}
                    tabIndex='0'
                >
                    <DialogTitle>
                        <Grid container spacing={0} alignItems='center' justify='space-between'>
                            <Grid item>
                                <Typography variant="h6">
                                    {this.props.title}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Grid container spacing={0} alignItems='center' justify='flex-end'>
                                    <Grid item>
                                        { this.props.classTypes !== undefined && (
                                            <Tooltip title='Sort per Define-XML Specification' placement='bottom' enterDelay={700}>
                                                <IconButton color='default' onClick={this.sortPerSpecification} className={classes.icon}>
                                                    <FaBook />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Grid>
                                    <Tooltip title={ this.state.sortAscending ? 'Sort Ascending' : 'Sort Descending' } placement='bottom' enterDelay={700}>
                                        <IconButton color='default' onClick={this.sortAlphabetically} className={classes.icon}>
                                            { this.state.sortAscending ? <FaSortAlphaDown /> : <FaSortAlphaUp /> }
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Grid>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={8} alignItems='flex-end' className={classes.noSelect}>
                            <Grid item xs={12}>
                                <SortableList
                                    items={this.state.items}
                                    axis={'xy'}
                                    onSortEnd={this.handleChange}
                                    className={classes.list}
                                    itemClass={classes.listItem}
                                    helperClass={classes.sortableHelper}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SaveCancel save={this.handleSaveAndClose} cancel={this.handleCancelAndClose} justify='space-around'/>
                            </Grid>
                        </Grid>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

GeneralOrderEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    iconClass: PropTypes.string,
    width: PropTypes.string,
    noButton: PropTypes.bool,
    onCancel: PropTypes.func,
    disabled: PropTypes.bool,
};

export default withStyles(styles)(GeneralOrderEditor);
