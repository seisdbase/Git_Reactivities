import React, { useContext, useState } from 'react'
import { Tab, Header, Card, Image, Button, Grid } from 'semantic-ui-react'
import { RootStoreContext } from '../../app/stores/rootStore';
import PhotoUploadWidget from '../../app/common/photoUpload/PhotoUploadWidget';
import { observer } from 'mobx-react-lite';

interface IProps {
    loading: boolean;
    uploadPhoto: (file: Blob) => void;
  }

const ProfilePhotos = () => {
    const rootStore = useContext(RootStoreContext);
    const {profile, isCurrentUser, uploadPhoto, uploadingPhoto, setMainPhoto, deletePhoto, loading} = rootStore.profileStore;
    //Local state to trigger to toggle Add Photo Mode
    const [addPhotoMode, setAddPhotoMode] = useState(true);

    //Local state to identify button that was clicked
    const[target, setTarget] = useState<string | undefined>(undefined);

    //turn off widget when image was uploaded
    const handleUploadImage = (photo: Blob) => {
        uploadPhoto(photo).then(() => setAddPhotoMode(false));
      };
    
    //Local state for delete button
    const [deleteTarget, setDeleteTarget] = useState<string | undefined>(
        undefined
      );

    return (
        <Tab.Pane>
            <Grid>
                <Grid.Column width={16} style={{ paddingBottom: 0 }}>
                    <Header
                        floated='left'
                        icon='image'
                        content='Photos' />
                    {isCurrentUser && (
                        <Button 
                            floated='right' basic
                            content={addPhotoMode ? 'Cancel' : 'Add Photo'}
                            onClick={() => setAddPhotoMode(!addPhotoMode)}
                        />
                    )}
            </Grid.Column>
            <Grid.Column  width={16}>
                {addPhotoMode ? (
                    <PhotoUploadWidget uploadPhoto={handleUploadImage} loading={uploadingPhoto} />
                ) : (
                        <Card.Group itemsPerRow={5}>
                            {profile && 
                              profile.photos.map((photo) => (
                                <Card key={photo.id}>
                                    <Image src={photo.url} />
                                    {isCurrentUser &&
                                       <Button.Group fluid widths={2}>
                                           <Button
                                                name={photo.id}
                                                //have loading indic spin only on button clicked
                                                onClick={(e) => {
                                                    setMainPhoto(photo);
                                                    setTarget(e.currentTarget.name)
                                                }}
                                                disabled={photo.isMain}
                                                loading={loading && target === photo.id}
                                                basic positive 
                                                content='Main'/>
                                            <Button
                                                name={photo.id}
                                                disabled={photo.isMain}
                                                onClick={(e) => {
                                                    deletePhoto(photo);
                                                    setDeleteTarget(e.currentTarget.name)
                                                }}
                                                loading={loading && deleteTarget === photo.id}
                                                basic
                                                negative
                                                icon='trash'
                                                />
                                       </Button.Group>
                                    }
                                </Card>
                            ))}
                        </Card.Group>
                    )}
            </Grid.Column>
          </Grid>
        </Tab.Pane>
    )
}
export default observer(ProfilePhotos);