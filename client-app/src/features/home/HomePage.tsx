import React, { useContext, Fragment } from 'react';
import { Container, Segment, Header, Button, Image } from 'semantic-ui-react';
import { RootStoreContext } from '../../app/stores/rootStore';
import LoginForm from '../user/LoginForm';
import RegisterForm from '../user/RegisterForm';

const HomePage = () => {
  const rootStore = useContext(RootStoreContext);
  const { user, isLoggedIn } = rootStore.userStore;
  const {openModal} = rootStore.modalStore;
  
  return (
    <Segment inverted textAlign='center' vertical className='masthead'>
      <Container text>
        <Header as='h1' inverted>
          <Image
            size='massive'
            src='/assets/logo.png'
            alt='logo'
            style={{ marginBottom: 12 }}
          />
          Reactivities
        </Header>
        {isLoggedIn && user ? (
          <Fragment>
            <Header as='h2' inverted content={`Welcome back ${user.displayName}`} />
            <Button onClick={() => openModal (<LoginForm />)} size='huge' inverted>
              Go to activities!
            </Button>
          </Fragment>
        ) : (
          <Fragment>
          <Header as='h2' inverted content={`Welcome to Reactivitities`} />
          <Button onClick={() => openModal(<LoginForm />)} size='huge' inverted>
            Login
          </Button>
          <Button onClick={() => openModal(<RegisterForm />)} size='huge' inverted>
            Register
          </Button>
        </Fragment>
        )}
      </Container>
    </Segment>
  );
};

export default HomePage;


// import React, { useContext, Fragment } from 'react'
// import { Container, Segment, Header, Button, Image } from 'semantic-ui-react'
// import { Link } from 'react-router-dom'
// import { RootStoreContext } from '../../app/stores/rootStore'

// export const HomePage = () => {

//      const rootStore = useContext(RootStoreContext);
//      //destructure props from userStore
//      const {isLoggedIn, user} = rootStore.userStore;
     
//     return (
//         <Segment inverted textAlign='center' vertical className='masthead' >
//             <Container text>
//                 <Header as='h1' inverted>
//                     <Image size='massive' src='/assets/logo.png' alt='logo' style={{ marginBottom: 12 }} />
//                         Reactivities
//                     </Header>
//                 <Fragment>
//                     {isLoggedIn && user && <Button as={Link} to='/login' size='huge' inverted>
//                         Take me to the activities!
//                     </Button>}
//                 </Fragment>
//                 <Header as='h2' inverted content='Welcome to Reactivities' />

//             </Container>
//         </Segment>

//     )
// }

// export default HomePage
