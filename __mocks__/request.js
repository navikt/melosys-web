const users = {
  4: { name: 'Mark' },
  5: { name: 'Paul' },
};
const resolveOrRejectUser = (userID, resolve, reject) => (users[userID] ? resolve(users[userID]) : reject({ error: `user with ${userID} not found` }));

export default function request(url) {
  return new Promise((resolve, reject) => {
    const userID = parseInt(url.substr('/api/users/'.length), 10);
    process.nextTick(resolveOrRejectUser(userID, resolve, reject));
  });
}
