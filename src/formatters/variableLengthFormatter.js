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
        } else if (lengthAsCodelist) {
            length = this.props.row.codeList.getMaxLength();
        } else if (lengthNotApplicable) {
            length = 'Not Applicable';
        } else {
            length = this.props.value.length || '';
        }
        return (
            <div className={classes.div}>
                {lengthAsData && <div>Derived from data: <br/></div>}
                {lengthAsCodelist && <div>Derived from codelist:<br/></div>}
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

