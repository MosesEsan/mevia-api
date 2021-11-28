const prisma = require('../config/prisma')
const moment = require('moment')
const {isGameValid, get_next_game} = require("../utils/isGameValid");
const {checkGame} = require("../utils/check-game");

// @route GET api/prize
// @desc Returns all prizes
// @access Public
exports.index = async (req, res) => {
    try {
        const prizes = await prisma.weeklyChallenge.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', prizes.length)
        res.status(200).json(prizes)
    } catch (error) {
        console.log(error)
        throw error
    }
}

//CRUD

// @route POST api/prize
// @desc Add a new prize
// @access Public
exports.create = async (req, res) => {
    try {
        const prize = await prisma.weeklyChallenge.create({data: {...req.body }})
        res.status(200).json(prize)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


// @route GET api/prize/{id}
// @desc Returns a specific prize
// @access Public
exports.read = async function (req, res) {
    try {
        const id = req.params.id;

        let prize = await prisma.weeklyChallenge.findUnique({where: {id: parseInt(id)}})

        res.status(200).json(prize);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// @route PUT api/question/{id}
// @desc Update question details
// @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.params.id;

        const question = await prisma.weeklyChallenge.update({where: { id: parseInt(id) }, data})
        res.status(200).json(question);
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message});
    }
};









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

        let next_challenge = null

        challenges.forEach((challenge, index) => {
            let startTime = new moment(challenge.startTime);
            startTime = startTime.format("HH:mm:ss");
            startTime = moment(startTime, format)

            let endTime = new moment(challenge.endTime);
            endTime = endTime.format("HH:mm:ss");
            endTime = moment(endTime, format)

            // let check = moment();
            let check = moment()
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
                challenge_description = "Take part in daily challenges and be in a chance to win one of the weekly prizes.";
                challenge_start_time = startTime
                challenge_end_time = endTime

                challenge_time_left =  endTime.valueOf() - check.valueOf();
                challenge_identifier = `${user_id}${year}${month}${day}${hour}${minutes}`
            }else if (check.isBefore(startTime) && next_challenge === null){
            //    if this challenge is in the future
                console.log("In the future")
                console.log(startTime)
                challenge_time_left =  startTime.valueOf() - check.valueOf();

                next_challenge = {
                    avail:false,
                    current: false,
                    next: true,
                    new_game: false,
                    current_game: null,
                    next_game: null,
                    challenge_time_left,
                    challenge_no:`${index + 1}/${challenges.length}`,
                    challenge_start_time:startTime,
                    challenge_end_time:endTime,
                    challenge_description:"Take part in daily challenges and be in a chance to win one of the weekly prizes.",
                }
                console.log("In the future")
            }
        })

        let challenge = {
            avail,
            current: false,
            next: false,
            new_game: false,
            current_game: null,
            next_game: null,
            challenge_description,
            challenge_start_time, challenge_end_time,
            challenge_time_left,
            challenge_identifier,
            challenge_no,
            available_games
        };

        console.log("avail", avail)
        console.log("next_challenge", next_challenge)
        if (!avail && next_challenge !== null) challenge  = next_challenge;
        else if (avail) challenge['current'] = true;
        else challenge = {avail, challenge_identifier}

        console.log(user_id)
        console.log(challenge_identifier)
        //---

        if (avail && challenge_identifier !== null) {
            //Check if there hs been any game created for this user for this challenge
            try {
                const game = await checkGame(challenge_identifier, user_id)
                console.log(game, "game")

                const {is_valid, has_next_game, next_game_avail, message} = await isGameValid(game);
                console.log(is_valid, has_next_game, next_game_avail, message)


                //if no game was found or it has a next game and the next game available is ready (prev game submitted) (creates new game)
                if (game == null || (has_next_game === true && next_game_avail === true)) {
                    challenge['new_game'] = true
                }

                // /if it has a next game but the next game available is not ready (prev game submitted)
                if (has_next_game === true && next_game_avail === false) {
                    challenge['next_game'] = get_next_game(game)
                }

                //if is valid is true (prev game not submitted, next game in future)
                else if (is_valid === true) {
                    challenge['current_game'] = game
                }

                //if is valid is false (prev game not submitted and we next game time has passed or there is no next game(because the next challenge will have begun))
                else if (is_valid === false) {
                }
            } catch (error) {
            }
        }

        return {success: true, challenge};
    } catch (error) {
        throw error
    }
}

exports.check = async (req, res) => {
    try {
        let user_id = req.user.id;
        const result = await checkChallenges(user_id);
        let {challenge} = result;
        let {avail, challenge_identifier} = challenge;

        console.log("result")
        console.log(result)
        console.log("result")

        res.status(200).json(result)
    } catch (error) {
        console.log("err")
        console.log(error)
        res.status(500).json({success: false, error})
    }
};

exports.checkChallenges = checkChallenges;
