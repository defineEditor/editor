import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import { updateKeyOrder } from 'actions/index.js';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import deepEqual from 'fast-deep-equal';
import Dialog, {DialogContent, DialogTitle} from 'material-ui/Dialog';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Grid from 'material-ui/Grid';
import ManageKeysEditor from 'editors/manageKeysEditor.js';
import SaveCancel from 'editors/saveCancel.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateKeyOrder: (itemGroupOid, keyOrder) => dispatch(updateKeyOrder(itemGroupOid, keyOrder)),
    };
};

const mapStateToProps = state => {
    return {
        itemGroups : state.odm.study.metaDataVersion.itemGroups,
        itemDefs   : state.odm.study.metaDataVersion.itemDefs,
    };
};

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        border        : '2px solid',
        borderColor   : 'primary',
        top           : '20%',
        transform     : 'translate(0%, -20%)',
        overflowX     : 'auto',
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

class InteractiveKeyOrderEditorConnected extends React.Component {
    constructor (props) {
        super(props);
        let keyVariables = [];
        let allVariables = [];

        let dataset = this.props.itemGroups[this.props.row.oid];

        dataset.keyOrder.forEach( itemRefOid => {
            keyVariables.push({oid: itemRefOid, name: this.props.itemDefs[dataset.itemRefs[itemRefOid].itemOid].name});
        });

        dataset.itemRefOrder.forEach( itemRefOid => {
            allVariables.push({oid: itemRefOid, name: this.props.itemDefs[dataset.itemRefs[itemRefOid].itemOid].name});
        });


        this.state = {
            dialogOpened: true,
            keyVariables,
            allVariables,
        };

    }

    handleCancelAndClose = () => {
        this.setState({ dialogOpened: false });
    }

    handleKeyChange = (keyVariables) => {
        this.setState({ keyVariables });
    }

    handleSaveAndClose = (updateObj) => {
        // Check if the order changed
        let originalKeyOrder = this.props.itemGroups[this.props.row.oid].keyOrder;
        let newKeyOrder = this.state.keyVariables.map(item => (item.oid));

        if (!deepEqual(originalKeyOrder, newKeyOrder)) {
            this.props.updateKeyOrder(this.props.row.oid, newKeyOrder);
        }
        this.setState({ dialogOpened: false });
    }

    handleChange = ({oldIndex, newIndex}) => {
        this.setState({
            keyVariables: arrayMove(this.state.keyVariables, oldIndex, newIndex),
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
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open={this.state.dialogOpened}
                PaperProps={{className: classes.dialog}}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle>Key Order</DialogTitle>
                <DialogContent>
                    <ManageKeysEditor
                        keyVariables={this.state.keyVariables}
                        allVariables={this.state.allVariables}
                        handleChange={this.handleKeyChange}
                    />
                    <Grid container spacing={8} alignItems='flex-end'>
                        <Grid item xs={12}>
                            <SortableList
                                items={this.state.keyVariables}
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
        );
    }
}

InteractiveKeyOrderEditorConnected.propTypes = {
    row        : PropTypes.object.isRequired,
    itemGroups : PropTypes.object.isRequired,
};

const InteractiveKeyOrderEditor = connect(mapStateToProps, mapDispatchToProps)(InteractiveKeyOrderEditorConnected);
export default withStyles(styles)(InteractiveKeyOrderEditor);
