const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertToResponseObject = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  };
};

//get all players
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertToResponseObject(eachPlayer))
  );
});
//get player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    select *
    from cricket_team
    where player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertToResponseObject(player));
});
//post
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
    insert into
    cricket_team(player_name,jersey_number,role)
    values
    ('${playerName}',${jerseyNumber},'${role}');`;
  const player = await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//update/put
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const putPlayerQuery = `
    update
    cricket_team
    set
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    where player_id=${playerId};`;

  await db.run(putPlayerQuery);
  response.send("Player Details Updated");
});
//delete
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    delete from
    cricket_team
    where player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
