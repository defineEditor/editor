import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import Dialog, {DialogContent, DialogTitle} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import { addVariable } from 'actions/index.js';
import { ItemRef, ItemDef } from 'elements.js';
import SaveCancel from 'editors/saveCancel.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingTop    : theme.spacing.unit * 1,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        border        : '2px solid',
        borderColor   : 'primary',
        top           : '20%',
        transform     : 'translate(0%, -20%)',
        overflowX     : 'auto',
        maxHeight     : '90%',
        width         : '90%',
        overflowY     : 'auto',
    },
    name: {
        width: '200px',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addVariable: (source, itemRef, itemDef, orderNumber) => dispatch(addVariable(source, itemRef, itemDef, orderNumber)),
    };
};

const mapStateToProps = state => {
    return {
        model         : state.odm.study.metaDataVersion.model,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        itemDefs      : state.odm.study.metaDataVersion.itemDefs,
        itemGroups    : state.odm.study.metaDataVersion.itemGroups,
    };
};

class AddVariableEditorConnected extends React.Component {
    constructor (props) {
        super(props);
        const maxOrderNum = this.props.itemGroups[this.props.itemGroupOid].itemRefOrder.length + 1;
        this.state = {
            name         : '',
            orderNumber  : maxOrderNum,
            maxOrderNum  : maxOrderNum,
            dialogOpened : false,
        };

    }

    resetState = () => {
        this.setState({
            name         : '',
            orderNumber  : this.props.itemGroups[this.props.itemGroupOid].itemRefOrder.length + 1,
            dialogOpened : false,
        });
    }

    handleChange = (name) => (event) => {
        if (name === 'name') {
            this.setState({ [name]: event.target.value.toUpperCase() });
        } else if (name === 'orderNumber') {
            if (event.target.value >= 1 && event.target.value <= this.state.maxOrderNum) {
                this.setState({[name]: event.target.value});
            }
        }
    }

    handleOpen = () => {
        this.setState({ dialogOpened: true });
    }

    handleCancelAndClose = () => {
        this.resetState();
    }

    handleSaveAndClose = (updateObj) => {
        // Get all possible IDs
        let itemDefOids = Object.keys(this.props.itemDefs);
        let itemRefOids = Object.keys(this.props.itemGroups[this.props.itemGroupOid].itemRefs);
        let itemDefOid = getOid('Item', undefined, itemDefOids);
        let itemRefOid = getOid('ItemRef', undefined, itemRefOids);
        let itemDef = new ItemDef({
            oid  : itemDefOid,
            name : this.state.name,
        });
        let itemRef = new ItemRef({
            oid     : itemRefOid,
            itemOid : itemDefOid,
        });
        this.props.addVariable({itemGroupOid: this.props.itemGroupOid}, itemRef, itemDef, this.state.orderNumber);
        this.resetState();
    }

    render() {
        const {classes} = this.props;

        return (
            <React.Fragment>
                <Button
                    color="default"
                    mini
                    variant='raised'
                    onClick={this.handleOpen}
                    className={classes.editButton}
                >
                    Add
                </Button>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={this.state.dialogOpened}
                    PaperProps={{className: classes.dialog}}
                >
                    <DialogTitle>Add New Dataset</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={8} alignItems='flex-end'>
                            <Grid item xs={12}>
                                <TextField
                                    label='Name'
                                    autoFocus
                                    value={this.state.name}
                                    onChange={this.handleChange('name')}
                                    className={classes.name}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Position'
                                    type='number'
                                    InputLabelProps={{shrink: true}}
                                    value={this.state.orderNumber}
                                    onChange={this.handleChange('orderNumber')}
                                    className={classes.textField}
                                />
                            </Grid>
                            <Grid item>
                                <SaveCancel save={this.handleSaveAndClose} cancel={this.handleCancelAndClose}/>
                            </Grid>
                        </Grid>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

AddVariableEditorConnected.propTypes = {
    classes       : PropTypes.object.isRequired,
    model         : PropTypes.string.isRequired,
    itemGroupOid  : PropTypes.string.isRequired,
    itemDefs      : PropTypes.object.isRequired,
    itemGroups    : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
};

const AddVariableEditor = connect(mapStateToProps, mapDispatchToProps)(AddVariableEditorConnected);
export default withStyles(styles)(AddVariableEditor);

