import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {
    updateStudy,
    deleteStudy,
} from 'actions/index.js';

const styles = theme => ({
    card: {
    },
    title: {
        marginBottom : 16,
        fontSize     : 14,
    },
});

const mapDispatchToProps = dispatch => {
    return {
        updateStudy : (updateObj) => dispatch(updateStudy(updateObj)),
        deleteStudy : (studyId) => dispatch(deleteStudy(studyId)),
    };
};

class ConnectedStudyTile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            study: { ...this.props.study }
        };
    }

    updateStudy = () => {
        this.props.updateStudy({ studyId: this.props.study.id, properties: { ...this.state.study } });
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Card className={classes.card} raised={true} >
                    <CardActions>
                        <Button size="small">Edit</Button>
                        <Button size="small" onClick={() => this.props.deleteStudy(this.state.study.id)}>Delete</Button>
                    </CardActions>
                    <CardContent>
                        <Typography className={classes.title} component='h2'>
                            {this.state.study.name}
                        </Typography>
                        <Typography color="textSecondary" component='p'>
                            Last changed: {this.state.study.lastChanged.toISOString().substr(0,16).replace('T',' ')}
                        </Typography>
                        <Typography variant="headline" component='p'>
                            Summary
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        );
    }
}

ConnectedStudyTile.propTypes = {
    classes     : PropTypes.object.isRequired,
    study       : PropTypes.object.isRequired,
    updateStudy : PropTypes.func.isRequired,
    deleteStudy : PropTypes.func.isRequired,
};

const StudyTile = connect(undefined, mapDispatchToProps)(ConnectedStudyTile);
export default withStyles(styles)(StudyTile);
