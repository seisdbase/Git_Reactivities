import React, { useContext } from 'react';
import { Grid } from 'semantic-ui-react';
import { ActivityList } from './ActivityList';
import { ActivityDetails } from './details/ActivityDetails';
import ActivityForm  from '../form/ActivityForm';
import { observer } from 'mobx-react-lite';
import ActivityStore from  '../../../app/stores/activityStore';


//Destructure - allows us to extract multiple pieces of data from an array or object and assign them to their own variable
export const ActivityDashboard: React.FC = () => {

    const activityStore = useContext(ActivityStore);
    //Destructure what comes from ActivityStore
    const {editMode, selectedActivity} = activityStore;

    return (
        <Grid>
            <Grid.Column width={10}>
                <ActivityList   />
            </Grid.Column>

            <Grid.Column width={6}>
                {selectedActivity && !editMode && (
                    <ActivityDetails />
                )}
                {editMode && (
                    <ActivityForm
                        key={(selectedActivity && selectedActivity.id) || 0}
                        activity={selectedActivity!} 
                    />
                )}
            </Grid.Column>
        </Grid>
    );
}

export default observer (ActivityDashboard);