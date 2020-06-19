import React, {useState, useContext, useEffect} from 'react'
import { Segment, Form, Button, Grid } from 'semantic-ui-react'
import {  ActivityFormValues } from '../../../app/models/activity'
import { observer } from 'mobx-react-lite';
import { RouteComponentProps } from 'react-router-dom';
import { Form as FinalForm, Field } from 'react-final-form';    //different form from Semantic-UI
import TextInput   from '../../../app/common/form/TextInput';
import TextAreaInput from '../../../app/common/form/TextAreaInput';
import SelectInput from '../../../app/common/form/SelectInput';
import { category } from '../../../app/common/options/categoryOptions';
import DateInput from '../../../app/common/form/DateInput';
import { combineDateAndTime } from '../../../app/common/util/util';
import uuid from 'uuid';
import { combineValidators, isRequired, composeValidators, hasLengthGreaterThan } from 'revalidate';
import { RootStoreContext } from '../../../app/stores/rootStore';

const validate = combineValidators({
  title: isRequired({message:'The event title is required'}), 
  category: isRequired('Category'), 
  description: composeValidators( isRequired ('Description'),
    hasLengthGreaterThan(4)('Must be at least 5 chars')
  )(),
  city: isRequired('City'),
  venue: isRequired('Venue'),
  date: isRequired('date'),
  time: isRequired('time')
})

interface DetailParams {
    id: string;
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({
  match,               
  history
}) => {

    const rootStore = useContext(RootStoreContext);
    //Get these from activityStore
    const { submitting,
            loadActivity,
            createActivity,
            editActivity,
    } = rootStore.activityStore;

    //useState is a hook to make our form stateful
    //useState returns a pair: activity is current value; setActivity is function
    const [activity, setActivity] = useState(new ActivityFormValues());

    //Loading indicator, set loading to false
    const [loading, setLoading] = useState(false);

    //The Effect Hook lets you perform side effects in function components
    //By using this Hook, you tell React that your component needs to do something after render.
    //Careful useEffect hook runs every time component is loaded     
    //useEffect = 3 lifecycles = componentDidMount + componentDidUnmount + componentWillUnmount
   
    useEffect(() => {
      if (match.params.id) {
        setLoading(true);
         //returns  @action loadActivity from activityStore
        loadActivity(match.params.id).then(
          (activity) => setActivity(new ActivityFormValues(activity)))
          .finally(() => setLoading(false));
      }
    }, 
    //remember we need to clean up the dependencies
    //it will  only run on change of loadActivity + match.params.id
    [
      loadActivity,
      match.params.id
    ]);

    //submit for Final Form
    const handleFinalFormSubmit = (values: any) => {
      const dateAndTime = combineDateAndTime(values.date, values.time);
      //Emit properties from object using spread operator
      const { date, time, ...activity } = values;
      activity.date = dateAndTime;
      //generating newActivity on the client hence have id
      if (!activity.id) {
        let newActivity = {
          ...activity,
          id: uuid()
        };
        //both in: activityStore.cs
        createActivity(newActivity);
      } else {
        editActivity(activity);
      }
    }

    return (
      <Grid>
        <Grid.Column width={10}>
          {/* need clearing d/t buttons so we strick loading indicator on the form*/}
          <Segment clearing>
            <FinalForm
              validate={validate}
              initialValues={activity}
              onSubmit={handleFinalFormSubmit}
              //destructure handleSubmit for the rendering
              render={({ handleSubmit, invalid, pristine }) => (
                <Form onSubmit={handleSubmit} loading={loading}>
                  <Field
                    name='title'
                    placeholder='Title'
                    value={activity.title}
                    component={TextInput}

                  />
                  <Field
                    name='description'
                    placeholder='Description'
                    rows={3}
                    value={activity.description}
                    component={TextAreaInput}
                  />
                  <Field
                    component={SelectInput}
                    options={category}
                    name='category'
                    placeholder='Category'
                    value={activity.category}
                  />
                  <Form.Group widths='equal'>
                    <Field
                      component={DateInput}
                      name='date'
                      date={true}
                      placeholder='Date'
                      value={activity.date}
                    />

                    <Field
                      component={DateInput}
                      name='time'
                      time={true}
                      placeholder='Date'
                      value={activity.date}
                    />
                  </Form.Group>

                  <Field
                    component={TextInput}
                    name='venue'
                    placeholder='Venue'
                    value={activity.venue}
                  />
                  <Field
                    component={TextInput}
                    name='city'
                    placeholder='City'
                    value={activity.city}
                  />
                  <Button
                    loading={submitting}
                    disabled={loading || invalid || pristine}
                    floated='right'
                    positive type='submit'
                    content='Submit' />
                  <Button
                    onClick={activity.id
                      ? () => history.push(`/activities/${activity.id}`)
                      : () => history.push('/activities')}
                    disabled={loading}

                    floated='right'
                    type='button'
                    content='Cancel' />
                </Form>
              )}
            />
          </Segment>
        </Grid.Column>
      </Grid>
  )
}

//this watches over changes in activityStore
export default observer(ActivityForm);
