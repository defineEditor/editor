import React from 'react';
import PropTypes from 'prop-types';

class RoleFormatter extends React.Component {
    render() {
        return (
            <div>{this.props.roleAttrs.role}</div>
        );
    }
}

RoleFormatter.propTypes = {
    roleAttrs: PropTypes.object.isRequired,
};

export default RoleFormatter;

