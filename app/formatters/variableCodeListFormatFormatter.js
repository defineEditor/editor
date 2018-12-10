/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import ModalCodeListFormatter from 'formatters/modalCodeListFormatter.js';

const styles = theme => ({
    displayFormat: {
    },
    codeList: {
    }
});

class VariableCodeListFormatFormatter extends React.Component {
    render() {
        //const {classes} = this.props;
        const codeListOid = this.props.value.codeListOid;
        const displayFormat = this.props.value.displayFormat;
        const codeListLabel = this.props.value.codeListLabel;

        return (
            <Grid container spacing={0}>
                {codeListOid !== undefined &&
                        <Grid item xs={12}>
                            <ModalCodeListFormatter codeListOid={codeListOid} codeListLabel={codeListLabel}/>
                        </Grid>
                }
                {displayFormat !== undefined &&
                        <Grid item xs={12}>
                            <abbr title='Display Format'>DF</abbr>: {displayFormat}
                        </Grid>
                }
            </Grid>
        );
    }
}

VariableCodeListFormatFormatter.propTypes = {
    classes : PropTypes.object.isRequired,
    value   : PropTypes.object,
};

export default withStyles(styles)(VariableCodeListFormatFormatter);

