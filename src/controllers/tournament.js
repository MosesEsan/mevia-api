const prisma = require('../config/prisma')
const moment = require('moment')
const {isGameValid, get_next_game} = require("../utils/isGameValid");
const pusher = require("../config/pusher");
const {slugify} = require("../utils/slugify");
const UserController = require("../controllers/user");


exports.index = async function (req, res) {
    try {
        const all_tournaments = await checkTournaments(req.user.id, null, false)
        return res.status(200).json(all_tournaments)
    } catch (error) {
        res.status(500).json(error)
    }
};

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
        const all_tournaments = await checkTournaments(req.user.id)
        return res.status(200).json(all_tournaments)
    } catch (error) {
        res.status(500).json(error)
    }
};
exports.check_tournament = check_tournament;


async function checkTournaments(user_id, tournament_id = null, inPlayOnly= true) {
    try {
        let today = moment();
        today = today.format("YYYY-MM-DD");
        // today = moment(today).subtract(7, 'days');

        // start_date: {lte: new Date(today)},
        let whereCond = {}
        if (inPlayOnly) whereCond['end_date'] = {gte: new Date(today)}
        if (tournament_id !== null) whereCond["id"] = parseInt(tournament_id)

        const tournaments = await prisma.tournament.findMany({
            where: whereCond,
            include: {
                TournamentReward: {
                    include: {
                        Reward: true,
                        TournamentWinner: true
                    },
                },
                TournamentMode: {
                    include: {
                        GameMode: true,
                    }
                },
                TournamentCategory: true,
                TournamentUser: {
                    include: {
                        User: {
                            select: {
                                username: true,
                                image: true
                            }
                        }
                    },
                }
            },
            orderBy: {created_at: 'asc'}
        });

        const all_tournaments = []
        for (let i = 0; i < tournaments.length; i++) {
            let tournament = tournaments[i];

            if (tournament && tournament.TournamentReward.length > 0) {
                let tournament_active = check_tournament_active(tournament)

                tournament = {...tournament, ...tournament_active}

                tournament["users"] = await formatUser(tournament.TournamentUser);
                tournament["rewards"] = tournament.TournamentReward.map((obj, idx) => obj.Reward)

                let modes = await formatMode(tournament.TournamentMode);
                if (modes.length > 0) {
                    tournament["modes"] = modes;
                    let result = extractWinners(tournament.TournamentReward);
                    tournament = {...tournament, ...result}

                    try {
                        tournament = await checkTournamentRegistration(user_id, tournament);
                        tournament["available_spaces"] = await getAvailableSpaces(tournament.id)
                        tournament["is_registration_open"] = checkRegistrationOpen(tournament);
                    } catch (error) {
                        console.log(error)
                    }

                    all_tournaments.push(tournament)
                }

                delete tournament["TournamentUser"]
                delete tournament["TournamentMode"]
            }
        }
        return all_tournaments
    } catch (error) {
        throw error
    }
}

exports.checkTournaments = checkTournaments;


