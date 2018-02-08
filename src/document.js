import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { InputLabel } from 'material-ui/Input';
import ItemSelect from './itemSelect.js';

const styles = theme => ({
    container: {
        display  : 'flex',
        flexWrap : 'wrap',
    },
    formControl: {
        margin   : 'normal',
        minWidth : 120,
    },
    select: {
        marginTop: theme.spacing.unit * 2,
    },
});

class PdfPageRef extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = Object.assign(this.props.value, {
            firstLast: (this.props.value.pageRefs !== undefined ? 'disable' : '')
        });
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    }

    render() {
        const { classes } = this.props;
        const value = this.state.type;

        return (
            <ItemSelect
                options={[{'PhysicalRef': 'Physical Reference'},{'NamedDestination': 'Named Destination'}]}
                value={value}
                handleChange={this.handleChange('type')}
                label='Reference Type'
            />
        );
    }
}

PdfPageRef.propTypes = {
    classes : PropTypes.object.isRequired,
    value   : PropTypes.object.isRequired,
};

export default withStyles(styles)(PdfPageRef);

