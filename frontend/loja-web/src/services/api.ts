import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // To be adjusted when integrating with Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
