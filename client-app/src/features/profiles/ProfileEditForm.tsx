import React from 'react'
import {  Form, Button } from 'semantic-ui-react';
import { Form as FinalForm, Field } from 'react-final-form';    //different form from Semantic-UI
import { combineValidators, isRequired } from 'revalidate';
import TextInput from '../../app/common/form/TextInput';
import TextAreaInput from '../../app/common/form/TextAreaInput';
import { observer } from 'mobx-react-lite';
import { IProfile } from '../../app/models/profile';

const validate = combineValidators({
    displayName: isRequired({ message: 'The Display Name is required' }),
})

interface IProps{
    editProfile:(profile: Partial<IProfile>) => void;
    profile: IProfile;
}

const ProfileEditForm: React.FC<IProps> = ({ editProfile, profile }) => {
  return (
    <FinalForm
      onSubmit={editProfile}
      validate={validate}
      initialValues={profile!}
      render={({ handleSubmit, invalid, pristine, submitting }) => (
        <Form onSubmit={handleSubmit} error>
          <Field
            name='displayName'
            component={TextInput}
            placeholder='Display Name'
            value={profile!.displayName}
          />
          <Field
            name='bio'
            component={TextAreaInput}
            rows={3}
            placeholder='Bio'
            value={profile!.bio}
          />
          <Button 
            loading={submitting}
            floated='right'
            disabled={invalid || pristine}
            positive
            content='Update profile'
          />
        </Form>
      )}
    />
  );
};

export default observer(ProfileEditForm);


// interface RouteParams {
//     username:string
// }

// interface IProps extends RouteComponentProps<RouteParams>{
// }

// const ProfileEditForm: React.FC<IProps> = ({
//       match, 
//       history
//   }) => {

//     const rootStore = useContext(RootStoreContext);
//     const { loadingProfile,
//             profile,
//             loadProfile,
//             editProfile,
//     } = rootStore.profileStore;

//     const{ user } = rootStore.userStore;

//     //The Effect Hook lets you perform side effects in function components
//     //By using this Hook, you tell React that your component needs to do something after render.
//     //Careful useEffect hook runs every time component is loaded     
//     //useEffect = 3 lifecycles = componentDidMount + componentDidUnmount + componentWillUnmount

//     useEffect(() => {
//       if (match.params.username) {
//         loadProfile(match.params.username);
//       }
//     }, 
//     [ loadProfile,
//       match.params.username,
//     ])

//     //submit for Final Form
//     const handleFinalFormSubmit = (values: any) => {
//       const { ...profile } = values;
//       editProfile(profile);
//         //DisplayName changes on NavBar
//         runInAction(() => {
//           user!.displayName=profile.displayName;
//         });
//     }
    
//       return (
//       <Grid>
//         <Grid.Column width={10}>
//           {/* need clearing d/t buttons so we stick loading indicator on the form*/}
//           <Segment clearing>
//             <FinalForm
//               validate={validate}
//               initialValues={profile!}
//               onSubmit={handleFinalFormSubmit}
//                   //destructure handleSubmit for the rendering
//                 render={({ handleSubmit, invalid, pristine, submitting }) => (
//                 <Form onSubmit={handleSubmit} loading={loadingProfile}>
//                   <Field
//                     name='displayName'
//                     placeholder='Display Name'
//                     value={profile!.displayName}
//                     component={TextInput}
//                   />
//                   <Field
//                     name='bio'
//                     placeholder='Bio'
//                     rows={5}
//                     value={profile?.bio}
//                     component={TextAreaInput}
//                   />
//                   <Button
//                     loading={submitting}  //Submitting is loading indicator for FF
//                   disabled={loadingProfile || invalid || pristine}
//                     floated='right'
//                     positive type='submit'
//                     content='Update profile' />
//                   <Button
//                     //History object (React Router) keeps track of locations visited; push pushes into hitory stack
//                     onClick={profile?.username
//                       ? () => history.push(`/profiles/${profile.username}`)
//                       : () => history.push('/activities/')}
//                     disabled={loadingProfile}
//                     floated='right'
//                     type='button'
//                     content='Cancel' />
//                 </Form>
//               )}
//             />
//           </Segment>
//         </Grid.Column>
//       </Grid>
//       )
// }

//  export default observer (ProfileEditForm);