import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import clone from 'clone';
import deepEqual from 'fast-deep-equal';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import DocumentEditor from 'editors/documentEditor.js';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InsertLink from '@material-ui/icons/InsertLink';
import Tooltip from '@material-ui/core/Tooltip';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';
import SaveCancel from 'editors/saveCancel.js';
import { addDocument, getDescription, setDescription } from 'utils/defineStructureUtils.js';
import {
    updateResultDisplay,
} from 'actions/index.js';

const styles = theme => ({
    iconButton: {
        marginLeft   : '0px',
        marginRight  : '0px',
        marginBottom : '8px',
    },
    resultDisplayInput: {
        marginBottom : '8px',
    },
    helperText: {
        whiteSpace : 'pre-wrap',
        color      : theme.palette.primary.main,
    },
    root: {
        outline: 'none',
    },
});

const mapStateToProps = state => {
    return {
        leafs                 : state.present.odm.study.metaDataVersion.leafs,
        lang                  : state.present.odm.study.metaDataVersion.lang,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateResultDisplay: (updateObj) => dispatch(updateResultDisplay(updateObj)),
    };
};

class ConnectedArmDescriptionEditor extends React.Component {
    constructor (props) {
        super(props);
        // Bootstrap table changed undefined to '' when saving the value.
        // Catching this and resetting to undefined in case it is an empty string
        this.rootRef = React.createRef();
        let description = clone(this.props.description);
        let descriptionText = getDescription(description);
        this.state = {
            docObj: { documents: description.documents },
            descriptionText,
        };
    }

    handleChange = (name) => (updateObj) => {
        if (name === 'textUpdate') {
            this.setState({ descriptionText: updateObj.target.value });
        } else if (name === 'addDocument') {
            let docObj = clone(this.state.docObj);
            addDocument(docObj);
            this.setState({ docObj });
        } else if (name === 'updateDocument') {
            this.setState({ docObj: updateObj });
        }
    }

    save = () => {
        // Form the new description object;
        let newDescriptions = { descriptions: this.props.description.descriptions.slice() };
        setDescription(newDescriptions, this.state.descriptionText, this.props.lang);
        let updates = { descriptions: newDescriptions.descriptions, documents: this.state.docObj.documents };
        // Compare it with the original value
        if (!deepEqual(this.props.description, updates)) {
            let updateObj = { oid: this.props.row.oid, updates };
            this.props.updateResultDisplay(updateObj);
        }
        this.props.onUpdate();
    }

    cancel = () => {
        this.props.onUpdate();
    }

    onKeyDown = (event)  => {
        if (this.props.stateless !== true) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                this.cancel();
            } else if (event.ctrlKey && (event.keyCode === 83)) {
                this.save();
            }
        }
    }

    render () {
        const { classes } = this.props;
        let issue = false;
        let helperText;
        const descriptionText = this.state.descriptionText;
        if (descriptionText !== undefined) {
            // Check for special characters
            // eslint-disable-next-line no-control-regex
            let issues = checkForSpecialChars(descriptionText, new RegExp(/[^\u000A\u0020-\u007f]/,'g'));
            if (issues.length > 0) {
                issue = true;
                helperText = issues.join('\n');
            }
        }

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                ref={this.rootRef}
                className={classes.root}
            >
                <Grid container>
                    <Grid item xs={12}>
                        <Typography variant="subheading">
                            Description
                            <Tooltip title='Add Link to Document' placement='bottom' enterDelay={1000}>
                                <span>
                                    <IconButton
                                        onClick={this.handleChange('addDocument')}
                                        className={classes.iconButton}
                                        color='primary'
                                    >
                                        <InsertLink/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Text"
                            multiline
                            fullWidth
                            rowsMax="10"
                            autoFocus
                            helperText={issue && helperText}
                            FormHelperTextProps={{className: classes.helperText}}
                            value={descriptionText}
                            className={classes.resultDisplayInput}
                            onChange={this.handleChange('textUpdate')}
                        />
                        <DocumentEditor
                            parentObj={this.state.docObj}
                            handleChange={this.handleChange('updateDocument')}
                            leafs={this.props.leafs}
                        />
                        <Grid item xs={12} >
                            <br/>
                            <SaveCancel save={this.save} cancel={this.cancel}/>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedArmDescriptionEditor.propTypes = {
    description           : PropTypes.object.isRequired,
    leafs                 : PropTypes.object.isRequired,
    lang                  : PropTypes.string.isRequired,
    row                   : PropTypes.object.isRequired,
    onUpdate              : PropTypes.func,
};

const ArmDescriptionEditor = connect(mapStateToProps, mapDispatchToProps)(ConnectedArmDescriptionEditor);
export default withStyles(styles)(ArmDescriptionEditor);
