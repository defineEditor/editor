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
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import handleSearchInTable from 'utils/handleSearchInTable.js';

const getStyles = makeStyles(theme => ({
    searchField: {
        marginTop: '0',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
    searchInput: {
        paddingTop: '9px',
        paddingBottom: '9px',
    },
    searchLabel: {
    },
}));

const SearchInTable = (props) => {
    // Search
    const searchFieldRef = useRef(null);
    let classes = props.classes || getStyles();
    const [options, setOptions] = useState([]);

    useEffect(() => {
        // Get options from the data
        let header = props.header;
        if (header !== undefined && header.length > 0) {
            let dataOptions = [];
            header.forEach(column => {
                if (column.hidden !== true) {
                    dataOptions.push(column.label + ':');
                }
            });
            setOptions(dataOptions);
        }
    }, [props.header]);

    // Ctrl+F listener
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.ctrlKey && (event.keyCode === 70)) {
                searchFieldRef.current.focus();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [searchFieldRef]);

    const handleSearchUpdate = (event, value) => {
        let newSearchString = value || event.target.value;
        if (props.data !== undefined) {
            if (props.onDataUpdate !== undefined) {
                let updatedData = handleSearchInTable(props.data, props.header, newSearchString);
                props.onDataUpdate(updatedData);
            }
        }
        if (props.onSeachUpdate !== undefined) {
            props.onSeachUpdate(newSearchString);
        }
    };

    const handleChange = (event, value, reason) => {
        if (reason === 'select-option') {
            // Do nothing
        } else if (reason === 'create-option' && event.keyCode === 13) {
            handleSearchUpdate(event, value);
        }
    };

    const handleSearchKeyDown = (event) => {
        // Need to handle special case when the input is blank, as the onChange event is not triggered by autocomplete
        if (event.keyCode === 13 && event.target.value === '') {
            handleSearchUpdate(event);
        }
    };

    return (
        <div style={{ width: props.width || 300 }}>
            <Autocomplete
                clearOnEscape={false}
                options={options}
                freeSolo
                onChange={handleChange}
                className={classes.searchField}
                renderInput={params => (
                    <TextField
                        {...params}
                        label='Search'
                        placeholder='Ctrl+F'
                        margin={props.margin}
                        variant={props.variant || 'outlined'}
                        onBlur={handleSearchUpdate}
                        onKeyDown={handleSearchKeyDown}
                        inputRef={searchFieldRef}
                        InputLabelProps={{
                            className: classes.searchLabel,
                            shrink: true,
                            focused: false,
                        }}
                    />
                )}
            />
        </div>
    );
};

SearchInTable.propTypes = {
    data: PropTypes.array,
    header: PropTypes.array,
    onDataUpdate: PropTypes.func,
    onSeachUpdate: PropTypes.func,
    classes: PropTypes.object,
    width: PropTypes.number,
    variant: PropTypes.string,
    margin: PropTypes.string,
};

export default SearchInTable;
