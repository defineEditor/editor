import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import deepEqual from 'fast-deep-equal';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import LowPriority from '@material-ui/icons/LowPriority';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import SaveCancel from 'editors/saveCancel.js';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        border        : '2px solid',
        borderColor   : 'primary',
        top           : '10%',
        transform     : 'translate(0%, calc(-10%+0.5px))',
        overflowX     : 'none',
        maxHeight     : '90%',
        overflowY     : 'auto',
        width         : '300px',
    },
    editButton: {
        transform: 'translate(0%, -6%)',
    },
    list: {
        backgroundColor : '#F9F9F9',
        padding         : '0px',
        maxHeight       : '600px',
        overflowX       : 'auto',
    },
    listItem: {
        borderWidth     : '1px',
        backgroundColor : '#FFFFFF',
        borderStyle     : 'solid',
        borderColor     : 'rgba(0, 0, 0, 0.12)',
    },
    sortableHelper: {
        zIndex: 3000,
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
            dialogOpened : false,
            items        : this.props.items,
        };

    }

    resetState = () => {
        this.setState({
            dialogOpened : false,
            items        : this.props.items,
        });
    }

    handleOpen = () => {
        this.setState({ dialogOpened: true });
    }

    handleCancelAndClose = () => {
        this.resetState();
    }

    handleSaveAndClose = () => {
        // Check if the order changed
        if (!deepEqual(this.state.items, this.props.items)) {
            this.props.onSave(this.state.items);
        }
        this.setState({ dialogOpened: false });
    }

    handleChange = ({oldIndex, newIndex}) => {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex),
        });
    };

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.handleCancelAndClose();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.handleSaveAndClose();
        }
    }

    render() {
        const {classes} = this.props;

        return (
            <React.Fragment>
                <Button
                    color="default"
                    variant='fab'
                    mini
                    onClick={this.handleOpen}
                    className={classes.editButton}
                >
                    <LowPriority/>
                </Button>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={this.state.dialogOpened}
                    PaperProps={{className: classes.dialog}}
                    onKeyDown={this.onKeyDown}
                    tabIndex='0'
                >
                    <DialogTitle>{this.props.title}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={8} alignItems='flex-end'>
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
    classes : PropTypes.object.isRequired,
    items   : PropTypes.array.isRequired,
    onSave  : PropTypes.func.isRequired,
    title   : PropTypes.string.isRequired,
};

export default withStyles(styles)(GeneralOrderEditor);

