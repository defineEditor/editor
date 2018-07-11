import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ListSubheader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import withWidth from '@material-ui/core/withWidth';
import NavigationBar from 'core/navigationBar.js';
import StudyTile from 'core/studyTile.js';
import { Study } from 'core/mainStructure.js';
import getOid from 'utils/getOid.js';
import {
    addStudy,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        display         : 'flex',
        flexWrap        : 'wrap',
        justifyContent  : 'flex-start',
        alignItems      : 'flex-start',
        backgroundColor : theme.palette.grey[50],
        minHeight          : 'calc(100vh -  ' + (theme.spacing.unit * 7).toString() + 'px)',
        marginTop       : theme.spacing.unit * 7,
    },
    gridList: {
        width: '100%',
    },
    gridTile: {
        width: 100,
    },
});

const mapStateToProps = state => {
    return {
        studies: state.studies,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addStudy: (study) => dispatch(addStudy(study)),
    };
};

const widthCols = {
    sm : 3,
    md : 4,
    lg : 6,
};

class ConnectedStudies extends React.Component {

    addStudy = () => {
        let id = getOid('Study', undefined, this.props.studies.studyOrder);
        let study = new Study({id, name: ''});
        this.props.addStudy({ ...study });
    }

    getStudies = (asses) => {
        let studies = this.props.studies.byId;
        return Object.keys(studies).map(studyId => {
            let study = studies[studyId];
            return (
                <GridListTile key={study.id} className={this.props.classes.gridTile}>
                    <StudyTile study={study}/>
                </GridListTile>
            );
        });
    }

    render() {
        const { classes, width } = this.props;
        let studyNum = Object.keys(this.props.studies.byId).length;
        let subHeaderText;
        if (studyNum === 0) {
            subHeaderText = 'No Studies';
        } else if (studyNum === 1) {
            subHeaderText = '1 Study';
        } else {
            subHeaderText = studyNum.toString() + ' Studies';
        }

        let cols = widthCols[width];

        return (
            <React.Fragment>
                <NavigationBar/>
                <div className={classes.root}>
                    <GridList cellHeight={200} className={classes.gridList} cols={cols} spacing={8}>
                        <GridListTile key='subheader' style={{ height: '40px', textAlign: 'center' }} cols={cols}>
                            <ListSubheader component="div">{subHeaderText}</ListSubheader>
                        </GridListTile>
                        {this.getStudies()}
                        <GridListTile key='addStudy'>
                            <Button size="small" onClick={this.addStudy}>Add New Study</Button>
                        </GridListTile>
                    </GridList>
                </div>
            </React.Fragment>
        );
    }
}

ConnectedStudies.propTypes = {
    classes  : PropTypes.object.isRequired,
    studies  : PropTypes.object.isRequired,
    width    : PropTypes.string.isRequired,
    addStudy : PropTypes.func.isRequired,
};

const Studies = connect(mapStateToProps, mapDispatchToProps)(ConnectedStudies);
export default withWidth()(withStyles(styles)(Studies));
