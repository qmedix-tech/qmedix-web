import axios from 'axios';

/**
 * Service to fetch address information based on Indian Pincode
 * API: https://api.postalpincode.in/pincode/{PINCODE}
 */
export const fetchAddressFromPincode = async (pincode) => {
  if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
    throw new Error('Invalid Pincode format. Please enter a 6-digit numeric pincode.');
  }

  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = response.data[0];

    if (data.Status === 'Error') {
      throw new Error('Invalid Pincode. No data found.');
    }

    if (data.Status === 'Success' && data.PostOffice) {
      return data.PostOffice.map(office => ({
        area: office.Name,
        district: office.District,
        state: office.State,
        pincode: office.Pincode
      }));
    }

    throw new Error('Unable to fetch address for this pincode.');
  } catch (error) {
    console.error('Pincode Fetch Error:', error);
    throw error;
  }
};
