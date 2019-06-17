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
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import VariableNameLabelEditor from 'editors/variableNameLabelEditor.js';
import WhereClauseEditor from 'editors/whereClauseEditor.js';
import SaveCancel from 'editors/saveCancel.js';
import CommentEditor from 'editors/commentEditor.js';
import { WhereClause, TranslatedText } from 'core/defineStructure.js';

const styles = theme => ({
    root: {
        outline: 'none',
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        mdv: state.present.odm.study.metaDataVersion,
        blueprint: state.present.odm.study.metaDataVersion,
        lang: state.present.odm.study.metaDataVersion.lang,
        getNameLabelFromWhereClause: state.present.settings.editor.getNameLabelFromWhereClause,
    };
};

class ConnectedVariableNameLabelWhereClauseEditor extends React.Component {
    constructor (props) {
        super(props);
        let autoLabel;
        if ((this.props.defaultValue.descriptions.length === 0 || this.props.defaultValue.descriptions[0].value) &&
            this.props.blueprint !== undefined
        ) {
            autoLabel = true;
        } else {
            autoLabel = false;
        }

        let wcComment;
        if (this.props.defaultValue.whereClause !== undefined && this.props.defaultValue.whereClause.commentOid !== undefined) {
            wcComment = this.props.mdv.comments[this.props.defaultValue.whereClause.commentOid];
        }

        this.rootRef = React.createRef();

        this.state = {
            name: this.props.defaultValue.name || '',
            descriptions: this.props.defaultValue.descriptions,
            whereClause: this.props.defaultValue.whereClause,
            wcComment: wcComment,
            autoLabel: autoLabel,
            wcEditingMode: 'interactive',
            dataset: this.props.mdv.itemGroups[this.props.row.datasetOid]
        };
    }

    handleChange = name => updateObj => {
        if (name === 'whereClause') {
            let whereClause = updateObj;
            let rangeChecks = updateObj ? updateObj.rangeChecks : [];
            // Populate current name and label if they are blank and EQ range is used
            let additionalAttrs = {};
            if (this.props.getNameLabelFromWhereClause && rangeChecks.length === 1 && rangeChecks[0].comparator === 'EQ') {
                additionalAttrs.name = rangeChecks[0].checkValues[0];
                // Check if there is a codelist with decodes
                let mdv = this.props.mdv;
                let codeListOid = mdv.itemDefs[rangeChecks[0].itemOid].codeListOid;
                if (codeListOid !== undefined && mdv.codeLists[codeListOid].codeListType === 'decoded') {
                    let value;
                    let codeListItems = mdv.codeLists[codeListOid].codeListItems;
                    Object.keys(codeListItems).some(codeListItemOid => {
                        if (codeListItems[codeListItemOid].codedValue === rangeChecks[0].checkValues[0]) {
                            value = codeListItems[codeListItemOid].decodes[0].value;
                            return true;
                        }
                    });
                    if (value !== undefined) {
                        let lang = this.props.lang;
                        additionalAttrs.descriptions = [{ ...new TranslatedText({ lang, value }) }];
                    }
                }
            }
            this.setState({
                whereClause,
                ...additionalAttrs,
            });
        } else if (name === 'wcEditingMode') {
            if (updateObj.target.checked === true) {
                this.setState({ [name]: 'interactive' });
            } else {
                this.setState({ [name]: 'manual' });
            }
        } else if (name === 'comment') {
            if (updateObj === undefined) {
                this.setState({
                    whereClause: { ...new WhereClause({
                        ...this.state.whereClause,
                        commentOid: undefined,
                    }) },
                    wcComment: updateObj,
                });
            } else {
                this.setState({
                    whereClause: { ...new WhereClause({
                        ...this.state.whereClause,
                        commentOid: updateObj.oid,
                    }) },
                    wcComment: updateObj,
                });
            }
        } else if (name === 'autoLabel') {
            this.setState({ [name]: !this.state.autoLabel });
        } else if (name === 'label') {
            // Create a new description;
            let lang = this.props.lang;
            let value = updateObj.target.value;
            let descriptions = [{ ...new TranslatedText({ lang, value }) }];
            this.setState({ descriptions });
        } else if (name === 'name') {
            // Upcase name value
            this.setState({ [name]: updateObj.target.value });
        } else {
            this.setState({ [name]: updateObj.target.value });
        }
    }

    setAutoLabel = () => {
        let bpItemDefs = this.props.blueprint.itemDefs;
        Object.keys(bpItemDefs).forEach(itemDefOid => {
            if (bpItemDefs[itemDefOid].name === this.state.name) {
                this.setState({ descriptions: bpItemDefs[itemDefOid].descriptions });
            }
        });
    }

    save = () => {
        this.props.onUpdate({
            name: this.state.name,
            descriptions: this.state.descriptions,
            whereClause: this.state.whereClause,
            wcComment: this.state.wcComment,
        });
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    onKeyDown = (event) => {
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

    render () {
        const vlmLevel = this.props.row.vlmLevel;
        let label;
        if (this.state.descriptions.length > 0) {
            label = this.state.descriptions[0].value;
        } else {
            label = '';
        }

        return (
            <div onKeyDown={this.onKeyDown} tabIndex='0' ref={this.rootRef} className={this.props.classes.root}>
                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <VariableNameLabelEditor
                            handleChange={this.handleChange}
                            label={label}
                            name={this.state.name}
                            blueprint={this.props.blueprint}
                            autoLabel={this.state.autoLabel}
                            vlm={true}
                        />
                    </Grid>
                    {vlmLevel > 0 &&
                            <React.Fragment>
                                <Grid item xs={12}>
                                    <WhereClauseEditor
                                        itemGroup={this.state.dataset}
                                        label='Where Clause'
                                        whereClause={this.state.whereClause}
                                        onChange={this.handleChange('whereClause')}
                                        fixedDataset={false}
                                        isRequired={true}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <CommentEditor
                                        comment={this.state.wcComment}
                                        onUpdate={this.handleChange('comment')}
                                        leafs={this.props.mdv.leafs}
                                    />
                                </Grid>
                            </React.Fragment>
                    }
                    <Grid item xs={12}>
                        <SaveCancel save={this.save} cancel={this.cancel}/>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedVariableNameLabelWhereClauseEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    defaultValue: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    blueprint: PropTypes.object,
    getNameLabelFromWhereClause: PropTypes.bool,
    mdv: PropTypes.object,
    row: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
};

const VariableNameLabelWhereClauseEditor = connect(mapStateToProps)(ConnectedVariableNameLabelWhereClauseEditor);
export default withStyles(styles)(VariableNameLabelWhereClauseEditor);
