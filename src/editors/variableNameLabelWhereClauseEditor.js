import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import VariableNameLabelEditor from 'editors/variableNameLabelEditor.js';
import VariableWhereClauseEditor from 'editors/variableWhereClauseEditor.js';
import SaveCancel from 'editors/saveCancel.js';
import CommentEditor from 'editors/commentEditor.js';
import {WhereClause, RangeCheck} from 'elements.js';

const styles = theme => ({
    gridItem: {
    },
});

let wcRegex = {
    variable                : new RegExp('(?:\\w+\\.)?\\w+'),
    variableParse           : new RegExp('((?:\\w+\\.)?\\w+)'),
    datasetVariableParse    : new RegExp('(\\w+)\\.(\\w+)'),
    item                    : new RegExp('(?:["][^"]+["]|[\'][^\']+[\']|[^\'",][^,\\s]*)'),
    itemParse               : new RegExp('(["][^"]+["]|[\'][^\']+[\']|[^\',"][^,\\s]*)'),
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


class VariableNameLabelWhereClauseEditor extends React.Component {
    constructor (props) {
        super(props);
        const autoLabel = this.props.defaultValue.label === undefined && this.props.blueprint !== undefined ? true : false;
        const whereClause = this.props.defaultValue.whereClause;
        let whereClauseManual, whereClauseComment, whereClauseInteractive;
        if (whereClause !== undefined) {
            whereClauseComment = whereClause.comment;
            // Text line for manual editing
            whereClauseManual = whereClause.toString(this.props.mdv.itemDefs);
            // Split into parts for visual editing
            whereClauseInteractive = [];
            whereClause.rangeChecks.forEach( rawRangeCheck => {
                let rangeCheck = {};
                rangeCheck.itemName = this.props.mdv.itemDefs[rawRangeCheck.itemOid].name;
                rangeCheck.itemOid = rawRangeCheck.itemOid;
                if (rawRangeCheck.itemGroupOid !== undefined) {
                    rangeCheck.itemGroupName = this.props.mdv.itemGroups[rawRangeCheck.itemGroupOid].name;
                    rangeCheck.itemGroupOid = rawRangeCheck.itemGroupOid;
                } else {
                    rangeCheck.itemGroupName = this.props.dataset.name;
                    rangeCheck.itemGroupOid = this.props.dataset.oid;
                }
                rangeCheck.comparator = rawRangeCheck.comparator;
                rangeCheck.checkValues = rawRangeCheck.checkValues;
                whereClauseInteractive.push(rangeCheck);
            });
        } else {
            whereClauseManual = undefined;
            whereClauseComment =  undefined;
            whereClauseInteractive = [];
        }

        this.state = {
            name                   : this.props.defaultValue.name || '',
            label                  : this.props.defaultValue.label || '',
            autoLabel              : autoLabel,
            whereClause            : this.props.defaultValue.whereClause,
            whereClauseManual      : whereClauseManual,
            whereClauseComment     : whereClauseComment,
            whereClauseInteractive : whereClauseInteractive,
            wcEditingMode          : 'interactive',
        };
    }

    handleChange = name => updateObj => {
        if (name === 'whereClauseManual') {
            this.setWhereClauseManual();
        } else if (name === 'wcEditingMode') {
            if (updateObj.target.checked === true) {
                this.setState({ [name]: 'interactive' });
            } else {
                this.setState({ [name]: 'manual' });
            }
        } else if (name === 'whereClauseComment') {
            this.setState({ [name]: updateObj });
        } else if (name === 'whereClauseInteractive') {
            //this.setState({ [name]: updateObj });
        } else {
            this.setState({ [name]: updateObj.target.value });
        }
    }

    setAutoLabel = () => {
        let bpItemDefs = this.props.blueprint.itemDefs;
        Object.keys(bpItemDefs).forEach( itemDefOid => {
            if (bpItemDefs[itemDefOid].name === this.state.name) {
                this.setState({ label: bpItemDefs[itemDefOid].getDescription() });
                return;
            }
        });
    }

    validateWhereClause = (type) => {
        if (type === 'manual') {
            return wcRegex.whereClause.test(this.state.whereClauseManual);
        }
    }

    getOidByName (source, name) {
        let result;
        Object.keys(source).some( oid => {
            if (source[oid].name.toLowerCase() === name.toLowerCase()) {
                result = oid;
                return true;
            }
        });
        return result;
    }

    setWhereClauseManual = () => {
        // Do nothing if the where clause in invalid;
        if (!this.validateWhereClause('manual')) {
            return;
        }
        // Extract raw range checks
        let rawWhereClause = wcRegex.whereClause.exec(this.state.whereClauseManual);
        // Remove all undefined range checks (coming from (AND condition) part)
        rawWhereClause = rawWhereClause.filter(element => element !== undefined);
        // If there is more than one range check, extract them one by one;
        let rawRangeChecks = [];
        if (rawWhereClause.length >= 3) {
            let rawRangeCheck;
            let rawRanges = this.state.whereClauseManual;
            let nextRangeCheckRegex = new RegExp(wcRegex.rangeCheck.source + '(?:AND)?(.*)$','i');
            while ((rawRangeCheck = wcRegex.rangeCheckExtract.exec(rawRanges)) !== null) {
                rawRangeChecks.push(rawRangeCheck[1]);
                rawRanges = rawRanges.replace(nextRangeCheckRegex, '$1');
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
            if (/\./.test(rawRangeCheck)) {
                // If variable part contains dataset name;
                itemGroupOid = this.getOidByName(this.props.mdv.itemGroups,rangeCheckElements[0].replace(wcRegex.datasetVariableParse,'$1'));
                itemOid = this.getOidByName(this.props.mdv.itemDefs,rangeCheckElements[0].replace(wcRegex.datasetVariableParse,'$2'));
            } else {
                // If variable part does not contain dataset name, use the current dataset;
                itemGroupOid = this.props.dataset.oid;
                itemOid = this.getOidByName(this.props.mdv.itemDefs,rangeCheckElements[0]);
            }
            let comparator = rangeCheckElements[1].toUpperCase();
            // Parse Check values
            let checkValues = [];
            if (['IN','NOTIN'].indexOf(comparator) >= 0) {
                let rawCheckValues = rangeCheckElements[2];
                // Extract values one by one when comparator is IN or NOT IN
                let value;
                let nextValueRegex = new RegExp(wcRegex.item.source + ',?(.*$)');
                while ((value = wcRegex.itemParse.exec(rawCheckValues)) !== null) {
                    checkValues.push(value[1]);
                    rawCheckValues = rawCheckValues.replace(nextValueRegex, '$1');
                }
            } else {
                // Only 1 element is possible for other operators;
                checkValues.push(rangeCheckElements[2]);
            }

            // Remove surrounding quotes
            checkValues = checkValues.map( checkValue => {
                if ( /^(["']).*\1$/.test(checkValues) ) {
                    return checkValue.replace(/^(.)(.*)\1$/,'$2');
                } else {
                    return checkValue;
                }
            });
            rangeChecks.push(new RangeCheck({
                comparator   : comparator,
                itemOid      : itemOid,
                itemGroupOid : itemGroupOid,
                checkValues  : checkValues
            }));
        });
        // Generate new or use previous OID;
        let oid;
        if (this.state.whereClause === undefined) {
            oid = 'WC.' + this.props.dataset.name + '.' + this.props.defaultValue.itemRef.itemDef.parent.name + '.' + this.state.name;
        } else {
            oid = this.state.whereClause.oid;
        }
        // Create and set the new WhereClause
        this.setState({
            whereClause: new WhereClause({
                oid         : oid,
                comment     : this.state.whereClauseComment,
                rangeChecks : rangeChecks,
            })
        });
    }

    save = () => {
        this.props.onUpdate(this.state);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render() {
        const vlmLevel = this.props.row.vlmLevel;
        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <VariableNameLabelEditor
                        handleChange={this.handleChange}
                        onNameBlur={this.setAutoLabel}
                        label={this.state.label}
                        name={this.state.name}
                        blueprint={this.props.blueprint}
                        autoLabel={this.state.autoLabel}
                    />
                </Grid>
                {vlmLevel > 0 &&
                        <React.Fragment>
                            <Grid item xs={12}>
                                <VariableWhereClauseEditor
                                    handleChange={this.handleChange}
                                    onNameBlur={this.setWhereClauseManual}
                                    whereClause={this.state.whereClause}
                                    validationCheck={this.validateWhereClause}
                                    whereClauseManual={this.state.whereClauseManual}
                                    whereClauseInteractive={this.state.whereClauseInteractive}
                                    whereClauseComment={this.state.whereClauseComment}
                                    wcEditingMode={this.state.wcEditingMode}
                                    mdv={this.props.mdv}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CommentEditor
                                    defaultValue={this.state.whereClauseComment}
                                    onUpdate={this.handleChange('whereClauseComment')}
                                    stateless={true}
                                    leafs={this.props.mdv.leafs}
                                    annotatedCrf={this.props.mdv.annotatedCrf}
                                    supplementalDoc={this.props.mdv.supplementalDoc}
                                />
                            </Grid>
                        </React.Fragment>
                }
                <Grid item xs={12}>
                    <SaveCancel icon save={this.save} cancel={this.cancel}/>
                </Grid>
            </Grid>
        );
    }
}

VariableNameLabelWhereClauseEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func.isRequired,
    blueprint    : PropTypes.object,
    mdv          : PropTypes.object,
    dataset      : PropTypes.object,
};

export default withStyles(styles)(VariableNameLabelWhereClauseEditor);

