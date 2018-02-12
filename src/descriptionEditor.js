import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import DocumentEditor from './documentEditor.js';
import Divider from 'material-ui/Divider';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import { MenuItem } from 'material-ui/Menu';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import CommentEditor from './commentEditor.js';

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

    getSelectionList = (list, optional) => {
        let selectionList = [];
        if (list.length < 1) {
            throw Error('Blank value list provided for the ItemSelect element');
        } else {
            if (optional === true) {
                selectionList.push(<MenuItem key='0' value=""><em>None</em></MenuItem>);
            }
            list.forEach( (value, index) => {
                if (typeof value === 'object') {
                    selectionList.push(<MenuItem key={index+1} value={Object.keys(value)[0]}>{value[Object.keys(value)[0]]}</MenuItem>);
                } else {
                    selectionList.push(<MenuItem key={index+1} value={value}>{value}</MenuItem>);
                }
            });
        }
        return selectionList;
    }

    handleOriginChange = (name, originId) => (updateObj) => {
        let newOrigins = Object.assign(Object.create(Object.getPrototypeOf(this.state.origins)),this.state.origins);
        if (name === 'type') {
            newOrigins[originId].type = updateObj.target.value;
            // TODO: If the selected TYPE is CRF, check if there is CRF document attached to the origin
            // If not, create it with PhysicalRef type
            this.setState({origins: newOrigins});
        }
        if (name === 'description') {
            newOrigins[originId].setDescription(updateObj.target.value);
            this.setState({origins: newOrigins});
        }
        if (name === 'document') {
            newOrigins[originId] = updateObj;
            this.setState({origins: newOrigins});
        }
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
        let originTypeList;
        if (this.props.model === 'ADaM') {
            originTypeList = ['Derived', 'Assigned', 'Predecessor'];
        } else {
            originTypeList = ['CRF', 'Derived', 'Assigned', 'Protocol', 'eDT', 'Predecessor'];
        }
        // Get the list of available documents
        let leafs = this.props.leafs;
        let documentList = [];
        Object.keys(leafs).forEach( (leafId) => {
            documentList.push({[leafId]: leafs[leafId].title});
        });

        let origin, originDescription;
        let originType;
        if (this.props.defineVersion === '2.0'){
            origin = this.state.origins[0];
            originType = this.state.origins[0] !== undefined ? this.state.origins[0].type : '';
            originDescription = origin.getDescription() || '';
        }


        const { classes } = this.props;

        return (
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <Typography variant="subheading">
                        Origin
                    </Typography>
                </Grid>
                <Grid container spacing={8}>
                    <Grid item>
                        <TextField
                            label='Origin Type'
                            select
                            onKeyDown={this.props.onKeyDown}
                            value={originType}
                            onChange={this.handleOriginChange('type',0)}
                            className={classes.textField}
                        >
                            {this.getSelectionList(originTypeList)}
                        </TextField>
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Origin Description'
                            onKeyDown={this.props.onKeyDown}
                            value={originDescription}
                            onChange={this.handleOriginChange('description',0)}
                            className={classes.textField}
                        >
                            {this.getSelectionList(originTypeList)}
                        </TextField>
                    </Grid>
                    <DocumentEditor {...this.props} parentObj={origin} handleChange={this.handleOriginChange('document',0)} />
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
