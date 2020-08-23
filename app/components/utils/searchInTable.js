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

const handleSearch = (data, originalSearchString, header) => {
    let searchString = originalSearchString;
    if (searchString !== '') {
        // Check if specific attribute should be checked
        let selectedAttr;
        let firstWord = searchString.split(':')[0];
        if (header.map(item => item.label).includes(firstWord)) {
            header.some(item => {
                if (item.label === firstWord) {
                    selectedAttr = item.id;
                    // Remove keyword from the string
                    searchString = searchString.replace(/^.*?:/, '');
                    return true;
                }
            });
        }

        return data.filter(row => {
            let matchFound = false;
            matchFound = Object.keys(row)
                .filter(attr => ((selectedAttr !== undefined && attr === selectedAttr) || selectedAttr === undefined))
                .some(attr => {
                    if (typeof row[attr] === 'string') {
                        if (/[A-Z]/.test(searchString)) {
                            return row[attr].includes(searchString);
                        } else {
                            return row[attr].toLowerCase().includes(searchString.toLowerCase());
                        }
                    }
                });

            return matchFound;
        });
    } else {
        return data;
    }
};

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
    }, [props]);

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
        if (props.data !== undefined) {
            let updatedData = handleSearch(props.data, value || event.target.value, props.header);
            if (updatedData !== false) {
                props.onDataUpdate(updatedData);
            }
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
    onDataUpdate: PropTypes.func.isRequired,
    classes: PropTypes.object,
    width: PropTypes.number,
    variant: PropTypes.string,
};

export default SearchInTable;
