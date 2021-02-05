/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
 *                                                                                  *
 * Visual Define-XML Editor is free software: you can redistribute it and/or modify *
 * it under the terms of version 3 of the GNU Affero General Public License         *
 *                                                                                  *
 * Visual Define-XML Editor is distributed in the hope that it will be useful,      *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
 * version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
 ***********************************************************************************/

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ListSubheader from '@material-ui/core/ListSubheader';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import IconButton from '@material-ui/core/IconButton';
import Grow from '@material-ui/core/Grow';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import NavigationBar from 'core/navigationBar.js';
import StudyTile from 'components/utils/studyTile.js';
import StudyOrderEditor from 'components/orderEditors/studyOrderEditor.js';
import { Study } from 'core/mainStructure.js';
import AddDefineForm from 'core/addDefineForm.js';
import getOid from 'utils/getOid.js';
import { addStudy, openModal } from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: theme.palette.grey[50],
        minHeight: 'calc(100vh -  ' + (theme.spacing(7)).toString() + 'px)',
        marginTop: theme.spacing(7)
    },
    iconButton: {
        marginLeft: theme.spacing(1),
    },
    gridList: {
        width: '100%',
    },
    fabIcon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing(2),
    },
}));

const widthCols = {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 7
};

const useWidth = () => {
    const theme = useTheme();
    const keys = [...theme.breakpoints.keys].reverse();
    return (
        keys.reduce((output, key) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const matches = useMediaQuery(theme.breakpoints.up(key));
            return !output && matches ? key : output;
        }, null) || 'xs'
    );
};

const getStudies = (props) => {
    let studies = props.studies.byId;
    return props.studies.allIds.map((studyId, index) => {
        let study = studies[studyId];
        return (
            <Grow in={true} timeout={ Math.min(100 * index, 1000) } key={index} style={{ transformOrigin: '0 0 0' }}>
                <GridListTile key={study.id}>
                    <StudyTile
                        study={study}
                        defines={props.defines}
                        currentDefineId={props.currentDefineId}
                        currentStudyId={props.currentStudyId}
                        isCurrentDefineSaved={props.isCurrentDefineSaved}
                    />
                </GridListTile>
            </Grow>
        );
    });
};

getStudies.propTypes = {
    studies: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    currentDefineId: PropTypes.string,
    currentStudyId: PropTypes.string,
};

const Studies = (props) => {
    const dispatch = useDispatch();
    const studies = useSelector(state => state.present.studies);
    const defines = useSelector(state => state.present.defines);
    const { currentDefineId, currentStudyId, isCurrentDefineSaved } = useSelector(state => state.present.ui.main);
    const classes = getStyles();

    // It is expected to rerender, because studies will change after this action is triggered
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onAddStudy = () => {
        let id = getOid('Study', studies.allIds);
        let name = 'Study ' + (studies.allIds.length + 1).toString();
        let study = new Study({ id, name });
        dispatch(addStudy({ study: { ...study } }));
    };

    const onSearch = () => {
        dispatch(openModal({ type: 'SEARCH_STUDIES' }));
    };

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.ctrlKey && (event.keyCode === 78)) {
                onAddStudy();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [onAddStudy]);

    const width = useWidth();
    let studyNum = Object.keys(studies.byId).length;
    let subHeaderText;
    if (studyNum === 0) {
        subHeaderText = 'No Studies';
    } else if (studyNum === 1) {
        subHeaderText = '1 Study';
    } else {
        subHeaderText = studyNum.toString() + ' Studies';
    }

    let cols = widthCols[width];

    return (
        <React.Fragment>
            <NavigationBar>
                <Tooltip title='Add Study' placement='bottom' enterDelay={700}>
                    <IconButton
                        color='default'
                        edge='end'
                        onClick={onAddStudy}
                        className={classes.iconButton}
                    >
                        <AddIcon/>
                    </IconButton>
                </Tooltip>
                <Tooltip title='Search in Studies' placement='bottom' enterDelay={700}>
                    <IconButton
                        color='default'
                        edge='end'
                        onClick={onSearch}
                        className={classes.iconButton}
                    >
                        <SearchIcon/>
                    </IconButton>
                </Tooltip>
                <StudyOrderEditor iconClass={classes.iconButton}/>
            </NavigationBar>
            <div className={classes.root}>
                <GridList
                    cellHeight={214}
                    className={classes.gridList}
                    cols={cols}
                    spacing={4}
                >
                    <GridListTile
                        key="subheader"
                        style={{ height: '60px', textAlign: 'center' }}
                        cols={cols}
                    >
                        <ListSubheader component="div">{subHeaderText}</ListSubheader>
                    </GridListTile>
                    {getStudies({ studies, defines, currentDefineId, currentStudyId, isCurrentDefineSaved })}
                </GridList>
            </div>
            <AddDefineForm />
        </React.Fragment>
    );
};

export default Studies;
