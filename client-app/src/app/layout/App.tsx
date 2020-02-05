import React, { useState, useEffect, Fragment, SyntheticEvent } from 'react';
import {  Container } from 'semantic-ui-react';
// import axios from 'axios';
import { IActivity } from '../models/activity';
import { ActivityDashboard }  from '../../features/activities/dashboard/ActivityDashboard';
import  NavBar from '../../features/nav/NavBar';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';


const App = () => {
  //setup hook
   const [activities, setActivities] = useState<IActivity[]>([]);
   const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);

  
   //Edit mode handler
   const [editMode, setEditMode] = useState(false);

   //Loading Component
   const [loading, setLoading] = useState(true);

   //Submitting componeent for buttons
   const [submitting, setSubmitting] = useState(false);

   //Delete button Loading indicator --> '' represtns target button name
   const [target, setTarget] = useState('');

   const handleSelectActivity = (id: string) => {
    setSelectedActivity(activities.filter(a => a.id === id)[0])
    setEditMode(false);
 }


   //Create Handler
  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMode(true);
  }

  //Create Activity handler
  const handleCreateActivity = (activity: IActivity) => {
    setSubmitting(true);
    //Create resource on server, wait for acknowledgement that it happened
    agent.Activities.create(activity).then(() => {
    //Then process changes on client side  
      setActivities([...activities, activity])
      setSelectedActivity(activity);
      setEditMode(false);
    }).then(() => setSubmitting(false))
  }

 //Edit Activity handler
 const handleEditActivity = (activity: IActivity) => {
  setSubmitting(true);
  agent.Activities.update(activity).then(() => {  
  setActivities([...activities.filter(a => a.id !== activity.id), activity])
  setSelectedActivity(activity);
  setEditMode(false);
  }).then(() => setSubmitting(false))
}

//Delete handler
const handleDeleteActivity = (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
  setSubmitting(true);
  setTarget(event.currentTarget.name)
  agent.Activities.delete(id).then(() => {  
  setActivities([...activities.filter(a => a.id !== id)])
  }).then(() => setSubmitting(false))
}
  
//Hooks
  useEffect(() => {
    agent.Activities.list()
      .then(response => {
        let activities: IActivity[] = [];
        //Lookp thru activities and update date format
        response.forEach((activity) => {
          activity.date = activity.date.split('.')[0];
          activities.push(activity);
        })
        setActivities(response)
      }).then(() => setLoading(false));
  }, []);

     if(loading) return <LoadingComponent content='Loading activities' />

    //Pass things to Dashboard/Form - temporary solution for small app - will use Mobx for state mgmt 
    return (
      <Fragment>
        <NavBar openCreateForm={handleOpenCreateForm} />
        <Container style={{marginTop: '7em'}}>
          <ActivityDashboard 
                         activities={activities}  
                         selectActivity={handleSelectActivity} 
                         selectedActivity={selectedActivity}
                         editMode={editMode}
                         setEditMode={setEditMode}
                         setSelectedActivity={setSelectedActivity}
                         createActivity={handleCreateActivity}
                         editActivity={handleEditActivity}
                         deleteActivity={handleDeleteActivity}
                         submitting={submitting}
                         target={target}
          />
        </Container>
      </Fragment>
    );
}

export default App;


