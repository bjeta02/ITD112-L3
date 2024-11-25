import axios from 'axios';

// Fetch cases data from the backend
export const fetchCasesData = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/cases');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
