import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import DocumentFormatter from 'formatters/documentFormatter.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    text: {
    },
});


class ArmDescriptionFormatter extends React.Component {
    render () {
        let description = this.props.description;
        let descriptionText = getDescription(description);

        return (
            <div>
                <div>{descriptionText}</div>
                { (description.documents.length !== 0) &&
                        <DocumentFormatter documents={description.documents} leafs={this.props.leafs}/>
                }
            </div>
        );
    }
}

ArmDescriptionFormatter.propTypes = {
    description : PropTypes.object.isRequired,
    leafs       : PropTypes.object
};

export default withStyles(styles)(ArmDescriptionFormatter);
