import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import VariableNameLabelEditor from 'editors/variableNameLabelEditor.js';
import VariableWhereClauseEditor from 'editors/variableWhereClauseEditor.js';
import SaveCancel from 'editors/saveCancel.js';
import {WhereClause, RangeCheck} from 'elements.js';

const styles = theme => ({
    gridItem: {
    },
});

let wcRegex = {
    variable                : new RegExp('(?:\\w+\\.)?\\w+'),
    variableParse           : new RegExp('(\\w+\\.)?\\w+'),
    item                    : new RegExp('(?:["][^"]+["]|[\'][^\']+[\']|[^\'"]\\S*)'),
    itemParse               : new RegExp('(["][^"]+["]|[\'][^\']+[\']|[^\'"]\\S*)'),
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
);

wcRegex.rangeCheckParse = new RegExp(
    wcRegex.variableParse.source + '\\s+(?:'
    + wcRegex.comparatorSingleParse.source + '\\s+' + wcRegex.itemParse.source
    + '|' + wcRegex.comparatorMultiple.source + '\\s+\\('
    + wcRegex.item.source + '(?:,' + wcRegex.item.source + ')*\\))'
);

wcRegex.whereClause = new RegExp(
    '^(' + wcRegex.rangeCheck.source + ')(?:\\s+and\\s+(' + wcRegex.rangeCheck.source + '))*$'
    , 'i'
);


class VariableNameLabelWhereClauseEditor extends React.Component {
    constructor (props) {
        super(props);
        const autoLabel = this.props.defaultValue.label === undefined && this.props.blueprint !== undefined ? true : false;
        this.state = {
            name          : this.props.defaultValue.name || '',
            label         : this.props.defaultValue.label || '',
            whereClause   : this.props.defaultValue.whereClause,
            autoLabel     : autoLabel,
            wcInputMethod : 'interactive',
        };
    }

    handleChange = name => event => {
        if (name === 'autoLabel') {
            this.setState({ [name]: event.target.checked });
        } else {
            this.setState({ [name]: event.target.value });
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

    validateWhereClase = (whereClauseRaw) => {
        return wcRegex.whereClause.test(whereClauseRaw);
    }

    generateWhereClause = (whereClauseRaw,comment) => {
        // Createa biolerplate  Where Clause without range checks;
        let oid = 'WC.' + this.props.dataset.name + '.' + this.props.defaultValue.itemRef.itemDef.parent.name + '.' + this.state.name;
        let result = new WhereClause({
            oid : oid,
            comment : comment,
        });
        // Extract raw range checks
        let rawRangeChecks = wcRegex.whereClause.exec(whereClauseText);
        // Parse each range check;
        let rangeChecks = [];
        rawRangeChecks.forEach( rawRangeCheck => {


        });




    }


    save = () => {
        this.props.onUpdate(this.state);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render() {
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
                <Grid item xs={12}>
                </Grid>
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
    dataset      : PropTypes.object,
};

export default withStyles(styles)(VariableNameLabelWhereClauseEditor);

