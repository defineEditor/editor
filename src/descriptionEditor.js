import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import Divider from 'material-ui/Divider';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import CommentEditor from './commentEditor.js';
import OriginEditor from './originEditor.js';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    iconButton: {
        marginBottom: '8px',
    },
});

class DescriptionEditor extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            origins  : this.props.defaultValue.origins,
            comment  : this.props.defaultValue.comment,
            method   : this.props.defaultValue.method,
            prognote : this.props.defaultValue.prognote,
        };
    }

    handleChange = (name, originId) => (updateObj) => {
        this.setState({[name]: updateObj});
    }

    save = () => {
        let updatedComment = this.state.comment;
        this.props.onUpdate(updatedComment);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <OriginEditor {...this.props} defaultValue={this.state.origins} onUpdate={this.handleChange('origins')}/>
                </Grid>
                <Divider/>
                <Grid item xs={12}>
                    <CommentEditor {...this.props} defaultValue={this.state.comment} onUpdate={this.handleChange('comment')} stateless={true}/>
                </Grid>
                <Divider/>
                <Grid item xs={12}>
                    <div>
                        <br/><br/>
                        <Button color='primary' onClick={this.save} variant='raised' className={classes.button}>Save</Button>
                        <Button color='secondary' onClick={this.cancel} variant='raised' className={classes.button}>Cancel</Button>
                    </div>
                </Grid>
            </Grid>
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
