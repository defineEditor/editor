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
