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
            dialogOpened : props.noButton ? true : false,
            items        : props.items,
            initialItems : props.items,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // Store prevUserId in state so we can compare when props change.
        // Clear out any previously-loaded user data (so we don't render stale stuff).
        if (!deepEqual(nextProps.items, prevState.initialItems)) {
            return {
                items        : nextProps.items,
                initialItems : nextProps.items,
            };
        }

        return null;
    }

    resetState = () => {
        this.setState({
            dialogOpened : this.props.noButton ? true : false,
            items        : this.props.items,
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
        const paperWidth = this.props.width ? this.props.width : '300px';

        return (
            <React.Fragment>
                { !this.props.noButton &&
                        <Button
                            color="default"
                            variant='fab'
                            mini
                            onClick={this.handleOpen}
                            className={classes.editButton}
                            disabled={this.props.disabled}
                        >
                            <LowPriority/>
                        </Button>
                }
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={this.state.dialogOpened}
                    PaperProps={{className: classes.dialog, style: {width: paperWidth}}}
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
    classes  : PropTypes.object.isRequired,
    items    : PropTypes.array.isRequired,
    onSave   : PropTypes.func.isRequired,
    title    : PropTypes.string.isRequired,
    width    : PropTypes.string,
    noButton : PropTypes.bool,
    onCancel : PropTypes.func,
    disabled : PropTypes.bool,
};

export default withStyles(styles)(GeneralOrderEditor);

