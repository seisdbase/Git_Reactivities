import React, { useContext, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import ActivityList  from './ActivityList';
import { observer } from 'mobx-react-lite';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import ActivityStore from '../../../app/stores/activityStore';

//Destructure - allows us to extract multiple pieces of data from an array or object and assign them to their own variable
 const ActivityDashboard: React.FC = () => {

  //setup hooks
  const activityStore = useContext(ActivityStore);
 
  //Hooks
    useEffect(() => {
      activityStore.loadActivities();     //[] below means Dependecy Array
    }, [activityStore]);
  
    if (activityStore.loadingInitial) 
      return <LoadingComponent content='Loading activities' />;

    return (
        <Grid>
            <Grid.Column width={10}>
                <ActivityList   />
            </Grid.Column>

            <Grid.Column width={6}>
                <h2>Activity filters...</h2>
           
            </Grid.Column>
        </Grid>
    );
}

export default observer (ActivityDashboard);