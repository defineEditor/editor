import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    div: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    },
});

class VariableLengthFormatter extends React.Component {
    render() {
        const {classes} = this.props;
        const lengthAsData = this.props.value.lengthAsData;
        const lengthAsCodelist = this.props.value.lengthAsCodelist;
        const dataType = this.props.dataType;
        const lengthNotApplicable = (['float','text','integer'].indexOf(dataType) === -1);

        let length;
        if (lengthAsData) {
            length = 'No Data';
        } else if (lengthAsCodelist && this.props.row.codeList !== undefined) {
            length = <abbr title='Derived from the codelist'>{this.props.row.codeList.getMaxLength()}</abbr>;
        } else if (lengthNotApplicable) {
            length = <abbr title='Not applicable'>NA</abbr>;
        } else if (lengthAsData) {
            length = <abbr title='Derived from data'>{this.props.value.length}</abbr>;
        } else {
            length = this.props.value.length || '';
        }
        return (
            <div className={classes.div}>
                {length}
                {dataType === 'float' && 
                        <div>
                            <abbr title='Fraction Digits (Significant Digits)'>FD</abbr>: {this.props.value.fractionDigits}
                        </div>
                }
            </div>
        );
    }
}

VariableLengthFormatter.propTypes = {
    classes       : PropTypes.object.isRequired,
    value         : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
    dataType      : PropTypes.string.isRequired,
};

export default withStyles(styles)(VariableLengthFormatter);

