import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import DocumentFormatter from 'formatters/documentFormatter.js';
import FormalExpressionFormatter from 'formatters/formalExpressionFormatter.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    methodName: {
        color        : 'grey',
        marginBottom : theme.spacing.unit,
    },
    methodText: {
        whiteSpace: 'pre-wrap',
    },
});

class MethodFormatter extends React.Component {
    render () {
        const { classes, method } = this.props;
        let methodText = getDescription(method);

        return (
            <div key='methodDescription'>
                { (!this.props.hideName) &&
                        <div key='methodName' className={classes.methodName}>{method.name + ' (' + this.props.method.type + ')'}</div>
                }
                <div key='methodText' className={classes.methodText}>{methodText}</div>
                { (method.documents.length !== 0) &&
                        <DocumentFormatter documents={method.documents} leafs={this.props.leafs}/>
                }
                { (method.formalExpressions.length !== 0) &&
                        <React.Fragment>
                            <Typography variant="caption" gutterBottom>
                                Formal Expression
                            </Typography>
                            <FormalExpressionFormatter formalExpressions={method.formalExpressions}/>
                        </React.Fragment>
                }
            </div>
        );
    }
}

MethodFormatter.propTypes = {
    method   : PropTypes.object.isRequired,
    leafs    : PropTypes.object,
    hideName : PropTypes.bool,
};

export default withStyles(styles)(MethodFormatter);
