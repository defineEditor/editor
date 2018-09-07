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
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import InsertLink from '@material-ui/icons/InsertLink';
import AddIcon from '@material-ui/icons/AddCircle';
import SelectCommentIcon from '@material-ui/icons/OpenInNew';
import Tooltip from '@material-ui/core/Tooltip';
import {Comment, TranslatedText} from 'elements.js';
import getOid from 'utils/getOid.js';
import SelectMethodComment from 'utils/selectMethodComment.js';
import SaveCancel from 'editors/saveCancel.js';
import getSourceLabels from 'utils/getSourceLabels.js';
import { addDocument, getDescription, setDescription } from 'utils/defineStructureUtils.js';
import {
    updateItemGroupComment,
    addItemGroupComment,
    deleteItemGroupComment,
    replaceItemGroupComment,
} from 'actions/index.js';

const styles = theme => ({
    iconButton: {
        marginLeft   : '0px',
        marginRight  : '0px',
        marginBottom : '8px',
    },
    commentInput: {
        margin: '0px',
    },
    multipleSourcesLine: {
        whiteSpace : 'pre-wrap',
        color      : 'grey',
    },
    root: {
        outline: 'none',
    },
});

const mapStateToProps = state => {
    return {
        leafs    : state.present.odm.study.metaDataVersion.leafs,
        comments : state.present.odm.study.metaDataVersion.comments,
        mdv      : state.present.odm.study.metaDataVersion,
        lang     : state.present.odm.study.metaDataVersion.lang,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateItemGroupComment: (source, comment) => dispatch(updateItemGroupComment(source, comment)),
        addItemGroupComment: (source, comment) => dispatch(addItemGroupComment(source, comment)),
        deleteItemGroupComment: (source, comment) => dispatch(deleteItemGroupComment(source, comment)),
        replaceItemGroupComment: (source, newComment, oldCommentOid) => dispatch(replaceItemGroupComment(source, newComment, oldCommentOid)),
    };
};

class ConnectedCommentEditor extends React.Component {
    constructor (props) {
        super(props);
        // Bootstrap table changed undefined to '' when saving the value.
        // Catching this and resetting to undefined in case it is an empty string
        this.rootRef = React.createRef();
        let comment;
        if (this.props.stateless !== true) {
            if (this.props.comment === '') {
                comment = undefined;
            } else {
                comment = clone(this.props.comment);
            }
            this.state = {
                comment             : comment,
                selectCommentOpened : false,
            };
        } else {
            this.state = {
                selectCommentOpened: false,
            };
        }
    }

    componentDidMount() {
        if (!this.props.stateless) {
            this.rootRef.current.focus();
        }
    }

    handleChange = (name) => (updateObj) => {
        let newComment;
        let comment = this.props.stateless === true ? this.props.comment : this.state.comment;
        if (name === 'addComment') {
            let commentOid = getOid('Comment', undefined, Object.keys(this.props.comments));
            newComment = { ...new Comment({oid: commentOid, descriptions: [ { ...new TranslatedText({lang: this.props.lang, value: ''}) } ]}) };
        } else if (name === 'deleteComment') {
            newComment = undefined;
        } else if (name === 'textUpdate') {
            newComment = clone(comment);
            setDescription(newComment, updateObj.target.value);
        } else if (name === 'addDocument') {
            newComment = clone(comment);
            addDocument(newComment);
        } else if (name === 'updateDocument') {
            newComment = updateObj;
        } else if (name === 'selectComment') {
            newComment = updateObj;
            this.setState({selectCommentOpened: false});
        } else if (name === 'copyComment') {
            let commentOid = getOid('Comment', undefined, Object.keys(this.props.comments));
            newComment = { ...new Comment({ ...clone(updateObj), oid: commentOid, sources: undefined }) };
            this.setState({selectCommentOpened: false});
        }

        if (this.props.stateless === true) {
            // If state should be uplifted - use the callback
            this.props.onUpdate(newComment);
        } else {
            // Otherwise update state locally
            this.setState({comment: newComment});
        }
    }

    handleSelectDialog = (name) => (updateObj) => {
        if (name === 'openSelectComment') {
            this.setState({selectCommentOpened: true});
        } else if (name === 'closeSelectComment') {
            this.setState({selectCommentOpened: false});
        }
    }

