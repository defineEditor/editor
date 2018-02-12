import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import DocumentEditor from './documentEditor.js';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import {Comment, TranslatedText} from './elements.js';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import DeleteIcon from 'material-ui-icons/Delete';
import DescriptionIcon from 'material-ui-icons/Description';
import AddIcon from 'material-ui-icons/Add';
import Tooltip from 'material-ui/Tooltip';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    iconButton: {
        marginBottom: '8px',
    },
});

class CommentEditor extends React.Component {
    constructor (props) {
        super(props);
        // Bootstrap table changed undefined to '' when saving the value. 
        // Catching this and resetting to undefined in case it is an empty string
        let defaultValue;
        this.handleChange = this.handleChange.bind(this);
        if (this.props.stateless !== true) {
            if (this.props.defaultValue === '') {
                defaultValue = undefined;
            } else {
                defaultValue = this.props.defaultValue;
            }
            this.state = {
                comment: defaultValue
            };
        }
    }

    cloneComment = (prevComment)  => {
        let newComment = Object.assign(Object.create(Object.getPrototypeOf(prevComment)),prevComment);
        if (newComment.descriptions.length > 0) {
            newComment.descriptions = prevComment.descriptions.slice();
        }
        if (newComment.documents.length > 0) {
            newComment.descriptions = prevComment.descriptions.slice();
        }
    }

    handleChange = (name) => (updateObj) => {
        let newComment;
        let comment = this.props.stateless === true ? this.props.defaultValue : this.state.comment;
        if (name === 'addComment') {
            newComment = new Comment({descriptions: [new TranslatedText({lang: 'en', value: ''})]});
        }
        if (name === 'deleteComment') {
            newComment = undefined;
        }
        if (name === 'text') {
            newComment = comment.clone();
            newComment.setDescription(updateObj.currentTarget.value);
        }
        if (name === 'addDocument') {
            newComment = comment.clone();
            newComment.addDocument();
        }
        if (name === 'updateDocument') {
            newComment = updateObj;
        }
        if (this.props.stateless === true) {
            // If state should be uplifted - use the callback
            this.props.onUpdate(newComment);
        } else {
            // Otherwise update state locally
            this.setState({comment: newComment});
        }
    }

    save = () => {
        this.props.onUpdate(this.state.comment);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render () {
        const { classes } = this.props;
        let comment = this.props.stateless === true ? this.props.defaultValue : this.state.comment;

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Typography variant="subheading">
                        Comment
                        {comment === undefined &&
                                <Tooltip title="Add Comment" placement="right">
                                    <IconButton
                                        onClick={this.handleChange('addComment')}
                                        className={classes.iconButton}
                                        color='primary'
                                    >
                                        <AddIcon/>
                                    </IconButton>
                                </Tooltip>
                        }
                        {comment !== undefined &&
                                <React.Fragment>
                                    <Tooltip title="Remove Comment" placement="right">
                                        <IconButton
                                            onClick={this.handleChange('deleteComment')}
                                            className={classes.iconButton}
                                            color='default'
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Add Document" placement="right">
                                        <IconButton
                                            onClick={this.handleChange('addDocument')}
                                            className={classes.iconButton}
                                            color='primary'
                                        >
                                            <DescriptionIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </React.Fragment>
                        }
                    </Typography>
                </Grid>
                <Grid item xs={12} >
                    {comment !== undefined &&
                            <React.Fragment>
                                <TextField
                                    label="Comment Text"
                                    multiline
                                    fullWidth
                                    rowsMax="10"
                                    autoFocus
                                    value={comment.getDescription()}
                                    onChange={this.handleChange('text')}
                                    margin="normal"
                                />
                                <DocumentEditor
                                    parentObj={comment}
                                    handleChange={this.handleChange('updateDocument')}
                                    leafs={this.props.leafs}
                                    annotatedCrf={this.props.annotatedCrf}
                                    supplementalDoc={this.props.supplementalDoc}
                                />
                            </React.Fragment>
                    }
                </Grid>
                {this.props.stateless !== true &&
                    <Grid item xs={12} >
                        <br/>
                        <Button color='primary' onClick={this.save} variant='raised' className={classes.button}>Save</Button>
                        <Button color='secondary' onClick={this.cancel} variant='raised' className={classes.button}>Cancel</Button>
                    </Grid>
                }
            </Grid>
        );
    }
}

CommentEditor.propTypes = {
    defaultValue: PropTypes.oneOfType([
        PropTypes.instanceOf(Comment),
        PropTypes.oneOf([""]),
    ]),
    leafs           : PropTypes.object.isRequired,
    annotatedCrf    : PropTypes.array.isRequired,
    supplementalDoc : PropTypes.array.isRequired,
    onUpdate        : PropTypes.func,
    stateless       : PropTypes.bool,
};

export default withStyles(styles)(CommentEditor);
