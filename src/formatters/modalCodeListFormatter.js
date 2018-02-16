import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
//import Paper from 'material-ui/Paper';
//import Typography from 'material-ui/Typography';
import Modal from 'material-ui/Modal';
import Button from 'material-ui/Button';
import CodeListFormatter from 'formatters/codeListFormatter.js';

const styles = theme => ({
    paper: {
        padding         : theme.spacing.unit * 4,
        backgroundColor : theme.palette.background.paper,
        position        : 'absolute',
        boxShadow       : theme.shadows[5],
        borderRadius    : '10px',
        border          : '2px solid',
        borderColor     : 'primary',
        top             : '50%',
        left            : '50%',
        transform       : 'translate(-50%, -50%)',
    },
});

class ModalCodeListFormatter extends React.Component {
    state = {
        open: false,
    };

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render () {
        const { value, classes } = this.props;
        return (
            <div>
                <Button onClick={this.handleOpen}>{value.name}</Button>
                <Modal
                    open={this.state.open}
                    onClose={this.handleClose}
                >
                    <div className={classes.paper}>
                        <CodeListFormatter value={value} defineVersion={this.props.defineVersion}/>
                    </div>
                </Modal>
            </div>
        );
    }
}

ModalCodeListFormatter.propTypes = {
    value         : PropTypes.object,
    defineVersion : PropTypes.string.isRequired,
};

export default withStyles(styles)(ModalCodeListFormatter);
