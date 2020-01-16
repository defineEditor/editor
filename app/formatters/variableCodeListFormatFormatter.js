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

import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import VariableCodeListFormatter from 'formatters/variableCodeListFormatter.js';

const VariableCodeListFormatFormatter = (props) => {
    const codeListOid = props.value.codeListOid;
    const displayFormat = props.value.displayFormat;
    const codeListLabel = props.value.codeListLabel;

    return (
        <Grid container spacing={0}>
            {codeListOid !== undefined &&
                <Grid item xs={12}>
                    <VariableCodeListFormatter codeListOid={codeListOid} codeListLabel={codeListLabel}/>
                </Grid>
            }
            {displayFormat !== undefined &&
                <Grid item xs={12}>
                    <abbr title='Display Format'>DF</abbr>: {displayFormat}
                </Grid>
            }
        </Grid>
    );
};

VariableCodeListFormatFormatter.propTypes = {
    value: PropTypes.object,
};

export default VariableCodeListFormatFormatter;
