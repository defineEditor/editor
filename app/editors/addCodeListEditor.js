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
import { addCodeList } from 'actions/index.js';
import SaveCancel from 'editors/saveCancel.js';
import getSelectionList from 'utils/getSelectionList.js';
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
        addCodeList: (updateObj) => dispatch(addCodeList(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        defineVersion : state.present.odm.study.metaDataVersion.defineVersion,
        codeLists     : state.present.odm.study.metaDataVersion.codeLists,
        codeListTypes : state.present.stdConstants.codeListTypes,
    };
};

class AddVariableEditorConnected extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            name         : '',
            codeListType : 'decoded',
            dialogOpened : false,
        };

    }

    resetState = () => {
        this.setState({
            name         : '',
            codeListType : 'decoded',
            dialogOpened : false,
        });
    }

    handleChange = (name) => (event) => {
        if (name !== 'linkedCodeList') {
            this.setState({ [name]: event.target.value });
        } else if (name === 'linkedCodeList') {
            // TODO
        }
    }

    handleOpen = () => {
        this.setState({ dialogOpened: true });
    }

    handleCancelAndClose = () => {
        this.resetState();
    }

    handleSaveAndClose = (updateObj) => {
        let codeListOids = Object.keys(this.props.codeLists);
        let codeListOid = getOid('CodeList', undefined, codeListOids);
        // Get all possible IDs
        this.props.addCodeList({
            oid          : codeListOid,
            name         : this.state.name,
            codeListType : this.state.codeListType,
        });
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
                    disabled={this.props.disabled}
                >
                    Add
                </Button>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={this.state.dialogOpened}
                    PaperProps={{className: classes.dialog}}
                >
                    <DialogTitle>Add New Codelist</DialogTitle>
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
                                    label='Codelist Type'
                                    select
                                    value={this.state.codeListType}
                                    onChange={this.handleChange('codeListType')}
                                    className={classes.name}
                                >
                                    {getSelectionList(this.props.codeListTypes)}
                                </TextField>
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
    codeLists     : PropTypes.object.isRequired,
    codeListTypes : PropTypes.array.isRequired,
    defineVersion : PropTypes.string.isRequired,
    disabled      : PropTypes.bool,
};

const AddVariableEditor = connect(mapStateToProps, mapDispatchToProps)(AddVariableEditorConnected);
export default withStyles(styles)(AddVariableEditor);
