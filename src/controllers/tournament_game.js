const prisma = require('../config/prisma')

const QuestionController = require('../controllers/question');
const TournamentController = require('../controllers/tournament');

const {checkAnswers, getNextTournamentGameTime} = require("../utils/check-game");
const pusher = require("../config/pusher");
const {slugify, shuffle} = require("../utils/slugify");

async function saveGameQuestions(req, res, game, questions) {
    try {
        //create the game questions
        let formatted_questions = []
        questions.forEach((question) =>
            formatted_questions.push({tournamentGameId: game.id, questionId: question.id, time:0}));
        //insert into database
        await prisma.tournamentQuestion.createMany({data: formatted_questions, skipDuplicates: true})

        await push_points(game.tournamentId, req.user.id)

        await read(req, res, game, "New Tournament Game created.")

    } catch (error) {
        await prisma.tournamentGame.delete({where: {id: game.id}})

        await push_points(game.tournamentId, req.user.id)

        res.status(500).json(error)
    }
}

// POINTS UPDATE
async function push_points(tournament_id, user_id){
    try {
        let tournament = await prisma.tournament.findUnique({where: {id:parseInt(tournament_id)}})
        if (tournament){
            let result = await TournamentController.checkTournamentStats(tournament_id, user_id)
            await pusher.trigger(`tour_${tournament.id}_${slugify(tournament.name)}`, "points-update",  JSON.stringify(result));
        }
    }catch (error) {
        console.log(error)
    }
}

//Create
exports.create = async function (req, res) {
    let user_id = req.user.id;
    const {tournament_id, tournament_mode_id} = req.body;

    //Make sure the tournament exist
    let tournament = await prisma.tournament.findUnique({where: {id:parseInt(tournament_id)}})
    if (!tournament) return res.status(401).json({error: {message: "This tournament does not exist."}});

    //Check if the user has registered for tournament
    const user_check = await prisma.tournamentUser.findFirst({where: {userId: user_id, tournamentId:parseInt(tournament_id)}})
    if (!user_check) return res.status(401).json({error: {message: "You are not registered for this tournament."}});

    //check the mode exists
    const mode = await prisma.tournamentMode.findFirst({where: {id: parseInt(tournament_mode_id)}})
    if (!mode) return res.status(401).json({success: false, "message": "Mode does not exist!!"})

    //check the points required for this mode
    let modePoints = await checkModePoints(mode)
    if (!modePoints) return res.status(401).json({message: "Something went wrong. Please try again later."});

    //check the points remaining for tournament
    let {points_remaining} = await TournamentController.getAvailablePoints(tournament_id);

    if (points_remaining < modePoints){
        return res.status(401).json({success: false, "message": "There isn't enough points available for this mode. Please pick another mode."})
    }else{
        //Check if there is a game available for this user
        let tournament_game_check = await TournamentController.checkTournamentGame(user_id, tournament.id);
        tournament = {...tournament, ...tournament_game_check}

        //if new game available is available, creates new game
        if (tournament.new_game_avail === true) return await store(req, res, tournament, tournament_mode_id)
        else {
            let errorMessage = "You have run put of games for the day."
            if (tournament.next_game !== null) errorMessage = tournament.next_game.message
            return res.status(401).json({message: errorMessage});
        }
    }
}


async function checkModePoints(mode) {
    try {
        //Get levels
        const questionTypes = await prisma.questionType.findMany()
        let levels = {}
        questionTypes.forEach((obj) => levels[obj.name] = obj.points);

        let keys = Object.keys(levels)
        let {easy, intermediate, hard, bonus} = mode;

        let points = 0;
        if (keys.includes("easy")) points = points + (parseInt(easy) * levels["easy"])
        if (keys.includes("intermediate")) points = points + (parseInt(intermediate) * levels["intermediate"])
        if (keys.includes("hard")) points = points + (parseInt(hard) * levels["hard"])
        if (keys.includes("bonus")) points = points + (parseInt(bonus) * levels["bonus"])

        return points;

    } catch (error) {
        console.log(error)
        return null;
    }


}

//Create
const store = async function (req, res, tournament, tournament_mode_id) {
    let user_id = req.user.id;

    //get the questions
    const result = await QuestionController.tournament_questions(tournament_mode_id);
    if (result.success === true) {
        let {questions, points_available, time_available} = result.data;

        let tournament_game = {
            userId: user_id,
            timeAvailable: time_available,
            pointsAvailable: points_available,
            tournamentId: parseInt(tournament.id),
            tournamentModeId: parseInt(tournament_mode_id)
        }

        //calculate the time for the next game
        let next_game = getNextTournamentGameTime(tournament.end_time);
        if (next_game !== null) tournament_game['nextGameAt'] = next_game;

        //create the game
        const new_game = await prisma.tournamentGame.create({data: tournament_game})
        await saveGameQuestions(req, res, new_game, questions)
    } else {
        res.status(500).json({message: result.message || "No Questions Available. Please try later."})
    }
}

