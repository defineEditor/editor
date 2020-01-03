/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 20199Dmitry Kolosov                                                *
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
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

const AutocompleteSelectEditor = (props) => {
    const handleKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            event.stopPropagation();
            props.onChange(event, props.defaultValue);
        }
    };

    const getOptionLabel = (option) => {
        if (typeof option === 'object') {
            return option.label;
        } else {
            return option;
        }
    };

    return (
        <Autocomplete
            { ...props }
            defaultValue={props.multiSelect ? [props.defaultValue] : props.defaultValue}
            clearOnEscape={false}
            getOptionLabel={getOptionLabel}
            renderInput={params => (
                <TextField
                    {...params}
                    label={props.label}
                    margin="normal"
                    autoFocus={props.autoFocus}
                    onKeyDown={handleKeyDown}
                    multiline={props.multiline}
                    fullWidth
                />
            )}
        />
    );
};

export default AutocompleteSelectEditor;
