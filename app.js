const express = require('express')
const app = express()
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')
app.use(express.json())
let db = null

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http:localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
intializeDbAndServer()

const convertDbObjectToResponseObject = bdObject => {
  return {
    playerId: bdObject.player_id,
    playerName: bdObject.player_name,
    jerseyNumber: bdObject.jersey_number,
    role: bdObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT * 
    FROM 
    cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eacPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT 
    * 
    FROM 
    cricket_team 
    WHERE 
    player_Id =${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPLayerQuery = `
    INSERT INTO 
    cricket_team (player_name, jersey_number, role)
    VALUES 
    ('${playerName}, ${jerseyNumber}, '${role}');`
  const player = await db.run(postPLayerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayerQuery = `
    UPDATE 
    cricket-team
    SET 
    player_name = '${playerName}'
    jersey_number = ${jerseyNumber}
    role = '${role}'
    WHERE 
    player_id = ${playerId};`

  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE 
    FROM
    cricket-team
    WHERE 
    player_id = ${playerId};`

  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
