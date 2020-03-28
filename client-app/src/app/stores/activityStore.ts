import {observable, action, computed, runInAction} from 'mobx';
import { SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';
import { history } from '../..';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';



export default class ActivityStore {
  rootStore: RootStore;
  constructor(rootStore: RootStore){
    this.rootStore = rootStore;
  }

  @observable activityRegistry = new Map();
  @observable activity: IActivity | null = null;
  @observable loadingInitial = false;
  @observable submitting = false;
  @observable target = "";
 

  // @computed get activitiesByDate() {
  //   return Array.from(this.activityRegistry.values()).sort(
  //     (a, b) => Date.parse(a.date) - Date.parse(b.date)
  //   );
  // }

  @computed get activitiesByDate() { 
    return this.groupActivitiesByDate(Array.from( this.activityRegistry.values()));
  }


  //Group activities by date
  groupActivitiesByDate(activities: IActivity[]) { 
    const sortedActivities = activities.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
    return Object.entries(sortedActivities.reduce((activities, activity) => {
      const date = activity.date.toISOString().split('T')[0];
      //Ternary operator
      activities[date] = activities[date] ? [...activities[date], activity] : [activity];
      return activities;
      //Define type
    }, {} as {[key: string]: IActivity[]}));
  }

  //Load activities
  //bring the observable and pass it to action
  @action loadActivities = async () => {
    //Mutating state, cant do in Redux
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();
      runInAction('loading activities', () => {
        activities.forEach(activity => {
          activity.date = new Date(activity.date);
          this.activityRegistry.set(activity.id, activity);
        });
        this.loadingInitial = false;
      })
      //Check activity arrays being passed
      //console.log(this.groupActivitiesByDate(activities));
    } catch (error) {
      runInAction("load activities error", () => {
        this.loadingInitial = false;
      })
      console.log(error);
    }
  };

  
 //async means gonna be returned as promise
  @action loadActivity = async (id: string) => {
      let activity:any = this.getActivity(id);
      //get it from memory
      if (activity) {
          this.activity = activity;
          return activity;
      } else {
        this.loadingInitial = true;
        try {
          //get it from API
          activity = await agent.Activities.details(id);
          runInAction("getting activity", () => {
            activity.date = new Date(activity.date);
            this.activity = activity;
            this.activityRegistry.set(activity.id, activity);
            this.loadingInitial = false;
          })
          return activity;
        } catch (error) {
          runInAction('load activity error',() => {
                this.loadingInitial = false;
              })
          console.log(error);
          
        }
      }
  }

  @action clearActivity = () => {
    this.activity = null;
  }

  // Method to get activity
  getActivity = (id: string) => {
    this.activityRegistry.get(id);
  }


  //Create Activity
  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      runInAction("create activities", () => {
        this.activityRegistry.set(activity.id, activity);
        this.submitting = false;
      });
        history.push(`/activities/${activity.id}`)
    } catch (error) {
      runInAction("create activities", () => {
        this.submitting = false;
      });
      toast.error('Problem submitting data');
      console.log(error.response);
    }
  };

  //EditActivity
  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction("edit activities", () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`)
    } catch (error) {
      runInAction("edit activities error", () => {
        this.submitting = false;
      });
      toast.error('Problem submitting data');
      console.log(error);
    }
  };

  //DeleteActivity
  @action deleteActivity = async (
    event: SyntheticEvent<HTMLButtonElement>, id: string
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
}
