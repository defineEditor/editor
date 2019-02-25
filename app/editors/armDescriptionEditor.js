/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';
import DescriptionView from 'editors/view/descriptionView.js';
import SaveCancel from 'editors/saveCancel.js';
import { addDocument, getDescription, setDescription } from 'utils/defineStructureUtils.js';
import {
    updateResultDisplay,
} from 'actions/index.js';

const mapDispatchToProps = dispatch => {
    return {
        updateResultDisplay: (updateObj) => dispatch(updateResultDisplay(updateObj)),
    };
};

class ConnectedArmDescriptionEditor extends React.Component {
    constructor (props) {
        super(props);
        this.rootRef = React.createRef();
        let description = clone(this.props.description);
        let descriptionText = getDescription(description);
        this.state = {
            docObj: { documents: description.documents },
            descriptionText,
        };
    }

    handleChange = (name) => (updateObj) => {
        if (name === 'textUpdate') {
            this.setState({ descriptionText: updateObj.target.value });
        } else if (name === 'addDocument') {
            let docObj = clone(this.state.docObj);
            addDocument(docObj);
            this.setState({ docObj });
        } else if (name === 'updateDocument') {
            this.setState({ docObj: updateObj });
        }
    }

    save = () => {
        let newDescriptions = { descriptions: this.props.description.descriptions.slice() };
        setDescription(newDescriptions, this.state.descriptionText, this.props.lang);
        let updatedDescription = { descriptions: newDescriptions.descriptions, documents: this.state.docObj.documents };
        if (!deepEqual(this.props.description, updatedDescription)) {
            let updateObj = { oid: this.props.row.oid, updates: updatedDescription };
            this.props.updateResultDisplay(updateObj);
        }
        this.props.onUpdate();
    }

    cancel = () => {
        this.props.onUpdate();
    }

    onKeyDown = (event) => {
        if (this.props.stateless !== true) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                this.cancel();
            } else if (event.ctrlKey && (event.keyCode === 83)) {
                this.rootRef.current.focus();
                this.setState({}, this.save);
            }
        }
    }

    render () {
        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                ref={this.rootRef}
                style={{ outline: 'none' }}
            >
                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <DescriptionView
                            descriptionText={this.state.descriptionText}
                            docObj={this.state.docObj}
                            onChange={this.handleChange}
                            title='Description'
                        />
                    </Grid>
                    <Grid item xs={12} >
                        <SaveCancel save={this.save} cancel={this.cancel}/>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedArmDescriptionEditor.propTypes = {
    description: PropTypes.object.isRequired,
    row: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
};

const ArmDescriptionEditor = connect(undefined, mapDispatchToProps)(ConnectedArmDescriptionEditor);
export default ArmDescriptionEditor;