function check_tournament_active(tournament) {
    let today = moment()

    let has_started = false; //the tournament has started
    let has_ended = false;  //the tournament has finished

    let avail = false;
    let in_play = false;
    let is_tomorrow = false;
    let time_left = null;
    let time_message = "";


    let format = 'hh:mm:ss'
    let startTime = new moment(tournament.start_time);
    startTime = startTime.format("HH:mm:ss");
    startTime = moment(startTime, format)

    let endTime = new moment(tournament.end_time);
    let endTimeHours = endTime.format("HH:mm:ss");
    endTime = moment(endTimeHours, format)

    let startDate = new moment(tournament.start_date);
    let endDate = new moment(tournament.end_date);

    startDate.set({
        hour: startTime.get('hour'),
        minute: startTime.get('minute'),
        second: startTime.get('second')
    });

    //if the current date is between the start date and end date
    if (today.isBetween(startDate, endDate)) {
        has_started = true;

        //if the current time is between the start and end time and the current time is before the endtime
        if (today.isBetween(startTime, endTime) && today.isBefore(endTime)) {
            //   if the end time is in the future
            avail = true
            in_play = true
            time_left = endTime.valueOf() - today.valueOf();
            time_message = `Ends at ${endTime.format("h:mm A")}`
            //if the current time is before the start
        } else if (today.isBefore(startTime)) {
            time_left = startTime.valueOf() - today.valueOf();
            time_message = `Starts at ${startTime.format("h:mm A")}`
            //if the end time is before the current time
        } else if (endTime.isBefore(today)) {
            let tomorrow = moment().add(1, "day");
            tomorrow.set({
                hour: startTime.get('hour'),
                minute: startTime.get('minute'),
                second: startTime.get('second')
            });

            is_tomorrow = true
            time_left = tomorrow.valueOf() - today.valueOf();
            time_message = `Tomorrow at ${startTime.format("h:mm A")}`
        }
        //if the end date is before the current date
    } else if (endDate.isBefore(today)) {
        has_ended = true;
    } else {
        time_left = startDate.valueOf() - today.valueOf();
    }

    return {has_started, has_ended, avail, in_play, is_tomorrow, time_left, time_message};
}

// @route POST api/tournament/
// @desc
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

// @route POST api/tournament/
// @desc
// @access Public
exports.check_tournament_stats = async function (req, res) {
    try {
        const {tournament_id} = req.body;
        let user_id = req.user.id;

        let result = await check_tournament_stats(tournament_id, user_id)
        return res.status(200).json(result)

    } catch (error) {
        return res.status(500).json(error)
    }
}

async function check_tournament_stats(tournament_id, user_id) {
    let tournament = await prisma.tournament.findFirst({
        where: {
            id: parseInt(tournament_id)

        },
        include: {
            TournamentReward: {
                include: {
                    Reward: {
                        include: {
                            Brand: true
                        }
                    },
                    TournamentWinner: {
                        include: {
                            User: {
                                select: {
                                    username: true,
                                    image: true
                                }
                            }
                        },
                    }
                },
            },
            TournamentMode: {
                include: {
                    GameMode: true
                }
            },
            TournamentCategory: true,
            TournamentUser: {
                include: {
                    User: {
                        select: {
                            username: true,
                            image: true
                        }
                    }
                },
            }
        }

    });

    //Get leaderboard
    let {rewards, winners} = extractWinners(tournament.TournamentReward);

    let users = await formatUser(tournament.TournamentUser);
    let modes = await formatMode(tournament.TournamentMode);

    let leaders = [];
    try {
        let highest_point = await runQuery("points", 1)
        if (highest_point.length > 0) leaders.push({...highest_point[0], title: "Highest Points", type: "points"})

        let best_time = await runQuery("time", 1)
        if (best_time.length > 0) leaders.push({...best_time[0], title: "Best Time", type: "time"})

        let best_success_rate = await runQuery("success", 1)
        if (best_success_rate.length > 0) leaders.push({
            ...best_success_rate[0],
            title: "Best Success Rate",
            type: "success"
        })
    } catch (error) {
        console.log(error)
    }

    //Check the tournament is active (now is between the start time and end time)
    let tournament_active = check_tournament_active(tournament)

    //Get the available points
    let available_points = await get_available_points(tournament.id)

    //Check if the user is registered
    tournament = await checkTournamentRegistration(user_id, tournament);
    tournament_active['is_registered'] = tournament.is_registered;

    //Check if there is a game available for this user
    let tournament_game_check = await checkTournamentGame(user_id, tournament.id);
    tournament_active['next_game'] = tournament_game_check.next_game;
    tournament_active["available_spaces"] = await getAvailableSpaces(tournament.id)
    tournament_active["is_registration_open"] = checkRegistrationOpen(tournament);

    if (tournament_active.avail === true) {
        tournament_active['avail'] = tournament_game_check.new_game_avail;
    }

    return ({...tournament_active, ...available_points, winners, rewards, leaders, users, modes, id: tournament.id})
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
        if (check) return res.status(401).json({
            type: "registered",
            message: "You are already registered for this tournament."
        });

        let isRegistrationOpen = checkRegistrationOpen(tournament);
        //Check if registration is closed
        if (isRegistrationOpen === true) {
            //check if user has enough points
            let can_register = false;

            const user = await UserController.get_user_stats(req.user);
            let points_required = parseInt(tournament.entry_fee);

            if (user.points >= points_required) can_register = true;

            if (!can_register) return res.status(401).json({message: `You need ${points_required} points to register..`});

            // Create a new record for the user for this tournament
            let tournament_user = await prisma.tournamentUser.create({
                data: {
                    userId: user_id,
                    tournamentId: parseInt(tournament_id)
                }
            })

            return await deductPoints(req, res, tournament, tournament_user)
        } else {
            return res.status(401).json({type: "closed", message: "Registration for this tournament has closed."});
        }
    } catch (error) {
        res.status(500).json({type: "error", message: error.message})
    }
};


