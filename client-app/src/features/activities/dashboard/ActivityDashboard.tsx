import React, { useContext, useEffect, useState } from 'react';
import { Grid, Loader } from 'semantic-ui-react';
import ActivityList from './ActivityList';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '../../../app/stores/rootStore';
import InfiniteScroll from 'react-infinite-scroller';
import ActivityFilters from './ActivityFileters';
import ActivityListItemPlaceholder from './ActivityListItemPlaceholder';

//Destructure - allows us to extract multiple pieces of data from an array or object and assign them to their own variable
const ActivityDashboard: React.FC = () => {

  //setup hooks
  const rootStore = useContext(RootStoreContext);
  const { loadActivities, loadingInitial, setPage, page, totalPages } = rootStore.activityStore;
  //local state to track loading of next batch of activities
  const [loadingNext, setLoadingNext] = useState(false);

  //handler to laod next batch
  const handleGetNext = () => {
    setLoadingNext(true);
    setPage(page + 1);
    loadActivities().then(() => setLoadingNext(false));
  }

  //Hooks
  useEffect(() => {
    loadActivities();     //[] below means Dependecy Array
  }, [loadActivities]);

  return (
    <Grid>
      <Grid.Column width={10}>
        {loadingInitial && page === 0 ? (
        <ActivityListItemPlaceholder /> 
        ) : (
          <InfiniteScroll
          pageStart={0}
          loadMore={handleGetNext}
          /* Make sure not to load duplicates */
          hasMore={!loadingNext && page + 1 < totalPages}
          initialLoad={false}
        >
        <ActivityList />
      </InfiniteScroll>
      )}
      </Grid.Column>
      <Grid.Column width={6}>
        <ActivityFilters></ActivityFilters>
      </Grid.Column>
      <Grid.Column width={10}>
        <Loader active={loadingNext}></Loader>
      </Grid.Column>
    </Grid>
  );
}

export default observer(ActivityDashboard);