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
