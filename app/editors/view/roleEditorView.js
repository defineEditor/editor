import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';

const styles = theme => ({
    textField: {
        width        : '90px',
        marginRight  : theme.spacing.unit,
        marginBottom : theme.spacing.unit,
    },
});

class RoleEditorView extends React.Component {
    render() {
        const {classes} = this.props;

        return (
            <Grid container spacing={0} alignItems='flex-end'>
                <Grid item xs={12}>
                    <SimpleSelectEditor
                        label='Role'
                        autoFocus
                        options={this.props.variableRoles}
                        defaultValue={this.props.role}
                        onUpdate={this.props.onChange('role')}
                        className={classes.textField}
                        optional
                    />
                </Grid>
                <Grid item xs={12}>
                    <SimpleSelectEditor
                        label='Role Codelist'
                        defaultValue={this.props.roleCodeListOid}
                        options={this.props.codeListList}
                        onUpdate={this.props.onChange('roleCodeListOid')}
                        className={classes.textField}
                        optional
                    />
                </Grid>
            </Grid>
        );
    }
}

RoleEditorView.propTypes = {
    classes         : PropTypes.object.isRequired,
    role            : PropTypes.string.isRequired,
    roleCodeListOid : PropTypes.string.isRequired,
    variableRoles   : PropTypes.array.isRequired,
    codeListList    : PropTypes.object.isRequired,
    onChange        : PropTypes.func.isRequired,
};

export default withStyles(styles)(RoleEditorView);

