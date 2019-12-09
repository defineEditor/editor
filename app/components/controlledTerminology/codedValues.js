/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
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
import { withStyles, makeStyles, lighten } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { clipboard } from 'electron';
import Typography from '@material-ui/core/Typography';
import withWidth from '@material-ui/core/withWidth';
import GeneralTable from 'components/utils/generalTable.js';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ControlledTerminologyBreadcrumbs from 'components/controlledTerminology/breadcrumbs.js';
import {
    changeCtView,
    changeCtSettings,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
});

const mapStateToProps = state => {
    return {
        currentView: state.present.ui.controlledTerminology.currentView,
        codeListSettings: state.present.ui.controlledTerminology.codeLists,
        codedValuesSettings: state.present.ui.controlledTerminology.codedValues,
        ctUiSettings: state.present.ui.controlledTerminology.packages,
        stdCodeLists: state.present.stdCodeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeCtView: updateObj => dispatch(changeCtView(updateObj)),
        changeCtSettings: updateObj => dispatch(changeCtSettings(updateObj)),
    };
};

const useToolbarStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
        color: theme.palette.text.primary,
        backgroundColor: lighten(theme.palette.primary.light, 0.85),
    },
}));

const options = ['As tab-delimited', 'As SAS Format', 'As R list', 'As Python dictionary'];

const SplitButton = () => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const handleClick = () => {
        console.info(`You clicked ${options[selectedIndex]}`);
        clipboard.writeText(options[selectedIndex]);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen(prevOpen => !prevOpen);
    };

    const handleClose = event => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    return (
        <Grid container direction='column' alignItems='center'>
            <Grid item xs={12}>
                <ButtonGroup variant='contained' color='default' ref={anchorRef} aria-label='split button'>
                    <Button onClick={handleClick} color='default'>Copy to Buffer</Button>
                    <Button
                        color='default'
                        size='small'
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label='select merge strategy'
                        aria-haspopup='menu'
                        onClick={handleToggle}
                    >
                        <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id='split-button-menu'>
                                        {options.map((option, index) => (
                                            <MenuItem
                                                key={option}
                                                selected={index === selectedIndex}
                                                onClick={event => handleMenuItemClick(event, index)}
                                            >
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </Grid>
        </Grid>
    );
};

class ConnectedCodedValues extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            selected: [],
            searchString: '',
        };
    }

    handleSearchUpdate = (event) => {
        this.setState({ searchString: event.target.value });
    }

    setRowsPerPage = (rowsPerPage) => {
        this.props.changeCtSettings({ view: 'packages', settings: { rowsPerPage } });
    }

    CtToolbar = props => {
        const classes = useToolbarStyles();
        let numSelected = this.state.selected.length;

        return (
            <Toolbar className={numSelected > 0 ? classes.highlight : classes.root}>
                { numSelected > 0 ? (
                    <Grid container justify='flex-start' alignItems='center'>
                        <Grid item>
                            <Typography className={classes.title} variant='subtitle1'>
                                {numSelected} selected&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </Typography>
                        </Grid>
                        <Grid item>
                            <SplitButton />
                        </Grid>
                    </Grid>
                ) : (
                    <ControlledTerminologyBreadcrumbs
                        searchString={this.state.searchString}
                        onSearchUpdate={this.handleSearchUpdate}
                    />
                )}
            </Toolbar>
        );
    };

    handleSelectChange = selected => {
        this.setState({ selected });
    };

    render () {
        const { classes, stdCodeLists, codeListSettings, codedValuesSettings } = this.props;
        let id = codeListSettings.packageId;
        let ctPackage = stdCodeLists.hasOwnProperty(id) ? stdCodeLists[id] : undefined;
        let codeList;
        if (ctPackage !== undefined) {
            codeList = ctPackage.codeLists[codedValuesSettings.codeListId];
        }

        let header = [
            { id: 'oid', label: 'oid', hidden: true, key: true },
            { id: 'codedValue', label: 'Coded Value' },
            { id: 'decode', label: 'Decode' },
            { id: 'definition', label: 'Definition' },
            { id: 'synonyms', label: 'Synonyms' },
            { id: 'cCode', label: 'C-Code' },
        ];

        // Add width
        let colWidths = {
            codedValue: 300,
            decode: 450,
            cCode: 125,
        };

        header.forEach(column => {
            let width = colWidths[column.id];
            if (width !== undefined) {
                column.style = column.style ? { ...column.style, minWidth: width, maxWidth: width } : { minWidth: width, maxWidth: width };
            }
        });

        let data = [];

        if (codeList !== null) {
            data = Object.values(codeList.codeListItems).map((value, index) => {
                return {
                    oid: index,
                    codedValue: value.codedValue,
                    decode: value.decodes.length > 0 ? value.decodes[0].value : '',
                    definition: value.definition,
                    synonyms: value.synonyms.join(', '),
                    cCode: value.alias ? value.alias.name : '',
                };
            });
        }

        const searchString = this.state.searchString;

        if (searchString !== '') {
            const caseSensitiveSearch = /[A-Z]/.test(searchString);
            data = data.filter(row => (Object.keys(row)
                .filter(item => (!['oid'].includes(item.id)))
                .some(item => {
                    if (caseSensitiveSearch) {
                        return typeof row[item] === 'string' && row[item].includes(searchString);
                    } else {
                        return typeof row[item] === 'string' && row[item].toLowerCase().includes(searchString);
                    }
                })
            ));
        }

        return (
            <React.Fragment>
                <div className={classes.root}>
                    { ctPackage !== null && (
                        <GeneralTable
                            data={data}
                            header={header}
                            sorting
                            selection = {{ selected: this.state.selected, setSelected: this.handleSelectChange }}
                            customToolbar={this.CtToolbar}
                            pagination={{ rowsPerPage: this.props.ctUiSettings.rowsPerPage, setRowsPerPage: this.setRowsPerPage }}
                            disableToolbar
                            rowsPerPageOptions={[25, 50, 100, 250, 500]}
                        />
                    )}
                </div>
            </React.Fragment>
        );
    }
}

ConnectedCodedValues.propTypes = {
    classes: PropTypes.object.isRequired,
    changeCtView: PropTypes.func.isRequired,
    codeListSettings: PropTypes.object.isRequired,
    codedValuesSettings: PropTypes.object.isRequired,
    ctUiSettings: PropTypes.object,
    stdCodeLists: PropTypes.object.isRequired,
};

const CodedValues = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodedValues);
export default withWidth()(withStyles(styles)(CodedValues));
