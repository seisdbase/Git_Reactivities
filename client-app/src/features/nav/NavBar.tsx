import React from 'react';
import { Menu, Container, Button } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';
import { NavLink } from 'react-router-dom';


const NavBar: React.FC = () => {
    return (
        <Menu fixed='top' inverted>
            <Container>
                <Menu.Item header  as={NavLink} exact to='/'>
                    <img src="/assets/logo.png" alt="logo" style={{marginRight: '10px'}} />
                    Reactivities
                </Menu.Item>
                <Menu.Item name='Activities' as={NavLink} to='/activities' />
                    <Button 
                        as={NavLink} to='/createActivity'
                        positive
                        content='Create Activity'
                    />
                    {/* <Button onClick={activityStore.openCreateForm} positive content='Create Activity' /> */}
                
            </Container>
        </Menu>
    );
}
export default observer(NavBar);

