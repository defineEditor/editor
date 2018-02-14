import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import Divider from 'material-ui/Divider';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import CommentEditor from './commentEditor.js';
import MethodEditor from './methodEditor.js';
import OriginEditor from './originEditor.js';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    iconButton: {
        marginBottom: '8px',
    },
    gridItem: {
        margin: 'none',
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
        let childProps = Object.assign({}, this.props);
        delete childProps.classes;

        return (
            <Grid container spacing={8} alignItems='center'>
                <Grid item xs={12} className={classes.gridItem}>
                    <OriginEditor {...childProps} defaultValue={this.state.origins} onUpdate={this.handleChange('origins')}/>
                </Grid>
                <Grid item xs={12} className={classes.gridItem}>
                    <Divider/>
                </Grid>
                <Grid item xs={12} className={classes.gridItem}>
                    <CommentEditor {...childProps} defaultValue={this.state.comment} onUpdate={this.handleChange('comment')} stateless={true}/>
                </Grid>
                <Grid item xs={12} className={classes.gridItem}>
                    <Divider/>
                </Grid>
                <Grid item xs={12} className={classes.gridItem}>
                    <MethodEditor {...childProps} defaultValue={this.state.method} onUpdate={this.handleChange('method')} stateless={true}/>
                </Grid>
                <Grid item xs={12} className={classes.gridItem}>
                    <Divider/>
                </Grid>
                <Grid item xs={12} className={classes.gridItem}>
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
    model           : PropTypes.string.isRequired,
};

export default withStyles(styles)(DescriptionEditor);
