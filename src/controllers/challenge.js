const prisma = require('../config/prisma')
const moment = require('moment')
const {isGameValid, get_next_game} = require("../utils/isGameValid");
const GameController = require('../controllers/game');

async function checkChallenges(user_id) {
    try {
        //Get challenges
        const challenges = await prisma.challenge.findMany({where: {daily: true}, orderBy: {startTime: 'asc'}})

        let avail = false;
        let challenge_no = null;
        let available_games = null;
        let challenge_description = null;
        let challenge_start_time = null;
        let challenge_end_time = null;
        let challenge_identifier = null;
        let challenge_time_left = null;
        let format = 'hh:mm:ss'

        challenges.forEach((challenge, index) => {
            let startTime = new moment(challenge.startTime);
            startTime = startTime.format("HH:mm:ss");
            startTime = moment(startTime, format)

            let endTime = new moment(challenge.endTime);
            endTime = endTime.format("HH:mm:ss");
            endTime = moment(endTime, format)

            // let check = moment();
            let check = moment().add( 9, "hours")
            let month = check.format('M'),
                day = check.format('D'),
                year = check.format('YYYY'),
                hour = startTime.format('HH'),
                minutes = startTime.format('mm');

            if (check.isBetween(startTime, endTime)) {
                avail = true;
                challenge_no = `${index + 1}/${challenges.length}`;
                available_games = 20;
                // available_games = challenge.availableGames;
                // challenge_description = challenge.challenge_description;
                challenge_description = "Play daily games to earn points. Game active until time or available points runs out.";
                challenge_start_time = startTime
                challenge_end_time = endTime

                challenge_time_left =  endTime.valueOf() - check.valueOf();
                challenge_identifier = `${user_id}${year}${month}${day}${hour}${minutes}`
            }
        })

        let challenge = {avail, challenge_description, challenge_start_time, challenge_end_time, challenge_time_left, challenge_identifier, challenge_no, available_games};
        return {success: true, challenge};

    } catch (error) {
        throw error
    }
}

exports.check = async (req, res) => {
    try {
        const result = await checkChallenges(25);
        let {challenge} = result;
        let {avail, challenge_identifier} = challenge;

        console.log(result)
        console.log("avail", avail)
        console.log("challenge_identifier", challenge_identifier)

        if (avail && challenge_identifier !== null) {
            //Check if there hs been any game created for this user for this challenge
            try {
                const game = await GameController.checkGame(challenge_identifier)
                console.log(game)

                const {is_valid, has_next_game, next_game_avail, message} = await isGameValid(game);
                console.log(is_valid, has_next_game, next_game_avail, message)


                // /if it has a next game but the next game available is not ready (prev game submitted)
                if (has_next_game === true && next_game_avail === false) {
                    res.status(200).json({success: false, ...result, next_game:get_next_game(game)})
                }else{
                    res.status(200).json(result)
                }
            } catch (error) {
                console.log("err")
                console.log(error)
                res.status(500).json({success: false, error: error})
            }
        } else {
            console.log(result, "result")
            res.status(200).json(result)
        }
    } catch (error) {
        console.log("err")
        console.log(error)
        res.status(500).json({success: false, error})
    }
};

exports.checkChallenges = checkChallenges;
