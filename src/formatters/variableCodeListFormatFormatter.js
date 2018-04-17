import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import ModalCodeListFormatter from 'formatters/modalCodeListFormatter.js';

const styles = theme => ({
    displayFormat: {
    },
    codeList: {
    }
});

class VariableCodeListFormatFormatter extends React.Component {
    render() {
        //const {classes} = this.props;
        const codeListOid = this.props.value.codeListOid;
        const displayFormat = this.props.value.displayFormat;
        const codeListLabel = this.props.value.codeListLabel;

        return (
            <Grid container spacing={0}>
                {codeListOid !== undefined &&
                        <Grid item xs={12}>
                            <ModalCodeListFormatter codeListOid={codeListOid} codeListLabel={codeListLabel}/>
                        </Grid>
                }
                {displayFormat !== undefined &&
                        <Grid item xs={12}>
                            <abbr title='Display Format'>DF</abbr>: {displayFormat}
                        </Grid>
                }
            </Grid>
        );
    }
}

VariableCodeListFormatFormatter.propTypes = {
    classes : PropTypes.object.isRequired,
    value   : PropTypes.object,
};

export default withStyles(styles)(VariableCodeListFormatFormatter);

