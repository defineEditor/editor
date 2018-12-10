/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CancelIcon from '@material-ui/icons/Cancel';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ClearIcon from '@material-ui/icons/Clear';
import ReactSelect from 'react-select';

class Option extends React.Component {
    handleClick = event => {
        this.props.onSelect(this.props.option, event);
    };

    render() {
        const { children, isFocused, isSelected, onFocus } = this.props;

        return (
            <MenuItem
                onFocus={onFocus}
                selected={isFocused}
                onClick={this.handleClick}
                component="div"
                style={{
                    fontWeight: isSelected ? 500 : 400,
                }}
            >
                {children}
            </MenuItem>
        );
    }
}

function SelectWrapped(props) {
    const { classes, ...other } = props;

    const handleEsc = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            props.cancel();
        }
    };

    return (
        <React.Fragment>
            { props.extensible ? (
                <ReactSelect.Creatable
                    optionComponent={Option}
                    clearable={false}
                    onInputKeyDown={handleEsc}
                    escapeClearsValue={false}
                    noResultsText={<Typography>{'No results found'}</Typography>}
                    arrowRenderer={arrowProps => {
                        return arrowProps.isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />;
                    }}
                    clearRenderer={() => <ClearIcon />}
                    valueComponent={valueProps => {
                        const { value, children, onRemove } = valueProps;

                        const onDelete = event => {
                            event.preventDefault();
                            event.stopPropagation();
                            onRemove(value);
                        };

                        if (onRemove) {
                            return (
                                <Chip
                                    tabIndex={-1}
                                    label={children}
                                    className={classes.chip}
                                    deleteIcon={<CancelIcon onTouchEnd={onDelete} />}
                                    onDelete={onDelete}
                                />
                            );
                        }

                        return <div className="Select-value">{children}</div>;
                    }}
                    {...other}
                />
            ) : (
                <ReactSelect
                    optionComponent={Option}
                    clearable={false}
                    onInputKeyDown={handleEsc}
                    escapeClearsValue={false}
                    noResultsText={<Typography>{'No results found'}</Typography>}
                    arrowRenderer={arrowProps => {
                        return arrowProps.isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />;
                    }}
                    clearRenderer={() => <ClearIcon />}
                    valueComponent={valueProps => {
                        const { value, children, onRemove } = valueProps;

                        const onDelete = event => {
                            event.preventDefault();
                            event.stopPropagation();
                            onRemove(value);
                        };

                        if (onRemove) {
                            return (
                                <Chip
                                    tabIndex={-1}
                                    label={children}
                                    className={classes.chip}
                                    deleteIcon={<CancelIcon onTouchEnd={onDelete} />}
                                    onDelete={onDelete}
                                />
                            );
                        }

                        return <div className="Select-value">{children}</div>;
                    }}
                    {...other}
                />
            )
            }
        </React.Fragment>
    );
}

const ITEM_HEIGHT = 48;

