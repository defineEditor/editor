import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import DocumentFormatter from 'formatters/documentFormatter.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    originName: {
        color: '#000000'
    },
});

class OriginFormatter extends React.Component {
    render () {
        let origin = this.props.origin;
        let originText = getDescription(origin);

        return (
            <div key='originDescription'>
                <Typography variant="caption" gutterBottom className={this.props.classes.originName}>
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
    classes : PropTypes.object.isRequired,
    origin  : PropTypes.object.isRequired,
    leafs   : PropTypes.object
};

export default withStyles(styles)(OriginFormatter);
