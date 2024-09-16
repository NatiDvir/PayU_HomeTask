const UserModel = require('../models/users');

const SUPPORTED_QUERY = ['country', 'name', 'email', 'age'];
const BAD_QUERY_MSG = `Only one query param is supported, and it must be one of the following: ${SUPPORTED_QUERY.join(', ')}`;

/**
 * Get user by ID
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getUserById = async (req, res) => {
  let id = req.params.id;
  try {
    let user = await UserModel.getById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error(err, 'Error during get user');
    return res.status(500).json({ message: 'Error during get user' });
  }
};


/**
 * Get users by query params (country, age, name (partial/full match))
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getUsers = async (req, res) => {
  let query = req.query;
  let result;
  try {
    // Make sure only valid query params were passed:
    let queryKeys = Object.keys(query);

    if (queryKeys.length > 1 || queryKeys.length === 0 || !SUPPORTED_QUERY.includes(queryKeys[0].toLowerCase())) {
      return res.status(400).json({ message: BAD_QUERY_MSG });
    }

    let queryParam = queryKeys[0].toLowerCase();

    switch (queryParam) {
      case 'country':
        result = await UserModel.getByCountry(query.country);
        break;
      case 'name':
        result = await UserModel.getByName(query.name);
        break;
      case 'age':
        result = await getUsersByAge(query.age);
        break;
      default:
        return res.status(400).json({ message: BAD_QUERY_MSG });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Error during get users' });
  }

  res.json(result);
};

/**
 * Delete user by ID
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const deleteUserById = async (req, res) => {
  let id = req.params.id;
  try {
    await UserModel.deleteById(id);
    return res.status(204).send(); 
  } catch (err) {
    console.error(err, 'Error during delete user');
    return res.status(500).json({ message: 'Error during delete user' });
  }
};

/**
 * Get users by age by calculating relevant DOBs and getting users from the model
 * @param {number} age 
 * @returns {User[]}
 */
const getUsersByAge = async (age) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Calculate the start and end of year's valid dobs
  const startDob = new Date(currentYear - age - 1, currentDate.getMonth(), currentDate.getDate());
  const endDob = new Date(currentYear - age, currentDate.getMonth(), currentDate.getDate());

  let users = [];
  
  // Iterate over all days within possible range
  for (let currentDob = new Date(startDob); currentDob <= endDob; currentDob.setDate(currentDob.getDate() + 1)) {
      const dob = currentDob.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
      const usersByDob = await UserModel.getByDob(dob);
      
      if (usersByDob.length) {
          users = users.concat(usersByDob);
      }
  }

  return users;
};


module.exports = {
  getUserById,
  getUsers,
  deleteUserById,
};
