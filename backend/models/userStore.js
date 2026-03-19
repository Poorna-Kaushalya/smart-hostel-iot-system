const users = [];

function addUser(user) {
  users.push(user);
}

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

module.exports = { addUser, findUserByEmail };