//Read
const read = async function (req, res, game) {
    //get its questions
    const game_questions = await prisma.tournamentQuestion.findMany({
        where: {tournamentGameId: parseInt(game.id)},
        select: {
            id: true,
            TournamentGame: {
                include: {
                    TournamentMode: true,
                    Tournament: {
                        include: {
                            TournamentPrize: {
                                include: {
                                    Prize: {
                                    }
                                },
                            }
                        },
                    }
                },
            },
            question: {
                include: {
                    questionType: true,
                },
            }
        }
    })


    let index = 0
    let prizes = []
    let all_prizes = []
    let tournament_mode = null;
    let tournament = null;
    let game_questions_formatted = []
    game_questions.forEach((game_question) => {
        //extract the prizes from the first record -
        if (index === 0) {
            tournament = game_question.TournamentGame.Tournament;
            all_prizes = game_question.TournamentGame.Tournament.TournamentPrize;
            tournament_mode = game_question.TournamentGame.TournamentMode;
        }

        let game_question_id = game_question.id;
        let {id, text, time, choice_one, choice_two, choice_three, choice_four, answer, questionType} = game_question.question;
        let {points} = questionType;

        let formatted_question = {game_question_id, id, text, time, answer, points, selected: null}
        let choices = [choice_one, choice_two, choice_three,choice_four]
        formatted_question["choices"] = JSON.stringify(shuffle(choices))

        game_questions_formatted.push(formatted_question)
        index++;
    });

    all_prizes.forEach((prize) => {
        let the_prize = prize.Prize;
        the_prize['position'] = prize.position;
        prizes.push(the_prize)
    });

    game['tournament'] = tournament;
    game['questions'] = shuffle(game_questions_formatted);
    game['prizes'] = prizes;
    game['tournament_mode'] = tournament_mode;

    res.status(200).json(game)
}


// @route POST api/tournament/
// @desc
// @access Public
exports.activity = async function (req, res) {
    try {
        const {tournament_id} = req.body;
        const games = await prisma.tournamentGame.findMany({
            where: {
                tournamentId: parseInt(tournament_id),
                NOT: {submittedAt: null}
            },
            select: {
                pointsObtained: true,
                submittedAt: true,
                User: {
                    select: {
                        id:true,
                        username:true,
                        image:true,
                    }
                },
                TournamentMode: {
                    select: {
                        name:true
                    }
                },
            }
        })

        let activities = []
        games.forEach((game) => {
            let {pointsObtained, submittedAt, User:{id, username, image}, TournamentMode:{name}} = game;
            let activity = {id, username, image, mode:name, pointsObtained, date:submittedAt}
            activities.push(activity)
        });

        return res.status(200).json(activities)
    } catch (error) {
        return res.status(500).json(error)
    }
}



exports.validate = async function (req, res) {
    const {game_id, questions} = req.body;

    const game = await prisma.tournamentGame.findFirst({where: {id: game_id}})
    if (!game) return res.status(404).json({success: false, error: {message: "Tournament Game does not exist!"}});

    if (game.submittedAt === null) {
        try {
            let {prisma_array, points_obtained, correct_answers, wrong_answers, skipped} = validateQuestions(questions);
            await prisma.$transaction(prisma_array);

            let percent = parseFloat(((points_obtained * 100) / game.pointsAvailable).toFixed(2));
            const updatedGame = await prisma.tournamentGame.update({
                where: {id: game_id},
                data: {
                    correctAnswers: correct_answers,
                    wrongAnswers: wrong_answers,
                    skipped,
                    pointsObtained: points_obtained,
                    percent,
                    submittedAt: new Date()
                }
            })

            await push_points(updatedGame.tournamentId, req.user.id)

            res.status(200).json({success: true, game: updatedGame, message: "Congratulations"})
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(404).json({message: "This game has previously been validated!"});
    }
}


// @route GET api/user/{id}/games/
// @desc Returns all games for a specific user
// @access Public
exports.user_games = async function (req, res) {
    try {
        const id = req.params.id;
        const games = await prisma.tournamentGame.findMany({
            where: {
                userId: parseInt(id),
                NOT: {
                    submittedAt: null
                },
            },
            include:{
                Tournament:true
            }
        });

        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({error})
    }
};


function validateQuestions(questions){
    let {queries, points_obtained, correct_answers, wrong_answers, skipped} = checkAnswers(questions);

    let prisma_array = [];
    queries.map((query) => {
            let gq = prisma.tournamentQuestion.update(query)
            prisma_array.push(gq)
        }
    );

    return {prisma_array, points_obtained, correct_answers, wrong_answers, skipped};
}
exports.read = read;
