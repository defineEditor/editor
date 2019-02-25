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
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignJustifyIcon from '@material-ui/icons/FormatAlignJustify';
import StorageIcon from '@material-ui/icons/Storage';
import GridOffIcon from '@material-ui/icons/GridOff';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
});

class datasetFlagsFormatter extends React.Component {
    render () {
        const { value } = this.props;

        const repeatingTooltipText = value.repeating === 'Yes' ? 'Repeating' : 'Not repeating';

        return (
            <Grid container spacing={16}>
                <Grid item>
                    <Tooltip title={repeatingTooltipText} placement='bottom'>
                        {value.repeating === 'Yes' ? <FormatAlignLeftIcon/> : <FormatAlignJustifyIcon/>}
                    </Tooltip>
                </Grid>
                {value.isReferenceData === 'Yes' &&
                        <Grid item>
                            <Tooltip title='Reference Data' placement='bottom'>
                                <StorageIcon/>
                            </Tooltip>
                        </Grid>
                }
                {value.hasNoData === 'Yes' &&
                        <Grid item>
                            <Tooltip title='Has No Data' placement='bottom'>
                                <GridOffIcon/>
                            </Tooltip>
                        </Grid>
                }
            </Grid>
        );
    }
}

datasetFlagsFormatter.propTypes = {
    value: PropTypes.object,
    defineVersion: PropTypes.string.isRequired,
};

export default withStyles(styles)(datasetFlagsFormatter);
