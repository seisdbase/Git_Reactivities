import React, { useContext, useEffect } from 'react';
import {  Grid } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';
import { RouteComponentProps } from 'react-router';
import  LoadingComponent from '../../../../app/layout/LoadingComponent';
import ActivityDetailedHeader from './ActivityDetailedHeader';
import ActivityDetailedInfo from './ActivityDetailedInfo';
import ActivityDetailedChat from './ActivityDetailedChat';
import ActivityDetailedSidebar from './ActivityDetailedSidebar';
import { RootStoreContext } from '../../../../app/stores/rootStore';

//Get id from App.tsx -->  <Route path='/activities/:id' component={ActivityDetails}  />
interface DetailParams {
    id:string    
}

//Desturcture IProps
const ActivityDetails: React.FC<RouteComponentProps<DetailParams>> = ({
    match,
    history
  }) => {
    const rootStore = useContext(RootStoreContext);
    const { activity, loadActivity, loadingInitial } = rootStore.activityStore;
  
    //---------------------------------------------------------------------------
     //useEffect Hook --> We want effect from React when the component mounts
     //Loading activity from API and stores it 'activity' just above
    
     useEffect(() => {
      loadActivity(match.params.id);
    }, [loadActivity, match.params.id, history]);
    
    //loadActivty to be run once when we mount this component --> dependency array
    //If leave off dependencies it would run every time component is loaded
  //---------------------------------------------------------------------------


    //Loading indicator  
    if (loadingInitial)
      return <LoadingComponent content='Loading activity...' />;

    if (!activity)      
      return <h2>Activity not found</h2>
  
    return (
      <Grid>
        <Grid.Column width={10}>
          <ActivityDetailedHeader  activity={activity}/>
          <ActivityDetailedInfo  activity={activity} />
          <ActivityDetailedChat />
        </Grid.Column>
        <Grid.Column width={6}>
          <ActivityDetailedSidebar />
        </Grid.Column>
      </Grid>
    );
  };

export default observer(ActivityDetails);
