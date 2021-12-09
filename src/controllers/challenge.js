const prisma = require('../config/prisma')
const moment = require('moment')
const {isGameValid, get_next_game} = require("../utils/isGameValid");
const {checkGame} = require("../utils/check-game");

// @route GET api/challenge
// @desc Returns all challenges
// @access Public
exports.index = async (req, res) => {
    try {
        const prizes = await prisma.weeklyChallenge.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', prizes.length)
        res.status(200).json(prizes)
    } catch (error) {
        throw error
    }
}

//CRUD

// @route POST api/challenge
// @desc Add a new challenge
// @access Public
exports.create = async (req, res) => {
    try {
        const prize = await prisma.weeklyChallenge.create({data: {...req.body }})
        res.status(200).json(prize)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


// @route GET api/challenge/{id}
// @desc Returns a specific challenge
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

// @route PUT api/challenge/{id}
// @desc Update challenge details
// @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.params.id;

        const question = await prisma.weeklyChallenge.update({where: { id: parseInt(id) }, data})
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// @route PUT api/challenge/check
// @desc  checks if a challenge is avaialble
// @access Public
exports.check = async function (req, res) {
    try {
        const challenge = await checkWeeklyChallenge();
        if (challenge && challenge.WeeklyPrize.length > 0){
            let user_id = req.user.id;
            const result = await checkChallenges(user_id, challenge);
            return res.status(200).json(result)
        }else{
            res.status(401).json({error: {message: "No Challenges available."}})
        }
    } catch (error) {
        res.status(500).json({error})
    }
};


async function checkWeeklyChallenge() {
    const today = moment();
    let start = today.startOf('isoWeek').format('YYYY-MM-DD HH:mm');
    let end = today.endOf('isoWeek').format('YYYY-MM-DD HH:mm');

    start = moment(start)
    end = moment(end)

    return await prisma.weeklyChallenge.findFirst({
        where: {
            startDate: new Date(start),
            endDate: {lte: new Date(end)},
        },
        include: {WeeklyPrize: true},
        orderBy: {createdAt: 'asc'}
    });
}


async function checkChallenges(user_id, weekly_challenge) {
    try {
        let weekly_challenge_name = weekly_challenge.name || null
        //Get challenges times
        const challengeTimes = await prisma.challengeTime.findMany({where: {daily: true}, orderBy: {startTime: 'asc'}})

        let avail = false;
        let challenge_no = null;
        let challenge_description = null;
        let challenge_start_time = null;
        let challenge_end_time = null;
        let challenge_identifier = null;
        let challenge_time_left = null;
        let format = 'hh:mm:ss'

        let current_challenge = null
        let current_challenge_avail = false;

        let next_challenge = null
        let next_challenge_avail = false;

        challengeTimes.forEach((challenge, index) => {
            let startTime = new moment(challenge.startTime);
            startTime = startTime.format("HH:mm:ss");
            startTime = moment(startTime, format)

            let endTime = new moment(challenge.endTime);
            endTime = endTime.format("HH:mm:ss");
            endTime = moment(endTime, format)

            let check = moment()
            let month = check.format('M'),
                day = check.format('D'),
                year = check.format('YYYY'),
                hour = startTime.format('HH'),
                minutes = startTime.format('mm');
            

            if (check.isBetween(startTime, endTime)) {
                avail = true;
                current_challenge_avail = true;

                challenge_no = `${index + 1}/${challengeTimes.length}`;
                challenge_identifier = `${user_id}${year}${month}${day}${hour}${minutes}`
                challenge_start_time = startTime
                challenge_end_time = endTime
                challenge_time_left =  endTime.valueOf() - check.valueOf();
                challenge_description = "Take part in daily challenges and be in a chance to win one of the weekly prizes.";

                current_challenge = {
                    challenge_no,
                    challenge_identifier,
                    challenge_start_time,
                    challenge_end_time,
                    challenge_time_left,
                    challenge_description,
                    weekly_challenge_name
                };
            }else if (check.isBefore(startTime) && next_challenge === null){
                //    if this challenge is in the future
                challenge_time_left =  startTime.valueOf() - check.valueOf();
                next_challenge_avail = true;
                next_challenge = {
                    challenge_no:`${index + 1}/${challengeTimes.length}`,
                    challenge_start_time:startTime,
                    challenge_end_time:endTime,
                    challenge_time_left,
                    challenge_description:"Take part in daily challenges and be in a chance to win one of the weekly prizes.",
                }
            }
        })

        if (current_challenge !== null) {
            next_challenge_avail= false;
            next_challenge= null;
        }

        if (current_challenge === null && next_challenge === null && challengeTimes.length > 0){
            let startTime = new moment(challengeTimes[0].startTime);
            startTime = startTime.format("HH:mm:ss");
            startTime = moment(startTime, format)

            let endTime = new moment(challengeTimes[0].endTime);
            endTime = endTime.format("HH:mm:ss");
            endTime = moment(endTime, format)

            let today = moment()
            let tomorrow = moment().add(1, "day");
            tomorrow.set({
                hour:   startTime.get('hour'),
                minute: startTime.get('minute'),
                second: startTime.get('second')
            });

            challenge_time_left =  tomorrow.valueOf() - today.valueOf();
            next_challenge_avail = true;
            next_challenge = {
                challenge_no:`1/${challengeTimes.length}`,
                challenge_start_time:startTime,
                challenge_end_time:endTime,
                challenge_time_left,
                challenge_description:"Take part in daily challenges and be in a chance to win one of the weekly prizes.",
            }
        }

        let challenge = {
            avail,
            current: false,
            next: false,

            current_challenge,
            current_challenge_avail,

            next_challenge,
            next_challenge_avail,

            new_game_avail: false,
            current_game_avail: false,
            current_game: null,
            next_game: null
        };

        if (avail) challenge['current'] = true;
        else if (next_challenge_avail) challenge['current'] = false;
        // else challenge = {avail, challenge_identifier, next_challenge}

        //---

        if (avail && challenge_identifier !== null) {
            //Check if there hs been any game created for this user for this challenge
            try {
                const game = await checkGame(challenge_identifier, user_id)

                const {is_valid, has_next_game, next_game_avail, message} = await isGameValid(game);

                //if no game was found or it has a next game and the next game available is ready (prev game submitted) (creates new game)
                if (game == null || (has_next_game === true && next_game_avail === true)) {
                    challenge['new_game_avail'] = true
                }

                // /if it has a next game but the next game available is not ready (prev game submitted)
                //get the time left foer the next
                if (has_next_game === true && next_game_avail === false) {
                    challenge['next_game'] = get_next_game(game)
                }

                //if is valid is true (prev game not submitted, next game in future)
                else if (is_valid === true) {
                    challenge['current_game_avail'] = true
                    challenge['current_game'] = game
                }

                //if is valid is false (prev game not submitted and we next game time has passed or there is no next game(because the next challenge will have begun))
                else if (is_valid === false) {
                }
            } catch (error) {
            }
        }

        return challenge;
    } catch (error) {
        throw error
    }
}


exports.checkChallenges = checkChallenges;
exports.checkWeeklyChallenge = checkWeeklyChallenge;
