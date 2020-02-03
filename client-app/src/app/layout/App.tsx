import React, { useState, useEffect, Fragment } from 'react';
import {  Container } from 'semantic-ui-react';
import axios from 'axios';
import { IActivity } from '../models/activity';
import { ActivityDashboard }  from '../../features/activities/dashboard/ActivityDashboard';
import  NavBar from '../../features/nav/NavBar';


const App = () => {
  //setup hook
   const [activities, setActivities] = useState<IActivity[]>([]);
   const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);

   const handleSelectActivity = (id: string) => {
      setSelectedActivity(activities.filter(a => a.id === id)[0])
      setEditMode(false);
   }

   //Edit mode handler
   const [editMode, setEditMode] = useState(false);

   //Create Handler
  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMode(true);
  }

  //Create Activity handler
  const handleCreateActivity = (activity: IActivity) => {
    setActivities([...activities, activity])
    setSelectedActivity(activity);
    setEditMode(false);
 }

 //Edit Activity handler
 const handleEditActivity = (activity: IActivity) => {
  setActivities([...activities.filter(a => a.id !== activity.id), activity])
  setSelectedActivity(activity);
  setEditMode(false);
}

//Delete handler
const handleDeleteActivity = (id: string) => {
  setActivities([...activities.filter(a => a.id !== id)])
}


  
   useEffect(() => {
     axios
     .get<IActivity[]>('http://localhost:5000/api/activities')
     .then(response => {
       let activities:IActivity[] = [];
        //Lookp thru activities and update date format
        response.data.forEach(activity => {
            activity.date = activity.date.split('.')[0];
            activities.push(activity);
        })

       setActivities(response.data)
       });
     }, []);

    //Pass things to Dashboard - temporary solution for small app - will use Mobx for state mgmt 
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
          />
        </Container>
      </Fragment>
    );
}

export default App;


