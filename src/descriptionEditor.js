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

class DescriptionEditor extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            origin   : props.defaultValue.origin,
            comment  : props.defaultValue.comment,
            method   : props.defaultValue.method,
            prognote : props.defaultValue.prognote,
        };
    }

    handleChange = name => updateObj => {
        if (name === 'commenttext') {
            let newComment = Object.assign(Object.create(Object.getPrototypeOf(this.state.comment)),this.state.comment);
            newComment.getDescription().value = updateObj.currentTarget.value;
            this.setState({comment: newComment});
        }
        if (name === 'document') {
            this.setState({comment: updateObj});
        }
    }

    save = () => {
        let updatedComment = this.state.comment;
        this.props.onUpdate(updatedComment);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render () {
        let originTypes;
        if (this.props.model === 'ADaM') {
            originTypes = ['Derived', 'Assigned', 'Predecessor'];
        } else {
            originTypes = ['CRF', 'Derived', 'Assigned', 'Protocol', 'eDT', 'Predecessor'];
        }
        // Get the list of available documents
        let leafs = this.props.leafs;
        let documentList = [];
        Object.keys(leafs).forEach( (leafId) => {
            documentList.push({[leafId]: leafs[leafId].title});
        });

        const origin = this.state.origins[0].type !== undefined ? this.state.origins[0].type : '';

        const { classes } = this.props;

        return (
            <div>
                <TextField
                    label='Origin Type'
                    fullWidth
                    autoFocus
                    select={true}
                    onKeyDown={this.props.onKeyDown}
                    value={}
                    onChange={this.handleChange('originType')}
                    className={classes.textField}
                >
                    {originTypes}
                </TextField>
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

DescriptionEditor.propTypes = {
    defaultValue    : PropTypes.object,
    leafs           : PropTypes.object.isRequired,
    annotatedCrf    : PropTypes.array.isRequired,
    supplementalDoc : PropTypes.array.isRequired,
};
/*
    defaultValue.comment : PropTypes.object,
    defaultValue.method  : PropTypes.object,
    defaultValue.origins : PropTypes.array,
    defaultValue.note    : PropTypes.object,
    defaultValue.model   : PropTypes.string.isRequired,
    */

export default withStyles(styles)(DescriptionEditor);
