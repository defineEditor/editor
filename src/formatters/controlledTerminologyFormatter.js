import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import List, { ListItem } from 'material-ui/List';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';

const styles = theme => ({
    mainPart: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
    },
});

class ControlledTerminologyFormatter extends React.Component {

    getControlledTerminologies = () => {
        let standards = this.props.standards;
        let ctList = Object.keys(standards)
            .filter(standardOid => {
                return (standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT');
            })
            .map(standardOid => {
                return (
                    <ListItem dense key={standardOid}>
                        {standards[standardOid].description}
                    </ListItem>
                );
            });
        return ctList;
    };

    render () {
        const { classes } = this.props;
        //const { protocolName, studyName, studyDescription } = globalVariables;
        return (
            <Paper className={classes.mainPart} elevation={4}>
                <Typography variant="headline" component="h3">
                    CDISC Controlled Terminologies
                    <FormattingControlIcons onEdit={this.props.onEdit} />
                </Typography>
                <List>
                    {this.getControlledTerminologies()}
                </List>
            </Paper>
        );
    }
}

ControlledTerminologyFormatter.propTypes = {
    standards : PropTypes.object.isRequired,
    classes   : PropTypes.object.isRequired,
    onEdit    : PropTypes.func.isRequired,
    onComment : PropTypes.func,
};

export default withStyles(styles)(ControlledTerminologyFormatter);
