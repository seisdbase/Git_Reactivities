//Closing and opening of modal forms 

import { RootStore } from "./rootStore";
import { observable, action } from "mobx";


export default class ModalStore {
    rootStore: RootStore;
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @observable.shallow modal = {
        open: false,
        body: null
    }
    
    //Login form will be inside the body
    @action openModal = (content: any) => {
        this.modal.open = true;
        this.modal.body = content;
    }

    
    @action closeModal = () => {
        this.modal.open = false;
        this.modal.body = null;
    }
}