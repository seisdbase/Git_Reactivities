//AXIOS
import axios, { AxiosResponse } from 'axios'
import { IActivity, IActivitiesEnvelope } from '../models/activity'
import { history } from '../..'
import { toast } from 'react-toastify'
import { IUser, IUserFormValues } from '../models/user'
import { IProfile, IPhoto } from '../models/profile'

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
//axios.defaults.baseURL = 'http://localhost:5000/api'


//check JWT token exists, attach to athorization header
//This is done for every request

console.log('IN agent.ts >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> AXIOS')

axios.interceptors.request.use(
  config => {
    console.log(
      'IN interceptor.request >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> AXIOS'
    )
    const token = window.localStorage.getItem('jwt')
    if (token) config.headers.Authorization = `Bearer ${token}`
    // console.log('INTERCEPTOR CONFIG: ' + JSON.stringify(config, undefined, 2));
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

//Interceptor for request/response from server--------------
axios.interceptors.response.use(undefined, error => {
  if (error.message === 'Network Error' && !error.response) {
    toast.error('Network error - make sure API is running')
  }

  //Destructure elements from the Response object = transltes to: call error.response
  //and receive status,data, config
  const { status, data, config } = error.response

  if (status === 404) {
    history.push('/not found')
  }
  //headers['www-authenticate']) is an object accessor
  //header message did not work so 
  //if (status === 401 && headers['www-authenticate'] === 'Bearer error="invalid_token", error_description="The token is expired"') {
  if (status === 401) {
    window.localStorage.removeItem('jwt');
    history.push('/')  //Home page
    toast.info('Your session has expired, please login again')
  }
  if (status === 405) {
    toast.error('405 - method is not supported')
  }
  if (
    status === 400 &&
    config.method === 'get' &&
    data.errors.hasOwnProperty('id')
  ) {
    history.push('/not found')
  }
  if (status === 500) {
    toast.error('Server error - check the terminal for more info')
  }
  throw error.response
})
//----------------------------------------------------------

const responseBody = (response: AxiosResponse) => response.data
console.log(
  'IN interceptor.responseBody >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> AXIOS'
)

const requests = {
  get: (url: string) =>
    axios
      .get(url)
      .then(responseBody),
  post: (url: string, body: {}) =>
    axios
      .post(url, body)
      .then(responseBody),
  put: (url: string, body: {}) =>
    axios
      .put(url, body)
      .then(responseBody),
  del: (url: string) =>
    axios
      .delete(url)
      .then(responseBody),
  postForm: (url: string, file: Blob) => {
    let formData = new FormData()
    formData.append('File', file) //File needs to match property whats called in IForm file
    return axios
      .post(url, formData, {
        headers: { 'Content-type': 'multipart/form-data' }
      })
      .then(responseBody)
  }
}

const Activities = {
  list: (params: URLSearchParams): Promise<IActivitiesEnvelope> =>
    axios
      .get('/activities', { params: params })
      .then(responseBody),
  details: (id: string) => requests.get(`/activities/${id}`),
  create: (activity: IActivity) => requests.post('/activities', activity),
  update: (activity: IActivity) =>
    requests.put(`/activities/${activity.id}`, activity),
  delete: (id: string) => requests.del(`/activities/${id}`),
  attend: (id: string) => requests.post(`/activities/${id}/attend`, {}), //{} error: argument for the body
  unattend: (id: string) => requests.del(`/activities/${id}/attend`)
}

//console.log('RESPONSE BODY: ' + JSON.stringify( Activities.attend))

//Axios --> login and register via interfaces in user.ts
const User = {
  current: (): Promise<IUser> => requests.get(`/user`),
  login: (user: IUserFormValues): Promise<IUser> =>
    requests.post(`/user/login`, user),
  register: (user: IUserFormValues): Promise<IUser> =>
    requests.post(`/user/register`, user),
  //Facebook login
  fbLogin:(accessToken: string) =>
    requests.post(`/user/facebook`, {accessToken})
};


//Profiles - client side
const Profiles = {
  get: (username: string): Promise<IProfile> =>
    requests.get(`/profiles/${username}`),
  put: (profile: Partial<IProfile>) => requests.put('/profiles/', profile),
  uploadPhoto: (photo: Blob): Promise<IPhoto> =>
    requests.postForm(`/photos`, photo),
  setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
  deletePhoto: (id: string) => requests.del(`/photos/${id}`),
  follow: (username: string) =>
    requests.post(`/profiles/${username}/follow`, {}),
  unfollow: (username: string) => requests.del(`/profiles/${username}/follow`),
  listFollowings: (username: string, predicate: string) =>
    requests.get(`/profiles/${username}/follow?predicate=${predicate}`),
  listActivities: (username: string, predicate: string) =>
    requests.get(`/profiles/${username}/activities?predicate=${predicate}`)
}

export default {
  Activities,
  User,
  Profiles
}
