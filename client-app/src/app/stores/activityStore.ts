//activityStore.ts
// MobX provides the mechanism to STORE and update the application STATE that
// React then uses.
import {observable, action, computed, runInAction, reaction, toJS} from 'mobx';
import { SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';
import { history } from '../..';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';
import { setActivityProps, createAttendee } from '../common/util/util';
import {HubConnection, HubConnectionBuilder, LogLevel} from '@microsoft/signalr';

const LIMIT = 2;

export default class ActivityStore { 
  rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    // --we need to react to our predicate changing, so that we load activities based
    // --on filter that we r sending to the API
    // --we need to use Mobx REACTION based on whether predicate keys have changed

    reaction(
      () => this.predicate.keys(),
      () => {
        this.page = 0;
        this.activityRegistry.clear();
        this.loadActivities();
      }
    )
  }

  // observable.map(values?) creates a dynamic keyed observable map. 
  // Observable maps are very useful if you don't want to react just to
  // the change of a specific entry, but also to the addition or removal of entries.
  // Optionally takes an object, entries array or string keyed ES6 map with 
  // initial values.

  @observable activityRegistry = new Map();

  @observable activity: IActivity | null = null;
  @observable loadingInitial = false;
  @observable submitting = false;
  @observable target = "";
  @observable loading = false;
  @observable.ref hubConnection: HubConnection | null = null ;
  @observable activityCount = 0;
  @observable page = 0;
  @observable predicate = new Map();

  //relates to: Agent.ts Activities: list
  @action setPredicate =(predicate: string, value: string | Date) => {
    this.predicate.clear();
    if(predicate !== 'all') {
      this.predicate.set(predicate, value);
    }
  }

  //relates to: setPredicate
  @computed get axiosParams() {
    const params = new URLSearchParams();
    //params has key/value pairs
    params.append('limit', String(LIMIT));
    params.append('offset', `${this.page ? this.page * LIMIT : 0 }`);

    this.predicate.forEach((value, key) => {
      if(key === 'startDate') {
        params.append(key, value.toISOString())
      } else {
          params.append(key, value)
        }
      })
     return params;
  }

  //Paging
  @computed get totalPages() {
    return Math.ceil(this.activityCount / LIMIT);
  }

  @action setPage =(page: number) => {
    this.page = page;
  }

  //SignalR
  @action createHubConnection = (activityId: string) => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_API_CHAT_URL!, {
        //set this to commonStore token
        //nomrally we sent our bearer token as part of Http header but this is a new protocol
        //and hence it will send bearer token as part of query string --> Startup.cs context.Request.Query
        //"access_token" is the key to be sent out
        accessTokenFactory: () => this.rootStore.commonStore.token!
      })
      //Get maximum info
      .configureLogging(LogLevel.Information)
      //Build connection
      .build();

    this.hubConnection
      .start()
      .then(() => console.log(this.hubConnection!.state))
      .then(() => {
        this.hubConnection!.invoke('AddToGroup', activityId)
      })
      .catch(error => console.log('Error establishing connection: ', error));

    this.hubConnection.on('ReceiveComment', comment => {
      runInAction(() => {
        //activity.ts
        this.activity!.comments.push(comment)
      })
    })

    this.hubConnection.on('Send', message => {
       toast.info(message);
    })
  };

  //SignalR
  @action stopHubConnection = () => {
    this.hubConnection!.invoke('RemoveFromGroup', this.activity!.id)
       .then(() => {
         //Stop conn only after the remove method has completed
        this.hubConnection!.stop()
       })
       .then(() => console.log('Connection stopped'))
       .catch(err => console.log(err))
  }

  @action addComment = async (values: any) => {
    values.activityId = this.activity!.id;  //see Create.cs
    try {
      //Invokation directly on the server - wt Axios
      await this.hubConnection!.invoke('SendComment', values)  //SendComment - see ChatHub
    } catch (error) {
      console.log(error);
    }
  } 


  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    );
  }

  //Group activities by date for the @computed above
  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivities = activities.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    return Object.entries(
      sortedActivities.reduce((activities, activity) => {
        const date = activity.date.toISOString().split("T")[0];
        //Ternary operator
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
        //Define type
      }, {} as { [key: string]: IActivity[] })
    );
  }

  //Load activities
  //bring the observable and pass it to action
  @action loadActivities = async () => {
    //Mutating state, cant do in Redux
    this.loadingInitial = true;
    //Get reference to the user; ! sign means no way it is null
    try {
      //Receive activities from server
      //get it from API, remember await hence ASYNC needs runInAction
      const activitiesEnvelope = await agent.Activities.list(this.axiosParams);
      //desctructure the above
      const{activities, activityCount} = activitiesEnvelope;

      runInAction("loading activities", () => {
        activities.forEach((activity) => {
          //! sign means no way it is null
          setActivityProps(activity, this.rootStore.userStore.user!);
          this.activityRegistry.set(activity.id, activity);
        });
        this.activityCount = activityCount;
        this.loadingInitial = false;
      });
      //Check activity arrays being passed
      //console.log(this.groupActivitiesByDate(activities));
    } catch (error) {
      runInAction("load activities error", () => {
        this.loadingInitial = false;
      });
      console.log(error);
    }
  };

  //async means gonna be returned as promise
  @action loadActivity = async (id: string) => {
     //get it from cache memory, this is an OBSERVABLE from activity.Registry.get
     //we get this and create in ActivityForm.tsx useState(new ActivityFormValues())
     //then when it gets to activity.ts it will become a problem since init.time is stll an observable
         //  if (init && init.date) {
         //  init.time = init.date
    //we dont want init.time be an observable but a simple JS object   
    //hence: we use in Mobx a method to do just that by using toJS 
    let activity: any = this.getActivity(id);
    if (activity) {
      this.activity = activity;
      return toJS(activity);
    } else {
      this.loadingInitial = true;
      try {
        //get it from API, remember await needs runInAction
        //this is a simple JS OBJECT
        activity = await agent.Activities.details(id);
        runInAction("getting activity", () => {
          setActivityProps(activity, this.rootStore.userStore.user!);
          this.activity = activity;
          this.activityRegistry.set(activity.id, activity);
          this.loadingInitial = false;
        });
        return activity;
      } catch (error) {
        runInAction("load activity error", () => {
          this.loadingInitial = false;
        });
        console.log(error);
      }
    }
  };

  @action clearActivity = () => {
    this.activity = null;
  };

  // Method to get activity
  getActivity = (id: string) => {
    this.activityRegistry.get(id);
  };

  //Create Activity
  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      //Server side creation
      await agent.Activities.create(activity);
      //Replicating on client what shape our data has on the server
      const attendee = createAttendee(this.rootStore.userStore.user!);
      attendee.isHost = true;
      //create attendee array
      let attendees = [];
      attendees.push(attendee);
      activity.attendees = attendees;
      activity.comments=[];
      activity.isHost = true;

      runInAction("create activities", () => {
        this.activityRegistry.set(activity.id, activity);
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      runInAction("create activities", () => {
        this.submitting = false;
      });
      toast.error("Problem submitting data");
      console.log(error.response);
    }
  };

  //Edit activity - update
  //  runInAction is a simple utility that takes an code block
  //  and executes in an (anonymous) action. This is useful 
  //  to create and execute actions on the fly, for example 
  //  inside an asynchronous process.

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction("edit activities", () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      runInAction("edit activities error", () => {
        this.submitting = false;
      });
      toast.error("Problem submitting data");
      console.log(error);
    }
  };

  //DeleteActivity
  @action deleteActivity = async (
    event: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    this.submitting = true;
    this.target = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      runInAction("delete activities", () => {
        this.activityRegistry.delete(id);
        this.submitting = false;
        this.target = "";
      });
    } catch (error) {
      runInAction("delete activities error", () => {
        this.submitting = false;
        this.target = "";
      });
      console.log(error);
    }
  };

  //Create attendees array via array in util.cs
  @action attendActivity = async () => {
    const attendee = createAttendee(this.rootStore.userStore.user!);
    this.loading = true;
    try {
      await agent.Activities.attend(this.activity!.id);
      runInAction(() => {
        if (this.activity) {
          this.activity.attendees.push(attendee);
          this.activity.isGoing = true;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.loading = false;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      toast.error("Problem signing up to activity");
    }
  };

  @action cancelAttendance = async () => {
    this.loading = true;
    try {
      await agent.Activities.unattend(this.activity!.id);
      runInAction(() => {
        if (this.activity) {
          this.activity.attendees = this.activity.attendees.filter(
            (a) => a.username !== this.rootStore.userStore.user!.username
          );
          this.activity.isGoing = false;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.loading = false;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      toast.error("Problem cancelling attendance");
    }
  };
}
