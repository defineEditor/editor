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
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

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
        backgroundColor: '#3f51b5',
    },
    define: {
        backgroundColor: '#5c6bc0',
    },
    type: {
        backgroundColor: '#7986cb',
    },
    list: {
        backgroundColor: '#9fa8da',
    },
}));

const TypeDetails = (props) => {
    let classes = getStyles();

    return (
        <List dense className={classes.list}>
            {props.details.map((item, index) => (
                <ListItem key={index}>
                    <ListItemText
                        primary={item.name}
                    />
                    <ListItemSecondaryAction>
                        <IconButton edge="end">
                            <DeleteIcon />
                        </IconButton>
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
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                        >
                            <Typography className={classes.heading}>{type}</Typography>
                            <Typography className={classes.secondaryHeading}>{props.details[type].length} matches.</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TypeDetails details={props.details[type]} defineId={props.defineId} />
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            ))}
        </Grid>
    );
};

DefineDetails.propTypes = {
    details: PropTypes.object.isRequired,
    defineId: PropTypes.string.isRequired,
};

const StudySearchResultsTable = (props) => {
    let classes = getStyles();
    const [expanded, setExpanded] = useState({});

    const handleChange = (id) => (event, isExpanded) => {
        setExpanded({ ...expanded, [id]: isExpanded });
    };

    return (
        <div className={classes.root}>
            {props.studies.map(study => (
                <Accordion
                    expanded={expanded[study.id] === true}
                    onChange={handleChange(study.id)}
                    key={study.id}
                    className={classes.study}
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
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <Typography className={classes.heading}>{define.name}</Typography>
                                            <Typography className={classes.secondaryHeading}>
                                                {Object.values(props.defines[define.id]).reduce((count, item) => (count + item.length), 0)} matches.
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <DefineDetails details={props.defines[define.id]} defineId={define.id} />
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
    studies: PropTypes.array.isRequired,
    defines: PropTypes.object.isRequired,
};

export default StudySearchResultsTable;