const styles = theme => ({
    chip: {
        margin: theme.spacing.unit / 4,
    },
    // We had to use a lot of global selectors in order to style react-select.
    // We are waiting on https://github.com/JedWatson/react-select/issues/1679
    // to provide a better implementation.
    // Also, we had to reset the default style injected by the library.
    '@global': {
        '.Select-control': {
            display    : 'flex',
            alignItems : 'center',
            position   : 'relative',
            border     : 0,
            height     : 'auto',
            background : 'transparent',
            '&:hover'  : {
                boxShadow: 'none',
            },
        },
        '.Select-multi-value-wrapper': {
            flexGrow : 1,
            display  : 'flex',
            flexWrap : 'wrap',
        },
        '.Select--multi .Select-input': {
            margin: 0,
        },
        '.Select.has-value.is-clearable.Select--single > .Select-control .Select-value': {
            padding: 0,
        },
        '.Select-noresults': {
            padding: theme.spacing.unit * 2,
        },
        '.Select-input': {
            display : 'inline-flex !important',
            padding : 0,
            height  : 'auto',
        },
        '.Select-input input': {
            background : 'transparent',
            border     : 0,
            padding    : 0,
            cursor     : 'default',
            display    : 'inline-block',
            fontFamily : 'inherit',
            fontSize   : 'inherit',
            margin     : 0,
            outline    : 0,
        },
        '.Select-placeholder, .Select--single .Select-value': {
            position   : 'absolute',
            top        : 0,
            left       : 0,
            right      : 0,
            bottom     : 0,
            display    : 'flex',
            alignItems : 'center',
            fontFamily : theme.typography.fontFamily,
            fontSize   : theme.typography.pxToRem(16),
            padding    : 0,
        },
        '.Select-placeholder': {
            opacity : 0.42,
            color   : theme.palette.common.black,
        },
        '.Select-menu-outer': {
            backgroundColor : theme.palette.background.paper,
            boxShadow       : theme.shadows[2],
            position        : 'relative',
            left            : 0,
            top             : `${theme.spacing.unit}px`,
            width           : '100%',
            zIndex          : 2,
            maxHeight       : ITEM_HEIGHT * 4.5,
        },
        '.Select.is-focused:not(.is-open) > .Select-control': {
            boxShadow: 'none',
        },
        '.Select-menu': {
            maxHeight : ITEM_HEIGHT * 4.5,
            overflowY : 'auto',
        },
        '.Select-menu div': {
            boxSizing: 'content-box',
        },
        '.Select-arrow-zone, .Select-clear-zone': {
            color  : theme.palette.action.active,
            cursor : 'pointer',
            height : 21,
            width  : 21,
            zIndex : 1,
        },
        // Only for screen readers. We can't use display none.
        '.Select-aria-only': {
            position : 'absolute',
            overflow : 'hidden',
            clip     : 'rect(0 0 0 0)',
            height   : 1,
            width    : 1,
            margin   : -1,
        },
    },
});

class ReactSelectEditor extends React.Component {
    handleChangeSingle = single => {
        this.props.handleChange(single);
    };

    handleChangeMulti = multi => {
        this.setState({
            multi,
        });
    };

    cancel = () => {
        this.props.handleChange(this.props.value);
    }

    render() {
        const { classes } = this.props;
        const single = this.props.value;
        const multi = this.props.value;

        return (
            <React.Fragment>
                {this.props.multiSelect ? (
                    <Input
                        fullWidth
                        className={this.props.className}
                        autoFocus
                        inputComponent={SelectWrapped}
                        inputProps={{
                            classes,
                            value       : multi,
                            multi       : true,
                            onChange    : this.handleChangeMulti,
                            instanceId  : 'react-select-chip',
                            id          : 'react-select-chip',
                            name        : 'react-select-chip',
                            simpleValue : true,
                            options     : this.props.options,
                            cancel      : this.cancel,
                            extensible  : this.props.extensible,
                        }}
                    />
                ) : (
                    <Input
                        fullWidth
                        className={this.props.className}
                        autoFocus
                        inputComponent={SelectWrapped}
                        inputProps={{
                            classes,
                            value       : single,
                            onChange    : this.handleChangeSingle,
                            instanceId  : 'react-select-single',
                            id          : 'react-select-single',
                            name        : 'react-select-single',
                            simpleValue : true,
                            options     : this.props.options,
                            cancel      : this.cancel,
                            extensible  : this.props.extensible,
                        }}
                    />
                )
                }
            </React.Fragment>
        );
    }
}

ReactSelectEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    options      : PropTypes.array.isRequired,
    handleChange : PropTypes.func.isRequired,
    extensible   : PropTypes.bool,
    value        : PropTypes.string,
    optional     : PropTypes.bool,
    label        : PropTypes.string,
    multiSelect  : PropTypes.bool,
};

export default withStyles(styles)(ReactSelectEditor);
