import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import DocumentFormatter from 'formatters/documentFormatter.js';
import FormalExpressionFormatter from 'formatters/formalExpressionFormatter.js';

const styles = theme => ({
    methodName: {
        color        : 'grey',
        marginBottom : theme.spacing.unit,
    },
});

class MethodFormatter extends React.Component {
    render () {
        let method = this.props.method;
        let methodText = method.getDescription();

        return (
            <div key='methodDescription'>
                { (!this.props.hideName) &&
                        <div key='methodName' className={this.props.classes.methodName}>{this.props.method.name + ' (' + this.props.method.type + ')'}</div>
                }
                <div key='methodText'>{methodText}</div>
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
