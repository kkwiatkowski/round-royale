import { createGame } from './game';
import { createUser } from './user';

const users = new Set();
const games = new Set();

let userId = 0;
let gameId = 0;

const findOrCreateGame = () => {
  let game = [...games].find(game => game.usersCount < game.maxUsersCount);
  if(!game) {
    game = createGame({ name: `Game ${gameId++}`});
    games.add(game);
  }
  return game;
}

export default socket => {
  const { username  = `Guest ${userId++}` } = socket.handshake.query;
  console.log(`connect: ${socket.id} ${username}`);

  const user = createUser(socket, username);
  users.add(user);

  const game = findOrCreateGame();
  user.game = game;
  game.addUser(user);

  socket.on("disconnect", () => {
    console.log(`disconnect: ${socket.id}`);
    users.delete(user);
    const { game } = user;
    game.removeUser(user);
    if(game.usersCount === 0) {
      game.destroy();
      games.delete(game);
    }
  });
};
