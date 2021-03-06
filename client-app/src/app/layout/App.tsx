import React, { Fragment, useContext, useEffect } from 'react';
import { Container } from 'semantic-ui-react';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import NavBar from '../../features/nav/NavBar';
import { observer } from 'mobx-react-lite';
import { Route, withRouter, RouteComponentProps, Switch } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/dashboard/details/ActivityDetails';
import NotFound from './NotFound';
import { ToastContainer } from 'react-toastify';
import { RootStoreContext } from '../stores/rootStore';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';
import ProfilePage from '../../features/profiles/ProfilePage';
import PrivateRoute from './PrivateRoute';

console.log("IN App.tsx---------------------------------------starting" )

//App file that usually is the main React component
const App: React.FC<RouteComponentProps> = ({ location }) => {
  
  //Retrieve token
  const rootStore = useContext(RootStoreContext);
  //Destructure commonStore variables
  const { setAppLoaded, token, appLoaded } = rootStore.commonStore;
  //If we have token, get user from API
  const { getUser } = rootStore.userStore;

  //Replaces componenetDidMount,componenetDidUnmount,componenetDidUpdate
  useEffect(() => {
    if (token) {
      getUser().finally(() => setAppLoaded());    //Axios interceptor in agent.ts will take care of getting the token
    } else {
      setAppLoaded()
    }
  }, [getUser, setAppLoaded, token])
  //dont forget the dependencies [] - otherwise it keep re-rendering if component touches this

    console.log("IN App.tsx---------------------------------------processing" )
  

  if (!appLoaded) return <LoadingComponent content='Loading app...' />

  //Pass things to Dashboard/Form - temporary solution for small app - will use Mobx for state mgmt 
  return (
    <Fragment>
      <ModalContainer />
      <ToastContainer position='bottom-right' />
      <Route exact path='/' component={HomePage} />
      <Route
        path={'/(.+)'}
        render={() => (
          <Fragment>
            <NavBar />
            <Container style={{ marginTop: '7em' }}>
              <Switch>
                <PrivateRoute exact path='/activities/' component={ActivityDashboard} />
                <PrivateRoute path='/activities/:id' component={ActivityDetails} />
                <PrivateRoute
                  key={location.key}
                  path={['/createActivity', '/manage/:id']}
                  component={ActivityForm}
                />
                <PrivateRoute path='/profiles/:username' component={ProfilePage} />
                {/* <PrivateRoute path='Login' component={LoginForm} /> */}
                <Route component={NotFound} />
              </Switch>
            </Container>
          </Fragment>
        )}
      />
    </Fragment>
  );
}
//withRouter adds routing properties to our App component
export default withRouter(observer(App));


