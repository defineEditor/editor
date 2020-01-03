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
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import { openModal } from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    link: {
        color: '#007BFF',
    },
}));

const VariableCodeListFormatter = (props) => {
    const dispatch = useDispatch();
    let classes = getStyles();

    const handleOpen = (event) => {
        event.preventDefault();
        dispatch(openModal({
            type: 'CODELIST_TABLE',
            props: {
                codeListOid: props.codeListOid,
            }
        }));
    };

    return (
        <Link
            variant='body2'
            onClick={handleOpen}
            className={classes.link}
            href='blank'
        >
            {props.codeListLabel}
        </Link>
    );
};

VariableCodeListFormatter.propTypes = {
    codeListOid: PropTypes.string,
};

export default VariableCodeListFormatter;
