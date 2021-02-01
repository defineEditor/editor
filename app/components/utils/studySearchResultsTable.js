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

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import Grid from '@material-ui/core/Grid';
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
import IconButton from '@material-ui/core/IconButton';
import ForwardIcon from '@material-ui/icons/Forward';
import FilterListIcon from '@material-ui/icons/FilterList';
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
}));

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
    const [expanded, setExpanded] = useState({});

    const handleChange = (id) => (event, isExpanded) => {
        setExpanded({ ...expanded, [id]: isExpanded });
    };

    return (
        <Grid container className={classes.defineGrid}>
            {Object.keys(props.details).map(type => (
                <Grid item xs={12} key={type}>
                    <Accordion
                        expanded={expanded[type] === true}
                        onChange={handleChange(type)}
                        className={classes.type}
                        TransitionProps={{ unmountOnExit: true }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                        >
                            <Typography className={classes.heading}>{type}</Typography>
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

const StudySearchResultsTable = (props) => {
    let classes = getStyles();
    const dispatch = useDispatch();
    const { studies, defines } = props.matchedStudies;
    const [expanded, setExpanded] = useState({});
    const { currentDefineId, isCurrentDefineSaved } = useSelector(state => state.present.ui.main);

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

    const handleChange = (id) => (event, isExpanded) => {
        setExpanded({ ...expanded, [id]: isExpanded });
    };

    return (
        <div className={classes.root}>
            {studies.map(study => (
                <Accordion
                    expanded={expanded[study.id] === true}
                    onChange={handleChange(study.id)}
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
                                        expanded={expanded[define.id] === true}
                                        onChange={handleChange(define.id)}
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
