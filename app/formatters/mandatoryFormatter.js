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

const styles = theme => ({
});

class RoleMandatoryFormatter extends React.Component {
    render() {
        const {classes} = this.props;
        return (
            <Grid container spacing={0}>
                <Grid item xs={12} className={classes.gridItem}>
                    {this.props.value.mandatory}
                </Grid>
            </Grid>
        );
    }
}

RoleMandatoryFormatter.propTypes = {
    classes : PropTypes.object.isRequired,
    value   : PropTypes.object.isRequired,
    model   : PropTypes.string.isRequired,
};

export default withStyles(styles)(RoleMandatoryFormatter);

