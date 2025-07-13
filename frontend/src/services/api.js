import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/', // your Django API base
  timeout: 5000,
});

export default API;