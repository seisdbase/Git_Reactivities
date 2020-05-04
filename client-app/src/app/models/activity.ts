export interface IActivity{
    id: string;
    title : string;
    description :string;
    category : string;
    date: Date;
    city: string;
    venue: string;
    //These pertain to currently locked user
    isGoing: boolean;
    isHost: boolean;
    attendees : IAttendee []
}

//Partial makes properties optional
export interface IActivityFormValues extends Partial<IActivity> {
    time?:Date
}

export class ActivityFormValues implements IActivityFormValues {
    id?: string = undefined;
    title: string = '';
    category:  string = '';
    description:  string = '';
    date?: Date = undefined;
    time?: Date = undefined;
    city:  string = '';
    venue:  string = '';

    //constructor takes care of existing activity or a new one == init?
    constructor(init?: IActivityFormValues) {
        if(init && init.date) {
            init.time = init.date
        }
        //Assign to 'this' hence class, source is: init; init props automatically mapped into class
        Object.assign(this, init);
    }
}
    export interface IAttendee {
        username: string;
        displayName: string;
        image: string;
        isHost: boolean;
    }

    
