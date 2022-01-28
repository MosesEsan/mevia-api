const prisma = require('../config/prisma')
const moment = require('moment')
const {isGameValid, get_next_game} = require("../utils/isGameValid");
const pusher = require("../config/pusher");
const {slugify} = require("../utils/slugify");

// @route GET api/tournaments
// @desc Returns all tournaments
// @access Public
exports.index = async (req, res) => {
    try {
        const tournaments = await prisma.tournament.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', tournaments.length)
        res.status(200).json(tournaments)
    } catch (error) {
        res.status(500).json(error);
    }
}

//CRUD

// @route POST api/tournament
// @desc Add a new tournament
// @access Public
exports.create = async (req, res) => {
    try {
        const tournament = await prisma.tournament.create({data: {...req.body}})
        res.status(200).json(tournament)
    } catch (error) {
        res.status(500).json(error);
    }
};


// @route GET api/tournament/{id}
// @desc Returns a specific tournament
// @access Public
exports.read = async function (req, res) {
    try {
        const id = req.params.id;

        let tournament = await prisma.tournament.findUnique({where: {id: parseInt(id)}})

        res.status(200).json(tournament);
    } catch (error) {
        res.status(500).json(error)
    }
};

// @route PUT api/tournament/{id}
// @desc Update tournament details
// @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.params.id;

        const tournament = await prisma.tournament.update({where: {id: parseInt(id)}, data})
        res.status(200).json(tournament);
    } catch (error) {
        res.status(500).json(error)
    }
};

