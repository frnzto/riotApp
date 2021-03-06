const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const api_key = process.env.API_KEY;
const baseUrl = ".api.riotgames.com/lol/";

router.post("/", async function (req, res, next) {
  const { region, sumId } = req.body;
  const riotRequest = await axios.get(
    `https://${region}${baseUrl}summoner/v4/summoners/by-name/${sumId}?api_key=${api_key}`
  );
  const {
    id,
    profileIconId,
    summonerLevel,
    accountId,
  } = await riotRequest.data;
  const stats = await axios.get(
    `https://${region}${baseUrl}league/v4/entries/by-summoner/${id}?api_key=${api_key}`
  );
  const summonerStats = await stats.data;

  const soloStats = summonerStats.filter((solo) => {
    return solo.queueType === "RANKED_SOLO_5x5";
  });

  const flexStats = summonerStats.filter((solo) => {
    return solo.queueType === "RANKED_FLEX_SR"
     
  });
  console.log(flexStats)
  const matchHistory = await axios.get(
    `https://${region}${baseUrl}match/v4/matchlists/by-account/${accountId}?api_key=${api_key}`
  );
  const matchStats = await matchHistory.data;

  const top3 = matchStats.matches.slice(0, 3);
  const gameId = top3.map((id) => {
    return id.gameId;
  });

  const gameData = [];

  for (let id of gameId) {
    const response = await axios.get(
      `https://${region}${baseUrl}match/v4/matches/${id}?api_key=${api_key}`
    );
    const data = await response.data;
    gameData.push(data);
  }

  res.json({
    summonerLevel: summonerLevel,
    profileIconId: profileIconId,
    soloStats: soloStats,
    flexStats: flexStats,
    matches: gameData,
    region: region,
  });
});

module.exports = router;
