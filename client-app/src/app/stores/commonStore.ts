import {RootStore} from './rootStore';
import { observable, action, reaction } from 'mobx';

console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> IN commonStore.ts" );

//Deals w features that have nothing to do with activities and such
//Deals w fact that we get token back from server but doing nothing w it
export default class CommonStore {
        rootStore: RootStore;
        constructor(rootStore:RootStore){
            this.rootStore = rootStore

            //Mobx reactions
            //Reactions 2 types:
            //autorun will run every time an observable is touched
            //or only when observable has changed: @observable token

            reaction(
                () => this.token,
                //effect what we want to do when token has changed
                token => {
                    if (token) {
                      window.localStorage.setItem("jwt", token);
                    } else {
                        window.localStorage.removeItem('jwt');
                    }
                }
            )
        }

        @observable token: string | null = window.localStorage.getItem('jwt');
        @observable appLoaded = false;

        //these will be used in app.tsx, save token in browser local storage
        @action setToken = (token: string | null) => {
            this.token = token;
        }

        //App.tsx
        @action setAppLoaded = () => {
            this.appLoaded = true;
        }

       
}