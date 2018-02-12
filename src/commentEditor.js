import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import DocumentEditor from './documentEditor.js';
import React from 'react';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
});

class CommentEditor extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            comment: props.defaultValue
        };
    }

    handleChange = name => updateObj => {
        if (name === 'text') {
            let newComment = Object.assign(Object.create(Object.getPrototypeOf(this.state.comment)),this.state.comment);
            newComment.setDescription(updateObj.currentTarget.value);
            this.setState({comment: newComment});
        }
        if (name === 'document') {
            this.setState({comment: updateObj});
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

        return (
            <div>
                <TextField
                    label="Comment"
                    multiline
                    fullWidth
                    rowsMax="10"
                    autoFocus
                    value={this.state.comment.getDescription()}
                    onChange={this.handleChange('text')}
                    margin="normal"
                />
                <DocumentEditor parentObj={this.state.comment} handleChange={this.handleChange('document')} {...this.props}/>
                <div>
                    <br/><br/>
                    <Button color='primary' onClick={this.save} variant='raised' className={classes.button}>Save</Button>
                    <Button color='secondary' onClick={this.cancel} variant='raised' className={classes.button}>Cancel</Button>
                </div>
            </div>
        );
    }
}

CommentEditor.propTypes = {
    defaultValue    : PropTypes.object.isRequired,
    leafs           : PropTypes.object.isRequired,
    annotatedCrf    : PropTypes.array.isRequired,
    supplementalDoc : PropTypes.array.isRequired,
    onUpdate        : PropTypes.func,
};

export default withStyles(styles)(CommentEditor);
