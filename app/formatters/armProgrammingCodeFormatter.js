import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import DocumentFormatter from 'formatters/documentFormatter.js';

const styles = theme => ({
    context: {
        fontSize: '11px',
        color: '#000000',
    },
    code: {
        fontFamily: 'Courier',
        fontWeight: 500,
        whiteSpace: 'pre-wrap',
    },
});

class ArmProgrammingCodeFormatter extends React.Component {
    render () {
        const { classes, programmingCode } = this.props;
        const { context, code, documents } = programmingCode;

        return (
            <React.Fragment>
                { context !== undefined && (<div className={classes.context} key={'context'}>{programmingCode.context}</div>) }
                { code !== undefined && (<div className={classes.code} key={'code'}>{programmingCode.code}</div>) }
                { (documents.length !== 0) && <DocumentFormatter documents={documents} leafs={this.props.leafs}/> }
            </React.Fragment>
        );
    }
}

ArmProgrammingCodeFormatter.propTypes = {
    classes         : PropTypes.object,
    programmingCode : PropTypes.object.isRequired,
    leafs           : PropTypes.object.isRequired,
};

export default withStyles(styles)(ArmProgrammingCodeFormatter);
