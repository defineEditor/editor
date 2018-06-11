import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import CommentEditor from 'editors/commentEditor.js';
import MethodEditor from 'editors/methodEditor.js';
import OriginEditor from 'editors/originEditor.js';
import SaveCancel from 'editors/saveCancel.js';

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
    root: {
        outline: 'none',
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        stdConstants  : state.stdConstants,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        model         : state.odm.study.metaDataVersion.model,
        leafs         : state.odm.study.metaDataVersion.leafs,
    };
};

class ConnectedDescriptionEditor extends React.Component {
    constructor (props) {
        super(props);
        this.rootRef = React.createRef();
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
        this.props.onUpdate(this.state);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
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

    componentDidMount() {
        this.rootRef.current.focus();
    }

    render () {
        const { classes } = this.props;
        let childProps = Object.assign({}, this.props);
        const originType = this.state.origins.length > 0 && this.state.origins[0].type;
        delete childProps.classes;

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                ref={this.rootRef}
                className={classes.root}
            >
                <Grid container spacing={8} alignItems='center'>
                    <Grid item xs={12} className={classes.gridItem}>
                        <OriginEditor {...childProps} defaultValue={this.state.origins} onUpdate={this.handleChange('origins')}/>
                    </Grid>
                    <Grid item xs={12} className={classes.gridItem}>
                        <Divider/>
                    </Grid>
                    {(['Derived','Assigned'].includes(originType) || this.state.method !== undefined) &&
                            <React.Fragment>
                                <Grid item xs={12} className={classes.gridItem}>
                                    <MethodEditor {...childProps} defaultValue={this.state.method} onUpdate={this.handleChange('method')} stateless={true}/>
                                </Grid>
                                <Grid item xs={12} className={classes.gridItem}>
                                    <Divider/>
                                </Grid>
                            </React.Fragment>
                    }
                    <Grid item xs={12} className={classes.gridItem}>
                        <CommentEditor {...childProps} comment={this.state.comment} onUpdate={this.handleChange('comment')} stateless={true}/>
                    </Grid>
                    <Grid item xs={12} className={classes.gridItem}>
                        <Divider/>
                    </Grid>
                    <Grid item xs={12} className={classes.gridItem}>
                        <SaveCancel save={this.save} cancel={this.cancel} />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedDescriptionEditor.propTypes = {
    defaultValue : PropTypes.object,
    leafs        : PropTypes.object.isRequired,
    model        : PropTypes.string.isRequired,
};

const DescriptionEditor = connect(mapStateToProps)(ConnectedDescriptionEditor);
export default withStyles(styles)(DescriptionEditor);
