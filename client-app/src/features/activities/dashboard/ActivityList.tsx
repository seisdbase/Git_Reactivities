import React, { SyntheticEvent } from 'react'
import { Item, Button, Label, Segment } from 'semantic-ui-react'
import { IActivity } from '../../../app/models/activity'


interface IProps{
    activities: IActivity[];
    selectActivity: (id: string) => void; 
    deleteActivity:(event: SyntheticEvent<HTMLButtonElement>, id:string) => void;
    submitting: boolean;
    target: string;
}

export const ActivityList: React.FC<IProps> = ({ 
    //destructired props
    activities,
    selectActivity,
    deleteActivity,
    submitting,
    target
}) => {
    return (
        <Segment clearing>
            <Item.Group devided>
                {activities.map(activity => (
                    <Item key={activity.id}>
                        <Item.Content>
                            <Item.Header as='a'>{activity.title}</Item.Header>
                            <Item.Meta>Date</Item.Meta>
                            <Item.Description>
                                <div>{activity.description}</div>
                                <div>{activity.city}, {activity.venue}</div>
                            </Item.Description>
                            <Item.Extra>
                                <Button onClick={() => selectActivity(activity.id)} 
                                                      floated='right' 
                                                      content='View' 
                                                      color='blue' 
                                                      />
                                                      
                                <Label basic content={activity.category} />

                                <Button 
                                    name={activity.id}
                                    loading={target === activity.id && submitting}
                                    onClick={(event) => deleteActivity(event, activity.id)}
                                    floated='right'
                                    content='Delete'
                                    color='red'
                                />
                                                      
                                <Label basic content={activity.category} />
                            </Item.Extra>
                        </Item.Content>
                    </Item>

                ))}
            </Item.Group>
        </Segment>
    )
}
