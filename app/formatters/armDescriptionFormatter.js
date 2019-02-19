/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import DocumentFormatter from 'formatters/documentFormatter.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    greyText: {
        color: 'rgba(0,0,0,0.54)',
    },
});

class ArmDescriptionFormatter extends React.Component {
    render () {
        let description = this.props.description;
        let descriptionText = getDescription(description);

        return (
            <div>
                <div className={this.props.greyText ? this.props.classes.greyText : undefined}>{descriptionText}</div>
                { (description.documents.length !== 0) &&
                        <DocumentFormatter documents={description.documents} leafs={this.props.leafs}/>
                }
            </div>
        );
    }
}

ArmDescriptionFormatter.propTypes = {
    description: PropTypes.object.isRequired,
    leafs: PropTypes.object,
    greyText: PropTypes.bool,
};

export default withStyles(styles)(ArmDescriptionFormatter);