// @route GET api/tournament/check
// @desc  checks if a tournament is available
// @access Public
const check_tournament = async function (req, res) {
    try {
        let today = moment();
        today = today.format("YYYY-MM-DD");
        today = moment(today).subtract(2, 'days');

        const tournaments = await prisma.tournament.findMany({
            where: {
                // start_date: {lte: new Date(today)},
                end_date: {gte: new Date(today)},
            },
            include: {
                TournamentPrize: {
                    include: {
                        Prize: true
                    },
                },
                TournamentMode: true,
                TournamentCategory: true
            },
            orderBy: {created_at: 'asc'}
        });


        const all_tournaments = []
        for (let i = 0; i < tournaments.length; i++) {
            let tournament = tournaments[i];

            if (tournament && tournament.TournamentPrize.length > 0) {
                let format = 'hh:mm:ss'
                let startTime = new moment(tournament.start_time);
                startTime = startTime.format("HH:mm:ss");
                startTime = moment(startTime, format)

                let endTime = new moment(tournament.end_time);
                let endTimeHours = endTime.format("HH:mm:ss");
                endTime = moment(endTimeHours, format)

                let today = moment()

                tournament["is_tomorrow"] = false
                //if the current time is between the start and end time and the current time is before the endtime
                if (today.isBetween(startTime, endTime) && today.isBefore(endTime)){
                    //    if the end time is in the future
                    let time_left =  endTime.valueOf() - today.valueOf();
                    tournament["avail"] = true
                    tournament["time_left"] = time_left
                    tournament["time_message"] = `Ends at ${endTime.format("h:mm A")}`
                    //if the current time is before the start
                }else if (today.isBefore(startTime)){
                    let time_left = startTime.valueOf() - today.valueOf();
                    tournament["avail"] = false
                    tournament["time_left"] = time_left
                    tournament["time_message"] = `Starts at ${startTime.format("h:mm A")}`

                    //if the end time is before the current time
                }else if (endTime.isBefore(today)){
                    let tomorrow = moment().add(1, "day");
                    tomorrow.set({
                        hour:   startTime.get('hour'),
                        minute: startTime.get('minute'),
                        second: startTime.get('second')
                    });

                    let time_left =  tomorrow.valueOf() - today.valueOf();
                    tournament["avail"] = false
                    tournament["time_left"] = time_left
                    tournament["is_tomorrow"] = true
                    tournament["time_message"] = `Tomorrow at ${startTime.format("h:mm A")}`
                }

                let modes = await formatMode(tournament.TournamentMode);
                if (modes.length > 0) {
                    tournament["modes"] = modes;

                    try {
                        tournament = await checkTournamentRegistration(req.user.id, tournament);
                        tournament["available_spaces"] = await get_available_spaces(tournament.id)
                    } catch (error) {
                        console.log(error)
                    }

                    all_tournaments.push(tournament)
                }
            }
        }
        return res.status(200).json(all_tournaments)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
};
exports.check_tournament = check_tournament;


// @route POST api/tournament/register
// @desc Add a new tournament
// @access Public
exports.check_available_points = async function (req, res) {
    try {
        const {tournament_id} = req.body;

        let result = await get_available_points(tournament_id)
        return res.status(200).json(result)

    } catch (error) {
        res.status(500).json(error)
    }
}

exports.register_for_tournament = async function (req, res) {
    try {
        let user_id = req.user.id;
        const {tournament_id} = req.body;

        //Make sure the tournament exist
        let tournament = await prisma.tournament.findUnique({where: {id: parseInt(tournament_id)}})
        if (!tournament) return res.status(401).json({message: "This tournament does not exist."});

        //Check of the user has already registered for this touername
        const check = await prisma.tournamentUser.findFirst({
            where: {
                userId: user_id,
                tournamentId: parseInt(tournament_id)
            }
        })
        if (check) return res.status(401).json({type: "registered", message: "You are already registered for this tournament."});

        const today = moment();
        let registrationCloses = new moment(tournament.registration_closes);
        //Check if registration is closed
        if (today.isBefore(registrationCloses)){
            // Create a new record for the user for this tournament
            let tournament_user = await prisma.tournamentUser.create({
                data: {
                    userId: user_id,
                    tournamentId: parseInt(tournament_id)
                }
            })

            return await deductPoints(req, res, tournament, tournament_user)
        }else if (registrationCloses.isBefore(today)){
            return res.status(401).json({type: "closed", message: "Registration for this tournament has closed."});
        }
    } catch (error) {
        res.status(500).json(error)
    }
};


exports.tournament_leaderboard = async function (req, res) {
    try {
        let type = (req.body.type) ? req.body.type : "points";

        let leaderboard = await runQuery(type)

        let top_leaders = []
        leaderboard.map((user, idx) => {
            user['id'] = idx + 1;
            if (idx < 3) top_leaders.push(user)
        })

        let data = {
            leaderboard,
            top_leaders,
            title: `Top leaders of the ${type}`,
            message: `The current reigning champions of the ${type}`
        }

        res.status(200).json({success: true, data});
    } catch (error) {
        res.status(500).json({error})
    }
};


async function runQuery(type) {
    try {
        let leaderboard = null;
        if (type && type === "points") {
            leaderboard = await prisma.$queryRaw`
        SELECT @rank := @rank + 1 rank, user_id, username, image, points, points_available, ceil((points/points_available) * 100) as success_rate, no_of_games_played, ceil(average) as average 
        FROM
        (
            SELECT user.id as user_id, user.username, user.image, COALESCE(points_obtained, 0) AS points, COALESCE(points_available, 0) AS points_available, 
            COALESCE(no_of_games_played, 0) AS no_of_games_played,
            (points_obtained/no_of_games_played) as average
            FROM user
            INNER JOIN 
            (SELECT tournament_game.user_id as user_id, user.username, user.image, SUM((CASE WHEN gq.correct is True THEN qt.points ELSE 0 END)) as points_obtained
            FROM tournament_question gq
            INNER JOIN tournament_game ON gq.tournamentGameId = tournament_game.id 
            INNER JOIN question ON gq.questionId = question.id 
            INNER JOIN question_type qt ON question.questionTypeId = qt.id
            INNER JOIN user ON tournament_game.user_id = user.id
            WHERE tournament_game.submitted_at IS NOT NULL
            GROUP BY user_id
            ORDER BY points_obtained desc) game_points ON game_points.user_id = user.id 
            LEFT JOIN (
            SELECT user_id, COUNT(*) AS no_of_games_played
            FROM tournament_game tg
            WHERE tg.submitted_at IS NOT NULL
            GROUP BY user_id) no_of_games_played ON no_of_games_played.user_id = user.id
            LEFT JOIN (
            SELECT user_id, SUM(tg.points_available) as points_available
            FROM tournament_game tg
            WHERE tg.submitted_at IS NOT NULL
            GROUP BY user_id) points_available ON points_available.user_id = user.id
            ORDER BY points desc, no_of_games_played desc
        ) as f , (SELECT @rank := 0) m LIMIT 10`
        } else if (type && type === "time") {
            leaderboard = await prisma.$queryRaw`
            SELECT tournament_game.user_id, user.username, user.image, COUNT(tq.id) as questions_answered, SUM(tq.time) as time_taken, SUM(tq.time)/(COUNT(tq.id)) as average_time_per_question
            FROM tournament_question tq
            INNER JOIN tournament_game ON tq.tournamentGameId = tournament_game.id 
            INNER JOIN user ON tournament_game.user_id = user.id
            WHERE tq.correct IS NOT NULL
            
            AND tournament_game.user_id NOT IN (
                SELECT user_id FROM(
                    SELECT tournament_game.user_id as user_id, user.username, user.image, 
                    SUM((CASE WHEN gq.correct is True THEN qt.points ELSE 0 END)) as points_obtained
                    FROM tournament_question gq
                    INNER JOIN tournament_game ON gq.tournamentGameId = tournament_game.id 
                    INNER JOIN question ON gq.questionId = question.id 
                    INNER JOIN question_type qt ON question.questionTypeId = qt.id
                    INNER JOIN user ON tournament_game.user_id = user.id
                    WHERE tournament_game.submitted_at IS NOT NULL
                    GROUP BY user_id
                    ORDER BY points_obtained desc LIMIT 1) as e
            ) GROUP BY user_id LIMIT 10`
        } else if (type && type === "success") {
            leaderboard = await prisma.$queryRaw`
            SELECT user.id as user_id, user.username, user.image, points_obtained, points_available, 
            (points_obtained/points_available) as average_points,
            ((points_obtained/points_available) * 100) as success_rate
            FROM user
            INNER JOIN 
            (SELECT tournament_game.user_id as user_id, user.username, user.image, SUM((CASE WHEN gq.correct is True THEN qt.points ELSE 0 END)) as points_obtained
            FROM tournament_question gq
            INNER JOIN tournament_game ON gq.tournamentGameId = tournament_game.id 
            INNER JOIN question ON gq.questionId = question.id 
            INNER JOIN question_type qt ON question.questionTypeId = qt.id
            INNER JOIN user ON tournament_game.user_id = user.id
            WHERE tournament_game.submitted_at IS NOT NULL
            GROUP BY user_id
            ORDER BY points_obtained desc) game_points ON game_points.user_id = user.id 
            LEFT JOIN (
            SELECT user_id, SUM(tg.points_available) as points_available
            FROM tournament_game tg
            WHERE tg.submitted_at IS NOT NULL
            GROUP BY user_id) points_available ON points_available.user_id = user.id
            
            WHERE points_available.user_id NOT IN ( 
                SELECT user_id FROM(
SELECT tournament_game.user_id, user.username, user.image, COUNT(tq.id) as questions_answered, SUM(tq.time) as time_taken, SUM(tq.time)/(COUNT(tq.id)) as average_time_per_question
            FROM tournament_question tq
            INNER JOIN tournament_game ON tq.tournamentGameId = tournament_game.id 
            INNER JOIN user ON tournament_game.user_id = user.id
           WHERE tq.correct IS NOT NULL
            
            AND tournament_game.user_id NOT IN (
                SELECT user_id FROM(
                    SELECT tournament_game.user_id as user_id, user.username, user.image, 
                    SUM((CASE WHEN gq.correct is True THEN qt.points ELSE 0 END)) as points_obtained
                    FROM tournament_question gq
                    INNER JOIN tournament_game ON gq.tournamentGameId = tournament_game.id 
                    INNER JOIN question ON gq.questionId = question.id 
                    INNER JOIN question_type qt ON question.questionTypeId = qt.id
                    INNER JOIN user ON tournament_game.user_id = user.id
                    WHERE tournament_game.submitted_at IS NOT NULL
                    GROUP BY user_id
                    ORDER BY points_obtained desc LIMIT 1
                    ) as e
            ) GROUP BY user_id LIMIT 1) as f
            ) 
            
            ORDER BY success_rate desc
            `

        }

        return leaderboard;

    } catch (error) {
        throw error;
    }
}


async function deductPoints(req, res, tournament, tournament_user) {
    try {
        await prisma.userPoints.create({
            data: {
                userId: req.user.id,
                points: parseInt(tournament.entry_fee),
                source: "TOURNAMENT"
            }
        })

        await push_update(tournament.id)

        //Returns the tournament info
        await check_tournament(req, res);
    } catch (error) {
        await prisma.tournamentUser.delete({where: {id: tournament_user.id}})
        res.status(500).json(error)
    }
}


async function get_available_points(tournament_id) {
    try {
        const today = moment();
        today.format('YYYY-MM-DD HH:mm');

        const tournament = await prisma.tournament.findFirst({where: {id: parseInt(tournament_id)}});

        const pointsInPlay = await prisma.tournamentGame.aggregate({
            where: {
                tournamentId: parseInt(tournament_id),
                submittedAt: null,
                nextGameAt: {gt: new Date(today)},
            },
            _sum: {
                pointsAvailable: true,
            }
        });

        const pointsWon = await prisma.tournamentGame.aggregate({
            where: {
                tournamentId: parseInt(tournament_id),
                NOT: {
                    submittedAt: null
                },
            },
            _sum: {
                pointsObtained: true,
            }
        });

        let inPlay = pointsInPlay._sum.pointsAvailable;
        let won = pointsWon._sum.pointsObtained;
        let points_remaining = tournament.daily_points - won - inPlay

        return {points_remaining: points_remaining, in_plays: inPlay, points_won: won}
    } catch (error) {
        throw(error)
    }
}


async function get_available_spaces(tournament_id) {
    try {
        const tournament = await prisma.tournament.findFirst({where: {id: parseInt(tournament_id)}});

        const tournamentUsers = await prisma.tournamentUser.aggregate({
            where: {tournamentId: parseInt(tournament_id)},
            _count: {id: true}
        });

        let noOfUsers = tournamentUsers._count.id;
        return tournament.max_players - noOfUsers
    } catch (error) {
        throw(error)
    }
}


async function formatMode(modes) {
    try {
        //Get levels
        const questionTypes = await prisma.questionType.findMany()
        let levels = {}
        questionTypes.forEach((obj) => levels[obj.name] = obj.points);

        let keys = Object.keys(levels)

        for (let j = 0; j < modes.length; j++) {
            let {easy, intermediate, hard, bonus} = modes[j];

            let questions = parseInt(easy) + parseInt(intermediate) + parseInt(hard)

            let points = 0;
            if (keys.includes("easy")) points = points + (parseInt(easy) * levels["easy"])
            if (keys.includes("intermediate")) points = points + (parseInt(intermediate) * levels["intermediate"])
            if (keys.includes("hard")) points = points + (parseInt(hard) * levels["hard"])
            if (keys.includes("bonus")) points = points + (parseInt(bonus) * levels["bonus"])

            modes[j]["points"] = points

            bonus = bonus > 0 ? `+ ${bonus} bonus` : "";
            modes[j]["questions"] = `${questions} ${bonus}`

        }

        return modes;

    } catch (error) {
        console.log(error)
        return [];
    }


}

async function checkTournamentRegistration(user_id, tournament) {
    try {
        //Check if the user has already registered for this tournament
        const check = await prisma.tournamentUser.findFirst({where: {userId: user_id, tournamentId: tournament.id}})
        tournament['is_registered'] = !!(check); //(check) ? true : false;

        if (check) {
            //If user is registered, check if they have any game avaialable
            try {
                tournament = await checkTournamentGame(user_id, tournament);
            } catch (error) {
                console.log(error)
            }
        }

        return tournament;
    } catch (error) {
        tournament['is_registered'] = false;
        return tournament;
    }
}

async function checkTournamentGame(user_id, tournament) {
    try {
        let next_game = null
        let new_game_avail = false;

        //Get the most recent game played for this tournament
        const game = await prisma.tournamentGame.findFirst({
            where: {
                tournamentId: tournament.id,
                userId: user_id,
            },
            orderBy: {
                initiatedAt: "desc"
            }
        });

        const {has_next_game, next_game_avail} = await isGameValid(game);

        //if no game was found or it has a next game and the next game available is ready
        if (game == null || (has_next_game === true && next_game_avail === true)) {
            new_game_avail = true
        }

        // /if it has a next game but the the next game available is not ready
        //get the time left for the next game
        if (has_next_game === true && next_game_avail === false) {
            next_game = get_next_game(game)
        }

        tournament['new_game_avail'] = new_game_avail
        tournament['next_game'] = next_game

        return tournament;
    } catch (error) {
        throw error
    }
}

// POINTS UPDATE
async function push_update(tournament_id) {
    try {
        let tournament = await prisma.tournament.findUnique({where: {id: parseInt(tournament_id)}})
        if (tournament) {
            let result = await get_available_spaces(tournament_id)
            await pusher.trigger(`tour_${tournament.id}_${slugify(tournament.name)}`, "space-update", result);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.checkTournamentGame = checkTournamentGame;
exports.getAvailablePoints = get_available_points;
