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
        const codeList = this.props.value.codeList;
        const displayFormat = this.props.value.displayFormat;

        return (
            <Grid container spacing={0}>
                {codeList !== undefined &&
                        <Grid item xs={12}>
                            <ModalCodeListFormatter value={codeList} defineVersion={this.props.defineVersion}/>
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
    classes       : PropTypes.object.isRequired,
    value         : PropTypes.object,
    defineVersion : PropTypes.string.isRequired,
};

export default withStyles(styles)(VariableCodeListFormatFormatter);

