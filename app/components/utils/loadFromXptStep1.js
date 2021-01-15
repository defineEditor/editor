/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2020 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import GeneralTable from 'components/utils/generalTable.js';

const getStyles = makeStyles(theme => ({
    button: {
        marginRight: theme.spacing(1),
    },
    table: {
        height: '50vh',
        display: 'flex',
    },
}));

const LoadFromXptStep1 = (props) => {
    const [metadata, setMetadata] = useState(props.metadata);
    let classes = getStyles();
    let header = [
        { id: 'name', label: 'Dataset', key: true },
        { id: 'label', label: 'Label' },
        { id: 'numVars', label: '# variables' },
    ];
    let tableData = [];
    Object.keys(metadata).forEach(name => {
        let ds = metadata[name];
        if (ds.loadFailed) {
            tableData.push({
                name,
                label: 'Failed to load',
                numVars: 0,
            });
        } else {
            tableData.push({
                name: ds.dsMetadata.name,
                label: ds.dsMetadata.label,
                numVars: ds.varMetadata.length,
            });
        }
    });

    const metadataRef = useRef(metadata);
    useEffect(() => { metadataRef.current = metadata; }, [metadata]);

    const handleMetadata = (event, data) => {
        setMetadata({ ...metadataRef.current, ...data });
    };

    const handleReset = () => {
        setMetadata({});
    };

    const handleNext = () => {
        // Remove datasets which failed to load
        let updatedMetadata = { ...metadata };
        Object.keys(updatedMetadata).forEach(name => {
            let ds = updatedMetadata[name];
            if (ds.loadFailed) {
                delete updatedMetadata[name];
            }
        });

        props.handleData(updatedMetadata);
        props.onNext();
    };

    const handleSelect = () => {
        ipcRenderer.send('loadXptMetadata', { multiSelections: true });
    };

    useEffect(() => {
        ipcRenderer.on('xptMetadata', handleMetadata);
        return function cleanup () {
            ipcRenderer.removeListener('xptMetadata', handleMetadata);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Grid container direction='column' spacing={1}>
            <Grid item className={classes.table}>
                <GeneralTable
                    data={tableData}
                    header={header}
                    disableToolbar
                />
            </Grid>
            <Grid item>
                <Grid container justify='space-between' spacing={1}>
                    <Grid item>
                        <Button
                            variant="contained"
                            onClick={handleSelect}
                            className={classes.button}
                        >
                            Select XPTs
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleReset}
                            className={classes.button}
                        >
                            Reset
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color="primary"
                            onClick={props.onCancel}
                            className={classes.button}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={true}
                            className={classes.button}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={Object.keys(metadata).length === 0}
                            onClick={handleNext}
                            className={classes.button}
                        >
                            Next
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

LoadFromXptStep1.propTypes = {
    metadata: PropTypes.object.isRequired,
    handleData: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default LoadFromXptStep1;
