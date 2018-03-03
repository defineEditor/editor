import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import DocumentEditor from 'editors/documentEditor.js';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import {Comment, TranslatedText} from 'elements.js';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import RemoveIcon from 'material-ui-icons/RemoveCircleOutline';
import InsertLink from 'material-ui-icons/InsertLink';
import AddIcon from 'material-ui-icons/AddCircle';
import Tooltip from 'material-ui/Tooltip';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    iconButton: {
        marginLeft   : '0px',
        marginRight  : '0px',
        marginBottom : '8px',
    },
});

class CommentEditor extends React.Component {
    constructor (props) {
        super(props);
        // Bootstrap table changed undefined to '' when saving the value.
        // Catching this and resetting to undefined in case it is an empty string
        let comment;
        if (this.props.stateless !== true) {
            if (this.props.comment === '') {
                comment = undefined;
            } else {
                comment = this.props.comment.clone();
            }
            this.state = {
                comment: comment
            };
        }
    }

    handleChange = (name) => (updateObj) => {
        let newComment;
        let comment = this.props.stateless === true ? this.props.comment : this.state.comment;
        if (name === 'addComment') {
            newComment = new Comment({descriptions: [new TranslatedText({lang: 'en', value: ''})]});
        }
        if (name === 'deleteComment') {
            newComment = undefined;
        }
        if (name === 'textUpdate') {
            newComment = comment.clone();
            newComment.setDescription(updateObj.target.value);
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
        this.props.onUpdate(this.props.comment);
    }

    render () {
        const { classes } = this.props;
        let comment = this.props.stateless === true ? this.props.comment : this.state.comment;

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Typography variant="subheading">
                        Comment
                        <Tooltip title={comment === undefined ? 'Add Comment' : 'Remove Comment'} placement='bottom'>
                            <span>
                                <IconButton
                                    onClick={comment === undefined ? this.handleChange('addComment') : this.handleChange('deleteComment')}
                                    className={classes.iconButton}
                                    color={comment === undefined ? 'primary' : 'secondary'}
                                >
                                    {comment === undefined ? <AddIcon/> : <RemoveIcon/>}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title='Add Link to Document' placement='bottom'>
                            <span>
                                <IconButton
                                    onClick={this.handleChange('addDocument')}
                                    disabled={comment === undefined}
                                    className={classes.iconButton}
                                    color={comment !== undefined ? 'primary' : 'default'}
                                >
                                    <InsertLink/>
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Typography>
                </Grid>
                {comment !== undefined &&
                        <Grid item xs={12}>
                            <TextField
                                label="Comment Text"
                                multiline
                                fullWidth
                                rowsMax="10"
                                autoFocus={this.props.autoFocus}
                                defaultValue={comment.getDescription()}
                                onBlur={this.handleChange('textUpdate')}
                                margin="normal"
                            />
                            <DocumentEditor
                                parentObj={comment}
                                handleChange={this.handleChange('updateDocument')}
                                leafs={this.props.leafs}
                                annotatedCrf={this.props.annotatedCrf}
                                supplementalDoc={this.props.supplementalDoc}
                            />
                        </Grid>
                }
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
    comment: PropTypes.oneOfType([
        PropTypes.instanceOf(Comment),
        PropTypes.oneOf([""]),
    ]),
    leafs           : PropTypes.object.isRequired,
    annotatedCrf    : PropTypes.array.isRequired,
    supplementalDoc : PropTypes.array.isRequired,
    onUpdate        : PropTypes.func,
    autoFocus       : PropTypes.bool,
    stateless       : PropTypes.bool,
};

export default withStyles(styles)(CommentEditor);
