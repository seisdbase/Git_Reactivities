import React, { useEffect, Fragment,  useContext } from 'react';
import {  Container } from 'semantic-ui-react';
import  ActivityDashboard   from '../../features/activities/dashboard/ActivityDashboard';
import  NavBar from '../../features/nav/NavBar';
import LoadingComponent from './LoadingComponent';
import ActivityStore from '../stores/activityStore';
import { observer } from 'mobx-react-lite';


const App = () => {
  //setup hooks
   const activityStore = useContext(ActivityStore);
 
//Hooks
  useEffect(() => {
    activityStore.loadActivities();     //[] below means Dependecy Array
  }, [activityStore]);

  if (activityStore.loadingInitial) return <LoadingComponent content='Loading activities' />

  //Pass things to Dashboard/Form - temporary solution for small app - will use Mobx for state mgmt 
  return (
    <Fragment>
      <NavBar />
      <Container style={{ marginTop: '7em' }}>
        <ActivityDashboard   />
      </Container>
    </Fragment>
  );
}

export default observer (App);


