import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    context: {
        fontSize: '11px',
        color: '#000000',
    },
    value: {
        fontFamily: 'Courier'
    },
});


class formalExpressionFormatter extends React.Component {
    render () {
        const { classes } = this.props;
        let result = [];
        this.props.formalExpressions.forEach((formalExpression, index) => {
            if (formalExpression.context !== undefined) {
                result.push(<div className={classes.context} key={'c' + index}>{formalExpression.context}</div>);
            }
            if (formalExpression.value !== undefined) {
                result.push(<div className={classes.value} key={'v'+index}>{formalExpression.value}</div>);
            }
        });

        return (
            <React.Fragment>
                {result}
            </React.Fragment>
        );
    }
}

formalExpressionFormatter.propTypes = {
    formalExpressions : PropTypes.array.isRequired,
    classes           : PropTypes.object
};

export default withStyles(styles)(formalExpressionFormatter);
