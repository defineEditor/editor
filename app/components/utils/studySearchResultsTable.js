/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2021 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ForwardIcon from '@material-ui/icons/Forward';
import ClearIcon from '@material-ui/icons/Clear';
import FilterListIcon from '@material-ui/icons/FilterList';
import { FaAngleDoubleDown, FaAngleDoubleUp } from 'react-icons/fa';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import {
    changePage,
    openModal,
    addOdm,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    studyDetails: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '43.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    study: {
        backgroundColor: '#e0e0e0',
    },
    define: {
        backgroundColor: '#eeeeee',
        marginBottom: theme.spacing(1),
    },
    type: {
        backgroundColor: '#f5f5f5',
        marginBottom: theme.spacing(1),
    },
    list: {
        backgroundColor: '#fafafa',
        width: '100%'
    },
    expandFab: {
        marginBottom: theme.spacing(1),
    },
}));

const typeLabels = {
    'study': 'Studies',
    'define': 'Defines',
    'dataset': 'Datasets',
    'variable': 'Variables',
    'codeList': 'Codelists',
    'codedValue': 'Coded Values',
    'resultDisplay': 'Result Displays',
    'analysisResult': 'Analysis Results'
};

const TypeDetails = (props) => {
    let classes = getStyles();

    const handleStudyOpen = (item, options) => {
        props.handleStudyOpen(item, options);
    };

    return (
        <List dense className={classes.list}>
            {props.details.map((item, index) => (
                <ListItem key={index}>
                    <ListItemText
                        primary={item.name}
                    />
                    <ListItemSecondaryAction>
                        <Tooltip title={'Open Study'} placement='bottom' enterDelay={700}>
                            <IconButton edge="end" onClick={(event) => { handleStudyOpen(item); }}>
                                <ForwardIcon />
                            </IconButton>
                        </Tooltip>
                        {['variable'].includes(props.type) && (
                            <Tooltip title={'Open Study with Filter Applied'} placement='bottom' enterDelay={700}>
                                <IconButton edge="end" onClick={(event) => { handleStudyOpen(item, { filter: true }); }}>
                                    <FilterListIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title={'Open Study in a New Window'} placement='bottom' enterDelay={700}>
                            <IconButton edge="end" onClick={(event) => { handleStudyOpen(item, { filter: true, external: true }); }}>
                                <OpenInBrowserIcon />
                            </IconButton>
                        </Tooltip>
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
        </List>
    );
};

const DefineDetails = (props) => {
    let classes = getStyles();

    const { expanded, onChange } = props;

    return (
        <Grid container className={classes.defineGrid}>
            {Object.keys(props.details).map(type => (
                <Grid item xs={12} key={type}>
                    <Accordion
                        expanded={expanded[type] === true}
                        onChange={onChange(type, 'details')}
                        className={classes.type}
                        TransitionProps={{ unmountOnExit: true }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                        >
                            <Typography className={classes.heading}>{typeLabels[type]}</Typography>
                            <Typography className={classes.secondaryHeading}>{props.details[type].length} matches.</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TypeDetails
                                type={type}
                                details={props.details[type]}
                                handleStudyOpen={props.handleStudyOpen(type)}
                            />
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            ))}
        </Grid>
    );
};

DefineDetails.propTypes = {
    details: PropTypes.object.isRequired,
};

const fillExpanded = (studies, defines, value) => {
    let result = { studies: {}, defines: {}, details: {} };
    studies.forEach(study => {
        result.studies[study.id] = value;
        study.defines.forEach(define => {
            result.defines[define.id] = value;
            Object.keys(defines[define.id]).forEach(type => {
                result.details[type] = value;
            });
        });
    });
    return result;
};

const checkAllExpanded = (expanded) => {
    // Check whether all elements are expanded or not
    return !Object.values(expanded).some(type => {
        return Object.values(type).some(status => status === false);
    });
};

const StudySearchResultsTable = (props) => {
    let classes = getStyles();
    const dispatch = useDispatch();
    const { studies, defines } = props.matchedStudies;
    const [expanded, setExpanded] = useState({ studies: {}, defines: {}, details: {} });
    const { currentDefineId, isCurrentDefineSaved } = useSelector(state => state.present.ui.main);

    useEffect(() => {
        setExpanded(fillExpanded(studies, defines, false));
    }, [studies, defines]);

    const onStudyOpen = (studyId, defineId) => (type) => (item, options = {}) => {
        let { filter, external } = options;
        filter = Boolean(filter);
        let selectedItem = {
            type,
            item,
            filter,
        };
        if (external === true) {
            ipcRenderer.send('openDefineInNewWindow', {
                defineId,
                studyId,
                selectedItem,
                origin: 'searchStudies',
            });
        } else {
            props.handleClose(undefined, selectedItem);
            if (isCurrentDefineSaved) {
                // If no Define-XMLs are edited at the moment, specify the Define
                if (currentDefineId === defineId) {
                    // It is required to set ODM to blank in order to reload the ODM object
                    dispatch(addOdm({}));
                }
                dispatch(changePage({
                    page: 'editor',
                    defineId,
                    studyId,
                    origin: 'searchStudies',
                }));
            } else {
                dispatch(openModal({
                    type: 'CHANGE_DEFINE',
                    props: {
                        currentDefineId: currentDefineId,
                        defineId,
                        studyId,
                        origin: 'searchStudies',
                        reset: currentDefineId === defineId,
                    }
                }));
            }
        }
    };

    const isAllExpanded = checkAllExpanded(expanded);

    const toggleExpand = () => {
        setExpanded(fillExpanded(studies, defines, !isAllExpanded));
    };

    const handleChange = (id, type) => (event, isExpanded) => {
        setExpanded({ ...expanded, [type]: { ...expanded[type], [id]: isExpanded } });
    };

    return (
        <div className={classes.root}>
            <Grid container spacing={2} justify='flex-end'>
                <Grid item>
                    <Tooltip title={ isAllExpanded ? 'Collapse' : 'Expand' } placement="bottom" enterDelay={700}>
                        <Fab
                            size='small'
                            color='default'
                            onClick={toggleExpand}
                            className={classes.expandFab}
                        >
                            { isAllExpanded ? (<FaAngleDoubleUp/>) : (<FaAngleDoubleDown/>) }
                        </Fab>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Clear search results" placement="bottom" enterDelay={700}>
                        <Fab
                            size='small'
                            color='default'
                            onClick={props.handleClear}
                            className={classes.expandFab}
                        >
                            <ClearIcon />
                        </Fab>
                    </Tooltip>
                </Grid>
            </Grid>
            {studies.map(study => (
                <Accordion
                    expanded={expanded.studies[study.id] === true}
                    onChange={handleChange(study.id, 'studies')}
                    key={study.id}
                    className={classes.study}
                    TransitionProps={{ unmountOnExit: true }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography className={classes.heading}>{study.name}</Typography>
                        <Typography className={classes.secondaryHeading}>{study.defines.length} matched defines.</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.studyDetails}>
                        <Grid container className={classes.defineGrid}>
                            {study.defines.map(define => (
                                <Grid item xs={12} key={define.id}>
                                    <Accordion
                                        expanded={expanded.defines[define.id] === true}
                                        onChange={handleChange(define.id, 'defines')}
                                        className={classes.define}
                                        TransitionProps={{ unmountOnExit: true }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <Typography className={classes.heading}>{define.name}</Typography>
                                            <Typography className={classes.secondaryHeading}>
                                                {Object.values(defines[define.id]).reduce((count, item) => (count + item.length), 0)} matches.
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <DefineDetails
                                                details={defines[define.id]}
                                                expanded={expanded.details}
                                                onChange={handleChange}
                                                handleStudyOpen={onStudyOpen(study.id, define.id)}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                            ))}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

StudySearchResultsTable.propTypes = {
    matchedStudies: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default StudySearchResultsTable;
