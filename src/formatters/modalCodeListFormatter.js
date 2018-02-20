import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
//import Typography from 'material-ui/Typography';
import Modal from 'material-ui/Modal';
import ButtonBase from 'material-ui/ButtonBase';
import CodeListFormatter from 'formatters/codeListFormatter.js';

const styles = theme => ({
    paper: {
        paddingLeft   : theme.spacing.unit * 4,
        paddingRight  : theme.spacing.unit * 4,
        paddingTop    : theme.spacing.unit * 1,
        paddingBottom : theme.spacing.unit * 3,
        position      : 'absolute',
        borderRadius  : '10px',
        border        : '2px solid',
        borderColor   : 'primary',
        top           : '50%',
        left          : '50%',
        transform     : 'translate(-50%, -50%)',
        overflowX     : 'auto',
        maxHeight     : '90%',
        overflowY     : 'auto',
    },
    button: {
        color          : 'blue',
        textDecoration : 'underline',
        justifyContent : 'left',
        textAlign      : 'left',
    }
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
                <ButtonBase
                    onClick={this.handleOpen}
                    className={classes.button}
                    focusRipple={true}
                >
                    {value.name}
                </ButtonBase>
                <Modal
                    open={this.state.open}
                    onClose={this.handleClose}
                >
                    <Paper className={classes.paper} elevation={5}>
                        <CodeListFormatter value={value} defineVersion={this.props.defineVersion}/>
                    </Paper>
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
