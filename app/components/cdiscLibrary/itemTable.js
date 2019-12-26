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
import { withStyles } from '@material-ui/core/styles';
import GeneralTable from 'components/utils/generalTable.js';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 100
    },
    addButton: {
        marginLeft: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    datasetSelector: {
        minWidth: 100,
        marginLeft: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    checkBoxes: {
        marginLeft: theme.spacing(2),
    },
    searchField: {
        width: 120,
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing(1)
    },
});

const cdashAttributes = {
    definition: 'Definition',
    questionText: 'Question Text',
    completionInstructions: 'Completion Instructions',
    prompt: 'Prompt',
    mappingInstructions: 'Mapping Instructions',
    implementationNotes: 'Implementation Notes',
};

const itemDescription = (layout) => (dummyValue, item) => {
    if (layout !== 3) {
        // SDTM or ADaM
        return (
            <div>
                {item.description}
                { item.valueList !== undefined &&
                        <React.Fragment>
                            <br />
                            <Typography variant="body2" color='textSecondary' display='inline'>
                                Possible values:&nbsp;
                            </Typography>
                            {item.valueList.join(', ')}
                        </React.Fragment>
                }
                { item.describedValueDomain !== undefined &&
                        <React.Fragment>
                            <br />
                            <Typography variant="body2" color='textSecondary' display='inline'>
                                Value domain:&nbsp;
                            </Typography>
                            {item.describedValueDomain}
                        </React.Fragment>
                }
            </div>
        );
    } else {
        // CDASH
        return (
            <div>
                { Object.keys(cdashAttributes).map((attr, index) => {
                    if (item[attr] !== undefined) {
                        return (
                            <React.Fragment key={index}>
                                { index !== 0 && <br />}
                                <Typography variant="body2" color='textSecondary' display='inline'>
                                    {cdashAttributes[attr]}:&nbsp;
                                </Typography>
                                {item[attr]}
                            </React.Fragment>
                        );
                    }
                }) }
            </div>
        );
    }
};

const itemRole = (role, item) => {
    return (
        <React.Fragment>
            {item.role}
            { item.roleDescription !== undefined && item.roleDescription !== item.role &&
                    <React.Fragment>
                        <br />
                        <Typography variant="body2" color='textSecondary'>
                            Description:&nbsp;
                        </Typography>
                        <Typography variant="body2" color='textPrimary' display='inline'>
                            {item.roleDescription}
                        </Typography>
                    </React.Fragment>
            }
        </React.Fragment>
    );
};

const getCodeList = (codelist, item) => {
    if (!item.codelist) {
        return null;
    } else {
        return (<span>{item.codelist}</span>);
    }
};

class ItemTable extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            searchString: '',
        };
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    render () {
        const { classes } = this.props;
        const { items, itemGroup, searchString } = this.props;

        // Define layout depending on the dataset type
        let layout;
        let product = this.props.product;
        if (product.type === 'Foundational Model' && product.model === 'SDTM') {
            layout = 4;
        } else if (itemGroup.type === 'SDTM Dataset') {
            layout = 1;
        } else if (itemGroup.constructor && itemGroup.constructor.name === 'DataStructure') {
            layout = 2;
        } else if (product.model === 'CDASH') {
            layout = 3;
        } else {
            layout = 1;
        }

        const descriptionFormatter = itemDescription(layout);

        let header = [
            { id: 'ordinal', label: 'id', hidden: true, key: true },
            { id: 'name', label: 'Name', style: { wordBreak: 'break-all' } },
            { id: 'label', label: 'Label' },
            { id: 'simpleDatatype', label: 'Datatype' },
            { id: 'codelist', label: 'Codelist', formatter: getCodeList },
            { id: 'core', label: 'Core' },
            { id: 'role', label: 'Role', formatter: itemRole },
            { id: 'description', label: 'Description', formatter: descriptionFormatter },
        ];

        // Drop columns for some of the layouts
        if (![1, 4].includes(layout)) {
            header = header.filter(col => (col.id !== 'role'));
        }
        if (layout === 3) {
            header = header.filter(col => (col.id !== 'core'));
        }
        if (layout === 4) {
            header = header.filter(col => (col.id !== 'codelist' && col.id !== 'core'));
        }

        // Add width
        let colWidths = {
            name: 120,
            label: 230,
            simpleDatatype: 100,
            codelist: 100,
            core: 80,
            role: layout === 4 ? 290 : 100,
        };

        header.forEach(column => {
            let width = colWidths[column.id];
            if (width !== undefined) {
                column.style = column.style ? { ...column.style, minWidth: width, maxWidth: width } : { minWidth: width, maxWidth: width };
            }
        });

        let data = items.slice();

        if (searchString !== '') {
            data = data.filter(row => {
                let matchFound = false;
                matchFound = Object.keys(row).some(attr => {
                    // Exclude technical attributes
                    if (['id', 'coreobject', 'type', 'ordinal', 'href', 'codelisthref'].includes(attr.toLowerCase())) {
                        return false;
                    }
                    if (typeof row[attr] === 'string') {
                        if (/[A-Z]/.test(searchString)) {
                            return row[attr].includes(searchString);
                        } else {
                            return row[attr].toLowerCase().includes(searchString.toLowerCase());
                        }
                    }

                    if (attr.toLowerCase() === 'valuelist' && row[attr] !== undefined && row[attr].length > 0) {
                        if (/[A-Z]/.test(searchString)) {
                            return row[attr].join(', ').includes(searchString);
                        } else {
                            return row[attr].join(', ').toLowerCase().includes(searchString.toLowerCase());
                        }
                    }
                });

                return matchFound;
            });
        }

        return (
            <div className={classes.root}>
                <GeneralTable
                    data={data}
                    header={header}
                    sorting
                    disableToolbar
                    fullRowSelect
                    pagination
                    rowsPerPageOptions={[25, 50, 100, 250]}
                />
            </div>
        );
    }
}

ItemTable.propTypes = {
    items: PropTypes.array.isRequired,
    itemGroup: PropTypes.object.isRequired,
    product: PropTypes.object.isRequired,
    searchString: PropTypes.string.isRequired,
};

export default withStyles(styles)(ItemTable);
