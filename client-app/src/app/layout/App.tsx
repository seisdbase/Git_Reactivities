import React, {  Fragment } from 'react';
import {  Container } from 'semantic-ui-react';
import  ActivityDashboard   from '../../features/activities/dashboard/ActivityDashboard';
import  NavBar from '../../features/nav/NavBar';
import { observer } from 'mobx-react-lite';
import { Route, withRouter, RouteComponentProps, Switch } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/dashboard/details/ActivityDetails';
import NotFound from './NotFound';
import { ToastContainer} from 'react-toastify';

//App file that usually is the main React component
const App: React.FC<RouteComponentProps> = ({location}) => {

  //Pass things to Dashboard/Form - temporary solution for small app - will use Mobx for state mgmt 
  return (
    <Fragment>
      <ToastContainer position='bottom-right'/>
      <Route exact path='/' component={HomePage} />
      <Route
        path={'/(.+)'}
        render={() => (
          <Fragment>
            <NavBar />
            <Container style={{ marginTop: '7em' }}>
              <Switch>
                <Route exact path='/activities/' component={ActivityDashboard} />
                <Route path='/activities/:id' component={ActivityDetails} />
                <Route
                  key={location.key}
                  path={['/createActivity', '/manage/:id']}
                  component={ActivityForm}
                />
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
export default withRouter(observer (App));


