import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import DatasetDomainEditorView from 'editors/view/datasetDomainEditorView.js';
import SaveCancel from 'editors/saveCancel.js';
import {
    updateItemGroup,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateItemGroup: (oid, updateObj) => dispatch(updateItemGroup(oid, updateObj)),
    };
};

const mapStateToProps = state => {
    return {
    };
};

class ConnectedDatasetDomainEditor extends React.Component {
    constructor (props) {
        super(props);
        let domain;
        if (props.domainAttrs.domain !== undefined) {
            domain = props.domainAttrs.domain;
        } else {
            domain = '';
        }

        let parentDomainDescription;
        if (props.domainAttrs.alias !== undefined && props.domainAttrs.alias.context === 'DomainDescription') {
            parentDomainDescription = props.domainAttrs.alias.name;
        } else {
            parentDomainDescription = '';
        }

        this.state = {
            domain                  : domain,
            parentDomainDescription : parentDomainDescription,
        };
    }

    handleChange = (name) => (event) => {
        this.setState({[name]: event.target.value});
    }

    save = () => {
        let originalParentDomainDescription;
        if (this.props.domainAttrs.alias !== undefined && this.props.domainAttrs.alias.context === 'DomainDescription') {
            originalParentDomainDescription = this.props.domainAttrs.alias.name;
        } else {
            originalParentDomainDescription = '';
        }
        let updateObj = {};
        if (originalParentDomainDescription !== this.state.parentDomainDescription) {
            let alias;
            if (this.state.parentDomainDescription !== '') {
                alias = {
                    context : 'DomainDescription',
                    name    : this.state.parentDomainDescription,
                };
            }
            updateObj.alias = alias;
        }
        if (this.props.domainAttrs.domain !== this.state.domain) {
            let domain;
            if (this.state.domain !== '') {
                domain = this.state.domain;
            }
            updateObj.domain = domain;
        }
        if (Object.keys(updateObj).length > 0) {
            this.props.updateItemGroup(this.props.itemGroupOid, updateObj);
        }
        this.props.onFinished();
    }

    cancel = () => {
        this.props.onFinished();
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render() {
        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                style={{outline: 'none'}}
            >
                <Grid container spacing={8} alignItems='center'>
                    <Grid item xs={12}>
                        <DatasetDomainEditorView
                            domain={this.state.domain}
                            parentDomainDescription={this.state.parentDomainDescription}
                            onChange={this.handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <SaveCancel mini icon save={this.save} cancel={this.cancel} />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedDatasetDomainEditor.propTypes = {
    domainAttrs  : PropTypes.object.isRequired,
    itemGroupOid : PropTypes.string.isRequired,
    onFinished   : PropTypes.func.isRequired,
};

const DatasetDomainEditor = connect(mapStateToProps, mapDispatchToProps)(ConnectedDatasetDomainEditor);
export default DatasetDomainEditor;