function checkRegistrationOpen(tournament) {
    const today = moment();
    let registrationCloses = new moment(tournament.registration_closes);
    //Check if registration is open or closed

    if (today.isBefore(registrationCloses)) return true;
    else if (registrationCloses.isBefore(today)) return false;
}


exports.tournament_leaderboard = async function (req, res) {
    try {
        let type = (req.body.type) ? req.body.type : "points";

        let leaderboard = await runQuery(type, req.body.tournament_id)

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
        res.status(500).json(error)
    }
};


async function runQuery(type, tournament_id, limit = 10) {
    try {
        let leaderboard = null;


        let top_users =
            "SELECT user_id FROM(" +
            "SELECT * FROM(" +
            "SELECT user_id, COUNT(*) AS no_of_games_played " +
            "FROM tournament_game tg " +
            "WHERE tg.tournament_id = " + tournament_id + " AND tg.submitted_at IS NOT NULL " +
            "GROUP BY user_id) as e WHERE no_of_games_played > 2) as tu"


        let best_points_query =
            "SELECT * FROM(" +
            "SELECT tournament_game.user_id as user_id, user.username, user.image, SUM((CASE WHEN gq.correct is True THEN qt.points ELSE 0 END)) as points_obtained " +
            "FROM tournament_question gq " +
            "INNER JOIN tournament_game ON gq.tournamentGameId = tournament_game.id " +
            "INNER JOIN question ON gq.questionId = question.id " +
            "INNER JOIN question_type qt ON question.questionTypeId = qt.id " +
            "INNER JOIN user ON tournament_game.user_id = user.id " +
            "WHERE tournament_game.tournament_id = " + tournament_id + " AND tournament_game.submitted_at IS NOT NULL " +
            "GROUP BY user_id " +
            "ORDER BY points_obtained desc " +
            "LIMIT 1) as e"

        // let best_points_user =  await prisma.$queryRawUnsafe(best_points_query)

        let best_time_query =
            "SELECT * FROM(" +
            "SELECT tournament_game.user_id, user.username, user.image, COUNT(tq.id) as questions_answered, SUM(tq.time) as time_taken, SUM(tq.time)/(COUNT(tq.id)) as average_time_per_question " +
            "FROM tournament_question tq " +
            "INNER JOIN tournament_game ON tq.tournamentGameId = tournament_game.id " +
            "INNER JOIN user ON tournament_game.user_id = user.id " +
            "WHERE tournament_game.tournament_id = " + tournament_id + " AND  tq.correct IS NOT NULL AND tournament_game.user_id " +
            "NOT IN (SELECT user_id FROM(" + best_points_query + ") as bt) " +
            "GROUP BY user_id " +
            "ORDER BY average_time_per_question asc " +
            "LIMIT " + limit + "" +
            ") as g WHERE g.user_id IN (" + top_users + ")"

        // let best_time_user =  await prisma.$queryRawUnsafe(best_time_query)


        if (type && type === "points") {
            leaderboard = await prisma.$queryRaw`SELECT * FROM(

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
            WHERE tournament_game.tournament_id = ${tournament_id} AND tournament_game.submitted_at IS NOT NULL
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
        ) as f , (SELECT @rank := 0) m LIMIT ${limit}
        ) as r
       WHERE user_id IN (
       SELECT user_id From(SELECT user_id, COUNT(*) AS no_of_games_played FROM tournament_game tg WHERE tg.submitted_at IS NOT NULL GROUP BY user_id) as e WHERE no_of_games_played > 2)`
        } else if (type && type === "time") {
            leaderboard = await prisma.$queryRawUnsafe(best_time_query)
        } else if (type && type === "success") {

            let success_query = "SELECT * FROM(" +
                "SELECT user.id as user_id, user.username, user.image, points_obtained, points_available,  (points_obtained/points_available) as average_points, ((points_obtained/points_available) * 100) as success_rate " +
                "FROM user " +
                "INNER JOIN " +
                "(SELECT tournament_game.user_id as user_id, user.username, user.image, SUM((CASE WHEN gq.correct is True THEN qt.points ELSE 0 END)) as points_obtained " +
                "FROM tournament_question gq " +
                "INNER JOIN tournament_game ON gq.tournamentGameId = tournament_game.id " +
                "INNER JOIN question ON gq.questionId = question.id " +
                "INNER JOIN question_type qt ON question.questionTypeId = qt.id " +
                "INNER JOIN user ON tournament_game.user_id = user.id " +
                "WHERE tournament_game.submitted_at IS NOT NULL " +
                "GROUP BY user_id " +
                "ORDER BY points_obtained desc) game_points ON game_points.user_id = user.id " +
                "LEFT JOIN (" +
                "SELECT user_id, SUM(tg.points_available) as points_available " +
                "FROM tournament_game tg " +
                "WHERE tg.submitted_at IS NOT NULL " +
                "GROUP BY user_id) points_available ON points_available.user_id = user.id " +
                "WHERE points_available.user_id NOT IN (SELECT user_id FROM(" + best_points_query + ") as bp) " +
                "ORDER BY success_rate desc" +
                ") as r LIMIT " + limit + ""

            leaderboard = await prisma.$queryRawUnsafe(success_query)
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
        const all_tournaments = await checkTournaments(req.user.id, tournament.id)
        return res.status(200).json(all_tournaments);
    } catch (error) {
        await prisma.tournamentUser.delete({where: {id: tournament_user.id}})
        res.status(500).json(error)
    }
}


async function get_available_points(tournament_id) {
    try {
        const today = moment();
        let start = today.startOf('day').format('YYYY-MM-DD HH:mm');

        const tournament = await prisma.tournament.findFirst({where: {id: parseInt(tournament_id)}});

        const pointsInPlay = await prisma.tournamentGame.aggregate({
            where: {
                tournamentId: parseInt(tournament_id),
                submittedAt: null,
                initiatedAt: {gte: new Date(start)},
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
                initiatedAt: {gte: new Date(start)},
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


async function getAvailableSpaces(tournament_id) {
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


function extractWinners(rewards) {
    try {
        let all_rewards = [];
        let all_winners = [];
        rewards.map((obj, idx) => {

            let position = obj.position;
            let reward = obj.Reward;
            let winners = obj.TournamentWinner;

            reward['position'] = position
            reward['image'] = obj.Reward.Brand.image

            all_rewards.push(reward)

            winners.map((winner, idx) => winners[idx]["position"] = position)

            all_winners = [...all_winners, ...winners]
        })

        all_winners.map((prize, idx) => {
            all_winners[idx] = {...all_winners[idx], ...all_winners[idx]['User']}

            delete all_winners[idx]['User']
        })

        return {winners: all_winners, rewards: all_rewards};

    } catch (error) {
        console.log(error)
        return [];
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
            let {easy, intermediate, hard, bonus} = modes[j]['GameMode'];

            let questions = parseInt(easy) + parseInt(intermediate) + parseInt(hard)

            let points = 0;
            if (keys.includes("easy")) points = points + (parseInt(easy) * levels["easy"])
            if (keys.includes("intermediate")) points = points + (parseInt(intermediate) * levels["intermediate"])
            if (keys.includes("hard")) points = points + (parseInt(hard) * levels["hard"])
            if (keys.includes("bonus")) points = points + (parseInt(bonus) * levels["bonus"])

            modes[j]["points"] = points

            bonus = bonus > 0 ? `+ ${bonus} bonus` : "";
            modes[j]["questions"] = `${questions} questions ${bonus}`

        }

        return modes;

    } catch (error) {
        console.log(error)
        return [];
    }
}

async function formatUser(users) {
    for (let j = 0; j < users.length; j++) {
        let {userId, User} = users[j];

        users[j] = {userId, ...User}
    }

    return users;
}


async function checkTournamentRegistration(user_id, tournament) {
    try {
        //Check if the user has already registered for this tournament
        const check = await prisma.tournamentUser.findFirst({where: {userId: user_id, tournamentId: tournament.id}})
        tournament['is_registered'] = !!(check); //(check) ? true : false;

        if (check) {
            //If user is registered, check if they have any game avaialable
            try {
                let tournament_game_check = await checkTournamentGame(user_id, tournament.id);
                tournament = {...tournament, ...tournament_game_check}
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

async function checkTournamentGame(user_id, tournament_id) {
    try {
        let next_game = null
        let new_game_avail = false;

        let today = moment();
        let start = today.startOf('day').format('YYYY-MM-DD HH:mm');
        //Get the most recent game played for this tournament
        const game = await prisma.tournamentGame.findFirst({
            where: {
                tournamentId: tournament_id,
                userId: user_id,
                initiatedAt: {gte: new Date(start)},
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
        return {new_game_avail, next_game};
    } catch (error) {
        throw error
    }
}

// POINTS UPDATE
async function push_update(tournament_id) {
    try {
        let tournament = await prisma.tournament.findUnique({where: {id: parseInt(tournament_id)}})
        if (tournament) {
            let result = await getAvailableSpaces(tournament_id)
            await pusher.trigger(`tour_${tournament.id}_${slugify(tournament.name)}`, "space-update", result);
        }
    } catch (error) {
        console.log(error)
    }
}


// @route GET api/user/{id}/prizes/
// @desc Returns all the tournament prizes for a specific user
// @access Public
exports.user_rewards = async function (req, res) {
    try {
        let rewards = await prisma.tournamentWinner.findMany({
            where: {
                userId: parseInt(req.user.id)
            },
            include: {
                TournamentReward: {
                    include: {
                        Reward: true,
                        Tournament: true,
                        GiftCard: true,
                    },
                }
            },
        })

        rewards = formatRewards(rewards)
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json(error)
    }
};


function formatRewards(rewards) {
    rewards.forEach((obj, idx) => {

        let tournament_reward = obj["TournamentReward"]

        obj["tournament"] = tournament_reward["Tournament"]

        let reward = tournament_reward["Reward"]
        delete reward["id"]
        obj["TournamentReward"] = {...tournament_reward, ...reward}

        // let gift_cards = obj["TournamentPrize"]["GiftCard"]
        // obj["gift_card"] = gift_cards.length > 0 ? gift_cards[0] : null

        // delete obj["TournamentPrize"]["GiftCard"]
        delete obj["TournamentReward"]["Reward"] //["Reward"]
    });

    return rewards;
}

exports.checkTournamentGame = checkTournamentGame;
exports.getAvailablePoints = get_available_points;
exports.checkTournamentStats = check_tournament_stats;
