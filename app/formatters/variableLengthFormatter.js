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
import { withStyles } from '@material-ui/core/styles';
import { getMaxLength } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    div: {
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
    },
});

class VariableLengthFormatter extends React.Component {
    render () {
        const { classes } = this.props;
        const lengthAsData = this.props.value.lengthAsData;
        const lengthAsCodeList = this.props.value.lengthAsCodeList;
        const dataType = this.props.dataType;
        const lengthNotApplicable = (['float', 'text', 'integer'].indexOf(dataType) === -1) && !this.props.value.length;

        let length;
        if (lengthAsData && !this.props.value.length) {
            length = <abbr title='Actual Data'>AD</abbr>;
        } else if (lengthAsCodeList && this.props.row.codeList !== undefined) {
            length = <abbr title='Derived from the codelist'>{getMaxLength(this.props.row.codeList)}</abbr>;
        } else if (lengthNotApplicable) {
            length = <abbr title='Not applicable'>NA</abbr>;
        } else if (lengthAsData) {
            length = <abbr title='Actual Length'>{this.props.value.length}</abbr>;
        } else {
            length = this.props.value.length || '';
        }
        return (
            <div className={classes.div}>
                {length}
                {(dataType === 'float' || this.props.value.fractionDigits !== undefined) &&
                        <div>
                            <abbr title='Fraction Digits (Significant Digits)'>FD</abbr>: {this.props.value.fractionDigits}
                        </div>
                }
            </div>
        );
    }
}

VariableLengthFormatter.propTypes = {
    classes: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    dataType: PropTypes.string.isRequired,
};

export default withStyles(styles)(VariableLengthFormatter);
