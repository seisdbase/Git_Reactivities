import React, { useContext, useState } from 'react'
import { Tab, Button, Header, Grid } from 'semantic-ui-react'
import { RootStoreContext } from '../../app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import ProfileEditForm from './ProfileEditForm';

const ProfileDescription = () => {
    const rootStore = useContext(RootStoreContext);
    const { editProfile, profile, isCurrentUser } = rootStore.profileStore;
    //Set local state          
    const [editMode, setEditMode] = useState(true);

    return (
        <Tab.Pane>
          <Grid>
            <Grid.Column width={16}>
              <Header
                floated='left'
                icon='user'
                content={`About ${profile!.displayName}`}
              />
              {isCurrentUser && (
                <Button
                  floated='right'
                  basic
                  content={editMode ? 'Cancel' : 'Edit Profile'}
                  onClick={() => setEditMode(!editMode)}
                />
              )}
            </Grid.Column>
            <Grid.Column width={16}>
              {editMode ? (
                <ProfileEditForm editProfile={editProfile} profile={profile!} />
              ) : (
                <span>{profile!.bio}</span>
              )}
            </Grid.Column>
          </Grid>
        </Tab.Pane>
      );
    };
    
    export default observer(ProfileDescription);    

//     return (
//         <Tab.Pane>
//             <Grid>
//                 <Grid.Column width={16} style={{ paddingTop: 0 }}>
//                     <Header>
//                         {isCurrentUser && (
//                             <Button
//                                 as={Link}
//                                 to={`/profileEdit/${profile?.username}`}
//                                 floated='right' basic
//                                 content={editMode ? 'Edit' : 'Cancel'}
//                                 onClick={() => setEditMode(!editMode)}
//                             />
//                         )}
//                         <h2>About {profile!.displayName}</h2>
//                         <p>{profile!.bio} </p>
//                     </Header>
//                 </Grid.Column>
//             </Grid>

//         </Tab.Pane>
//     )
// }

// export default observer(ProfileDescription);