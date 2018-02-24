import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import VariableNameLabelEditor from 'editors/variableNameLabelEditor.js';
import SaveCancel from 'editors/saveCancel.js';

const styles = theme => ({
    gridItem: {
    },
});

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
};

export default withStyles(styles)(VariableNameLabelWhereClauseEditor);

