/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import VariableWhereClauseEditor from 'editors/variableWhereClauseEditor.js';
import SaveCancel from 'editors/saveCancel.js';
import CommentEditor from 'editors/commentEditor.js';
import getOidByName from 'utils/getOidByName.js';
import { WhereClause, RangeCheck, TranslatedText } from 'elements.js';

const styles = theme => ({
    root: {
        outline: 'none',
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        mdv                         : state.present.odm.study.metaDataVersion,
        blueprint                   : state.present.odm.study.metaDataVersion,
        lang                        : state.present.odm.study.metaDataVersion.lang,
        getNameLabelFromWhereClause : state.present.settings.editor.getNameLabelFromWhereClause,
    };
};

let wcRegex = {
    variable                : new RegExp('(?:\\w+\\.)?\\w+'),
    variableParse           : new RegExp('((?:\\w+\\.)?\\w+)'),
    datasetVariableParse    : new RegExp('(\\w+)\\.(\\w+)'),
    item                    : new RegExp('\\s*(?:["][^"]+["]|[\'][^\']+[\']|[^\'",][^,\\s]*)\\s*'),
    itemParse               : new RegExp('\\s*(["][^"]+["]|[\'][^\']+[\']|[^\',"][^,\\s]*)\\s*'),
    comparatorSingle        : new RegExp('(?:eq|ne|lt|gt|ge)'),
    comparatorSingleParse   : new RegExp('(eq|ne|lt|gt|ge)'),
    comparatorMultiple      : new RegExp('(?:in|notin)'),
    comparatorMultipleParse : new RegExp('(in|notin)'),
};


wcRegex.rangeCheck = new RegExp(
    wcRegex.variable.source + '\\s+(?:'
    + wcRegex.comparatorSingle.source + '\\s+' + wcRegex.item.source
    + '|' + wcRegex.comparatorMultiple.source + '\\s+\\('
    + wcRegex.item.source + '(?:,' + wcRegex.item.source + ')*\\))'
    ,'i'
);

wcRegex.rangeCheckExtract = new RegExp('(' + wcRegex.rangeCheck.source + ')' ,'i');

wcRegex.rangeCheckParse = new RegExp(
    wcRegex.variableParse.source + '\\s+(?:'
    + wcRegex.comparatorSingleParse.source + '\\s+' + wcRegex.itemParse.source
    + '|' + wcRegex.comparatorMultipleParse.source + '\\s+\\(('
    + wcRegex.item.source + '(?:,' + wcRegex.item.source + ')*)\\))'
    ,'i'
);

wcRegex.whereClause = new RegExp(
    '^(' + wcRegex.rangeCheck.source + ')(?:\\s+and\\s+(' + wcRegex.rangeCheck.source + '))*$'
    , 'i'
);


class ConnectedVariableNameLabelWhereClauseEditor extends React.Component {
    constructor (props) {
        super(props);
        let autoLabel;
        if ( (this.props.defaultValue.descriptions.length === 0 || this.props.defaultValue.descriptions[0].value)
            && this.props.blueprint !== undefined
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
            name          : this.props.defaultValue.name || '',
            descriptions  : this.props.defaultValue.descriptions,
            whereClause   : this.props.defaultValue.whereClause,
            wcComment     : wcComment,
            autoLabel     : autoLabel,
            wcEditingMode : 'interactive',
            dataset       : this.props.mdv.itemGroups[this.props.row.datasetOid]
        };
    }

    handleChange = name => updateObj => {
        if (name === 'whereClauseManual') {
            this.setWhereClauseManual(updateObj.target.value);
        } else if (name === 'wcEditingMode') {
            if (updateObj.target.checked === true) {
                this.setState({ [name]: 'interactive' });
            } else {
                this.setState({ [name]: 'manual' });
            }
        } else if (name === 'whereClauseInteractive') {
            let rangeChecks = [];
            updateObj.forEach( rawRangeCheck => {
                rangeChecks.push({ ...new RangeCheck(rawRangeCheck) });
            });
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
                    Object.keys(codeListItems).some( codeListItemOid => {
                        if (codeListItems[codeListItemOid].codedValue === rangeChecks[0].checkValues[0]) {
                            value = codeListItems[codeListItemOid].decodes[0].value;
                            return true;
                        }
                    });
                    if (value !== undefined) {
                        let lang = this.props.lang;
                        additionalAttrs.descriptions = [{ ...new TranslatedText({lang, value}) }];
                    }
                }
            }
            this.setState({
                whereClause: { ...new WhereClause({
                    ...this.state.whereClause,
                    rangeChecks: rangeChecks,
                }) },
                ...additionalAttrs,
            });
        } else if (name === 'comment') {
            if (updateObj === undefined) {
                this.setState({
                    whereClause:{ ...new WhereClause({
                        ...this.state.whereClause,
                        commentOid: undefined,
                    }) },
                    wcComment: updateObj,
                });
            } else {
                this.setState({
                    whereClause:{ ...new WhereClause({
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
            let descriptions = [{ ...new TranslatedText({lang, value}) }];
            this.setState({ descriptions });
        } else if (name === 'name') {
            // Upcase name value
            this.setState({ [name]: updateObj.target.value.toUpperCase() });
        } else {
            this.setState({ [name]: updateObj.target.value });
        }
    }

    setAutoLabel = () => {
        let bpItemDefs = this.props.blueprint.itemDefs;
        Object.keys(bpItemDefs).forEach( itemDefOid => {
            if (bpItemDefs[itemDefOid].name === this.state.name) {
                this.setState({ descriptions: bpItemDefs[itemDefOid].descriptions });
                return;
            }
        });
    }

    validateWhereClause = (input) => {
        // Trim leading and trailing spaces;
        let whereClauseLine = input.trim();
        // Quick Check
        if (wcRegex.whereClause.test(whereClauseLine) === false) {
            return false;
        }
        let result = [];
        // Detailed check: check that proper variables are specified
        let rawWhereClause = wcRegex.whereClause.exec(whereClauseLine);
        // Remove all undefined range checks (coming from (AND condition) part)
        rawWhereClause = rawWhereClause.filter(element => element !== undefined);
        // If there is more than one range check, extract them one by one;
        let rawRangeChecks = [];
        if (rawWhereClause.length >= 3) {
            let rawRanges = whereClauseLine;
            let rawRangeCheck = wcRegex.rangeCheckExtract.exec(rawRanges);
            let nextRangeCheckRegex = new RegExp(wcRegex.rangeCheck.source + '(?:AND)?(.*)$','i');
            while (rawRangeCheck !== null) {
                rawRangeChecks.push(rawRangeCheck[1]);
                rawRanges = rawRanges.replace(nextRangeCheckRegex, '$1');
                rawRangeCheck = wcRegex.rangeCheckExtract.exec(rawRanges);
            }
        } else {
            // Only 1 range check is provided;
            rawRangeChecks.push(rawWhereClause[1]);
        }
        // Extract variable names
        rawRangeChecks.forEach( (rawRangeCheck, index) => {
            // Default to failed
            result[index] = false;
            let rangeCheckElements = wcRegex.rangeCheckParse.exec(rawRangeCheck).slice(1);
            // Remove all undefined elements (come from the (in|notin) vs (eq,ne,...) fork)
            rangeCheckElements = rangeCheckElements.filter(element => element !== undefined);
            let itemOid, itemGroupOid;
            if (/\./.test(rangeCheckElements[0])) {
                // If variable part contains dataset name;
                itemGroupOid = getOidByName(this.props.mdv, 'itemGroups',rangeCheckElements[0].replace(wcRegex.datasetVariableParse,'$1'));
                if (itemGroupOid !== undefined) {
                    itemOid = getOidByName(this.props.mdv, 'ItemRefs', rangeCheckElements[0].replace(wcRegex.datasetVariableParse,'$2'), itemGroupOid);
                }
            } else {
                // If variable part does not contain dataset name, use the current dataset;
                itemGroupOid = this.state.dataset.oid;
                if (itemGroupOid !== undefined) {
                    itemOid = getOidByName(this.props.mdv, 'ItemRefs', rangeCheckElements[0], itemGroupOid);
                }
            }
            if (itemOid !== undefined && itemGroupOid !== undefined) {
                result[index] = true;
            }
        });
        // Return true only if all results are true;
        return result.reduce((acc, value) => acc && value,true);
    }

    setWhereClauseManual = (whereClauseLine) => {
        // Do nothing if the where clause in invalid;
        if (!this.validateWhereClause(whereClauseLine)) {
            return;
        }
        // Remove all new line characters
        whereClauseLine = whereClauseLine.replace(/[\r\n\t]/g,' ');
        // Extract raw range checks
        let rawWhereClause = wcRegex.whereClause.exec(whereClauseLine);
        // Remove all undefined range checks (coming from (AND condition) part)
        rawWhereClause = rawWhereClause.filter(element => element !== undefined);
        // If there is more than one range check, extract them one by one;
        let rawRangeChecks = [];
        if (rawWhereClause.length >= 3) {
            let rawRanges = whereClauseLine;
            let rawRangeCheck = wcRegex.rangeCheckExtract.exec(rawRanges);
            let nextRangeCheckRegex = new RegExp(wcRegex.rangeCheck.source + '(?:AND)?(.*)$','i');
            while (rawRangeCheck !== null) {
                rawRangeChecks.push(rawRangeCheck[1]);
                rawRanges = rawRanges.replace(nextRangeCheckRegex, '$1');
                rawRangeCheck = wcRegex.rangeCheckExtract.exec(rawRanges);
            }
        } else {
            // Only 1 range check is provided;
            rawRangeChecks.push(rawWhereClause[1]);
        }
        // Parse each range check;
        let rangeChecks = [];
        rawRangeChecks.forEach( rawRangeCheck => {
            let rangeCheckElements = wcRegex.rangeCheckParse.exec(rawRangeCheck).slice(1);
            // Remove all undefined elements (come from the (in|notin) vs (eq,ne,...) fork)
            rangeCheckElements = rangeCheckElements.filter(element => element !== undefined);
            let itemOid, itemGroupOid;
            if (/\./.test(rangeCheckElements[0])) {
                // If variable part contains dataset name;
                itemGroupOid = getOidByName(this.props.mdv, 'itemGroups',rangeCheckElements[0].replace(wcRegex.datasetVariableParse,'$1'));
                if (itemGroupOid !== undefined) {
                    itemOid = getOidByName(this.props.mdv, 'ItemRefs', rangeCheckElements[0].replace(wcRegex.datasetVariableParse,'$2'), itemGroupOid);
                }
            } else {
                // If variable part does not contain dataset name, use the current dataset;
                itemGroupOid = this.state.dataset.oid;
                if (itemGroupOid !== undefined) {
                    itemOid = getOidByName(this.props.mdv, 'ItemRefs', rangeCheckElements[0], itemGroupOid);
                }
            }
            let comparator = rangeCheckElements[1].toUpperCase();
            // Parse Check values
            let checkValues = [];
            if (['IN','NOTIN'].indexOf(comparator) >= 0) {
                let rawCheckValues = rangeCheckElements[2].trim();
                // Extract values one by one when comparator is IN or NOT IN
                let value = wcRegex.itemParse.exec(rawCheckValues);
                let nextValueRegex = new RegExp(wcRegex.item.source + ',?(.*$)');
                while (value !== null) {
                    checkValues.push(value[1]);
                    rawCheckValues = rawCheckValues.replace(nextValueRegex, '$1').trim();
                    value = wcRegex.itemParse.exec(rawCheckValues);
                }
            } else {
                // Only 1 element is possible for other operators;
                checkValues.push(rangeCheckElements[2].trim());
            }

            // Remove surrounding quotes
            checkValues = checkValues.map( checkValue => {
                if ( /^(["']).*\1$/.test(checkValues) ) {
                    return checkValue.replace(/^(.)(.*)\1$/,'$2');
                } else {
                    return checkValue;
                }
            });
            rangeChecks.push({ ...new RangeCheck({
                comparator   : comparator,
                itemOid      : itemOid,
                itemGroupOid : itemGroupOid,
                checkValues  : checkValues
            }) });
        });
        // Create and set the new WhereClause
        this.setState({
            whereClause: { ...new WhereClause({
                ...this.state.whereClause,
                rangeChecks: rangeChecks,
            }) }
        });
    }

    save = () => {
        this.props.onUpdate({
            name         : this.state.name,
            descriptions : this.state.descriptions,
            whereClause  : this.state.whereClause,
            wcComment    : this.state.wcComment,
        });
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

    render() {
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
                                    <VariableWhereClauseEditor
                                        handleChange={this.handleChange}
                                        whereClause={this.state.whereClause}
                                        validationCheck={this.validateWhereClause}
                                        wcEditingMode={this.state.wcEditingMode}
                                        dataset={this.state.dataset}
                                        mdv={this.props.mdv}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <CommentEditor
                                        comment={this.state.wcComment}
                                        onUpdate={this.handleChange('comment')}
                                        stateless={true}
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
    classes                     : PropTypes.object.isRequired,
    defaultValue                : PropTypes.object.isRequired,
    onUpdate                    : PropTypes.func.isRequired,
    blueprint                   : PropTypes.object,
    getNameLabelFromWhereClause : PropTypes.bool,
    mdv                         : PropTypes.object,
    row                         : PropTypes.object.isRequired,
    lang                        : PropTypes.string.isRequired,
};

const VariableNameLabelWhereClauseEditor = connect(mapStateToProps)(ConnectedVariableNameLabelWhereClauseEditor);
export default withStyles(styles)(VariableNameLabelWhereClauseEditor);
