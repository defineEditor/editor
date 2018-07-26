import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import DocumentFormatter from 'formatters/documentFormatter.js';

const styles = theme => ({
    text: {
    },
});

class OriginFormatter extends React.Component {
    render () {
        let origin = this.props.origin;
        let originText = origin.getDescription();

        return (
            <div key='originDescription'>
                <Typography variant="caption" gutterBottom>
                    {origin.type}
                </Typography>
                <div key='originText'>{originText}</div>
                { (origin.documents.length !== 0) &&
                        <DocumentFormatter documents={origin.documents} leafs={this.props.leafs}/>
                }
            </div>
        );
    }
}

OriginFormatter.propTypes = {
    origin : PropTypes.object.isRequired,
    leafs  : PropTypes.object
};

export default withStyles(styles)(OriginFormatter);
