/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2019 Dmitry Kolosov                                                *
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
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    root: {
        margin: 0,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
});

class Loading extends React.Component {
    render () {
        const { classes, onRetry } = this.props;
        return (
            <div className={classes.root}>
                <Grid container spacing={32} direction='column' alignItems='center'>
                    <Grid item>
                        <Typography variant="h6" color='textSecondary' inline>
                            Loading
                        </Typography>
                    </Grid>
                    <Grid item>
                        <CircularProgress className={classes.progress} />
                    </Grid>
                    <Grid item>
                        <Button
                            color='default'
                            size='large'
                            variant='contained'
                            className={classes.button}
                            onClick={onRetry}
                        >
                            Retry
                        </Button>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

Loading.propTypes = {
    classes: PropTypes.object.isRequired,
    onRetry: PropTypes.func.isRequired,
};

export default withStyles(styles)(Loading);
