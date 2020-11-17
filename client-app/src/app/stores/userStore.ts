//MOBX store related to anything with user
import { observable, computed, action, runInAction } from "mobx";
import { IUser, IUserFormValues } from "../models/user";
import agent from "../api/agent";
import { RootStore } from "./rootStore";
import { history } from "../..";

export default class UserStore {
  rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    console.log("IN userStore.ts --------------------------------- MOBX" );
  }

  @observable user: IUser | null = null;

  //Loading indicator
  @observable loading = false;

  //!! bang - bang; returns falsy if empty, or truthy if not empty
  @computed get isLoggedIn() {
    return !!this.user;
  }

  @action login = async (values: IUserFormValues) => {
    try {
      const user = await agent.User.login(values);
      
      //Get user back from API; observable must be in runInAction
      runInAction(() => {
        this.user = user;
      });

      //Get token for the user
      this.rootStore.commonStore.setToken(user.token);
      this.rootStore.modalStore.closeModal();
      history.push("/activities");
    } catch (error) {
      throw error;
    }
  };

  @action register = async (values: IUserFormValues) => {
    try {
      const user = await agent.User.register(values);
      this.rootStore.commonStore.setToken(user.token);
      this.rootStore.modalStore.closeModal();
      history.push('/activities')
    } catch (error) {
      throw error;
    }
  }

  //called from App.tsx
  @action getUser = async () => {
    try {
      const user = await agent.User.current();
      //Observable must be in runInAction
      runInAction(() => {
        this.user = user;
      });
    } catch (error) {
      console.log(error);
    }
  };


  //Logout action; go back to Home page
  @action logout = () => {
    this.rootStore.commonStore.setToken(null);
    this.user = null;
    history.push("/");
  };

  //Facebook
  @action fbLogin = async (response: any) => {
     this.loading = true;
      try {
          const user = await agent.User.fbLogin(response.accessToken) ;
          runInAction(() => {
              this.user = user;
              this.rootStore.commonStore.setToken(user.token);
              this.rootStore.modalStore.closeModal();
     this.loading = false;

          });
        
      } catch (error) {
          this.loading = false;
        throw error;
      }
    };
  }