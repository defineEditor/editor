import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { addItemGroup } from 'actions/index.js';
import { ItemGroup } from 'elements.js';
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
        addItemGroup: (itemGroup) => dispatch(addItemGroup(itemGroup)),
    };
};

const mapStateToProps = state => {
    return {
        model         : state.odm.study.metaDataVersion.model,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        itemGroupOids : Object.keys(state.odm.study.metaDataVersion.itemGroups),
    };
};

class AddDatasetEditorConnected extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            name         : '',
            dialogOpened : false,
        };

    }

    resetState = () => {
        this.setState({
            name         : '',
            dialogOpened : false,
        });
    }

    handleChange = (name) => (event) => {
        if (name === 'name') {
            this.setState({ [name]: event.target.value.toUpperCase() });
        }
    }

    handleOpen = () => {
        this.setState({ dialogOpened: true });
    }

    handleCancelAndClose = () => {
        this.resetState();
    }

    handleSaveAndClose = (updateObj) => {
        let itemGroupOid = getOid('ItemGroup', undefined, this.props.itemGroupOids);
        let itemGroup = new ItemGroup({
            oid  : itemGroupOid,
            name : this.state.name,
        });
        this.props.addItemGroup(itemGroup);
        this.resetState();
    }

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
                    onKeyDown={this.onKeyDown}
                    tabIndex='0'
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

AddDatasetEditorConnected.propTypes = {
    classes       : PropTypes.object.isRequired,
    model         : PropTypes.string.isRequired,
    itemGroupOids : PropTypes.array.isRequired,
    defineVersion : PropTypes.string.isRequired,
};

const AddDatasetEditor = connect(mapStateToProps, mapDispatchToProps)(AddDatasetEditorConnected);
export default withStyles(styles)(AddDatasetEditor);