    save = () => {
        let row = this.props.row;
        let oldComment = row['comment'];
        if (!deepEqual(this.state.comment, oldComment)) {
            if (this.state.comment === undefined) {
                // If comment was removed
                this.props.deleteItemGroupComment({type: 'itemGroups', oid: row.oid}, row.comment);
            } else if (oldComment === undefined) {
                // If comment was added
                this.props.addItemGroupComment({type: 'itemGroups', oid: row.oid}, this.state.comment);
            } else if (oldComment.oid !== this.state.comment.oid) {
                // If comment was replaced
                this.props.replaceItemGroupComment({type: 'itemGroups', oid: row.oid}, this.state.comment, oldComment.oid);
            } else {
                this.props.updateItemGroupComment({type: 'itemGroups', oid: row.oid}, this.state.comment);
            }
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
                // Focusing on the root element to fire all onBlur events for input fields
                this.rootRef.current.focus();
                // Call save through dummy setState to verify all states were updated
                // TODO Check if this guarantees that all onBlurs are finished, looks like it is not
                this.setState({}, this.save);
            }
        }
    }

    render () {
        const { classes } = this.props;
        let comment = this.props.stateless === true ? this.props.comment : this.state.comment;
        let sourceLabels = {count: 0};
        let usedBy;
        if (comment !== undefined) {
            sourceLabels = getSourceLabels(comment.sources, this.props.mdv);
            if (sourceLabels.count > 1) {
                usedBy = sourceLabels.labelParts.join('. ');
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
                            Comment
                            <Tooltip title={comment === undefined ? 'Add Comment' : 'Remove Comment'} placement='bottom' enterDelay={1000}>
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
                            <Tooltip title='Add Link to Document' placement='bottom' enterDelay={1000}>
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
                            <Tooltip title='Select Comment' placement='bottom' enterDelay={1000}>
                                <span>
                                    <IconButton
                                        onClick={this.handleSelectDialog('openSelectComment')}
                                        disabled={comment === undefined}
                                        className={classes.iconButton}
                                        color={comment !== undefined ? 'primary' : 'default'}
                                    >
                                        <SelectCommentIcon/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Typography>
                    </Grid>
                    {(sourceLabels.count > 1)  &&
                            <Grid item xs={12}>
                                <div className={classes.multipleSourcesLine}>
                                    This comment is used by multiple sources. {usedBy}
                                </div>
                            </Grid>
                    }
                    { this.state.selectCommentOpened &&
                            <SelectMethodComment
                                type='Comment'
                                onSelect={this.handleChange('selectComment')}
                                onCopy={this.handleChange('copyComment')}
                                onClose={this.handleSelectDialog('closeSelectComment')}
                            />
                    }
                    {comment !== undefined &&
                            <Grid item xs={12}>
                                <TextField
                                    label="Comment Text"
                                    multiline
                                    fullWidth
                                    rowsMax="10"
                                    autoFocus={this.props.autoFocus}
                                    key={comment.oid}
                                    defaultValue={getDescription(comment)}
                                    className={classes.commentInput}
                                    onBlur={this.handleChange('textUpdate')}
                                />
                                <DocumentEditor
                                    parentObj={comment}
                                    handleChange={this.handleChange('updateDocument')}
                                    leafs={this.props.leafs}
                                />
                            </Grid>
                    }
                    {this.props.stateless !== true &&
                            <Grid item xs={12} >
                                <br/>
                                <SaveCancel save={this.save} cancel={this.cancel}/>
                            </Grid>
                    }
                </Grid>
            </div>
        );
    }
}

ConnectedCommentEditor.propTypes = {
    comment: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([""]),
    ]),
    leafs     : PropTypes.object.isRequired,
    lang      : PropTypes.string.isRequired,
    mdv       : PropTypes.object.isRequired,
    comments  : PropTypes.object.isRequired,
    onUpdate  : PropTypes.func,
    autoFocus : PropTypes.bool,
    stateless : PropTypes.bool,
};

const CommentEditor = connect(mapStateToProps, mapDispatchToProps)(ConnectedCommentEditor);
export default withStyles(styles)(CommentEditor);
