const moment = require('moment')
const prisma = require('../config/prisma')

const QuestionController = require('../controllers/question');
const ChallengeController = require('../controllers/challenge');
const {get_next_game, isGameValid} = require('../utils/isGameValid');
const {checkGame} = require("../utils/check-game");

const format = 'HH:mm:ss'


function getNextGameTime(challengeEndTime) {
    //calculate the time for the next game
    let timePlusThirty = moment().add(30, 'minutes').format("HH:mm:ss");
    timePlusThirty = moment(timePlusThirty, format)

    let nextGame = null;
    //If the next game is before the end of the current challenge
    if (timePlusThirty.isBefore(challengeEndTime)) {
        let date = moment();
        timePlusThirty.set({
            year: date.get('year'),
            month: date.get('month'),
            day: date.get('day')
        });

        nextGame = new Date(timePlusThirty.format("YYYY-MM-DDTHH:mm:ss.000Z"));
    }

    return nextGame;
}


// exports.checkGame = async (challengeIdentifier) => {
//     try {
//         let userId = 25
//         const game = await prisma.game.findFirst({
//             where: {
//                 challengeIdentifier: challengeIdentifier,
//                 userId,
//             },
//             orderBy: {
//                 initiatedAt: "desc"
//             }
//         })
//
//         return game;
//     } catch (error) {
//         throw error
//     }
// }

async function saveGameQuestions(req, res, game, questions) {
    try {
        //create the game questions
        let formatted_questions = []
        questions.forEach((question) =>
            formatted_questions.push({gameId: game.id, questionId: question.id}));
        console.log(formatted_questions)

        //insert into database
        await prisma.gameQuestion.createMany({data: formatted_questions, skipDuplicates: true})
        await read(req, res, game, "New Game created.")

    } catch (error) {
        await prisma.game.delete({where: {id: game.id}})
        res.status(500).json({success: false, error})
    }
}

//Create
exports.create = async function (req, res) {
    let user_id = req.user.id;
    //Before creating a game check if challenge is available
    let result = await ChallengeController.checkChallenges(user_id)
    let {challenge} = result;
    let {avail, challenge_identifier} = challenge;

    console.log(result)
    console.log("avail", avail)
    console.log("challenge_identifier", challenge_identifier)


    //if it has a next game and the next game available is ready (prev game submitted)
    // (creates new game)
    if (challenge.new_game === true) {
        console.log("1")
        await store(req, res, challenge)
    }

    //if it has a next game but the next game available is not ready (prev game submitted)
    else if (challenge.next_game !== null) {
        console.log("2")
        res.status(200).json(result)
    }

    //if is valid is true (prev game not submitted, next game in future) (return the the gajme)
    else if (challenge.current_game === true) {
        console.log("3")
        await read(req, res, challenge.current_game, "Game already exist.")
    }

    else {
        res.status(200).json(result)
    }


    // if (avail && challenge_identifier !== null) {
    //     //Check if there hs been any game created for this user for this challenge
    //     try {
    //         const game = await checkGame(challenge_identifier, user_id)
    //         console.log(game)
    //
    //         const {is_valid, has_next_game, next_game_avail, message} = await isGameValid(game);
    //         console.log(is_valid, has_next_game, next_game_avail, message)
    //
    //
    //         //if it has a next game and the next game available is ready (prev game submitted)
    //         // (creates new game)
    //         if (game == null || (has_next_game === true && next_game_avail === true)) {
    //             await store(req, res, challenge)
    //         }
    //
    //         //if it has a next game but the next game available is not ready (prev game submitted)
    //         else if (has_next_game === true && next_game_avail === false) {
    //             res.status(200).json({success: false, data:get_next_game(game)})
    //         }
    //
    //         //if is valid is true (prev game not submitted, next game in future)
    //         else if (is_valid === true) {
    //             await read(req, res, game, "Game already exist.")
    //         }
    //
    //         //if is valid is false (prev game not submitted, next game has passed)
    //         else if (is_valid === false) {
    //             res.status(200).json({success: false, message})
    //         }
    //
    //     } catch (error) {
    //         console.log(error)
    //         res.status(500).json({success: false, error: error})
    //     }
    // } else {
    //     res.status(200).json(result)
    // }
}

//Create
const store = async function (req, res, challenge) {
    let user_id = req.user.id;
    let {avail, challenge_end_time, challenge_identifier} = challenge;
    // TODO - Check how many games left for this challenge before creating a new game

    //calculate the time for the next game
    let nextGame = getNextGameTime(challenge_end_time);

    //get the questions
    const result = await QuestionController.random();

    if (result.success === true) {
        let {questions, points_available, time_available} = result.data;

        let gameData = {
            userId: user_id,
            challengeIdentifier: challenge_identifier,
            pointsAvailable: points_available, timeAvailable: time_available
        }
        if (nextGame !== null) gameData['nextGameAt'] = nextGame

        //create the game
        const newGame = await prisma.game.create({data: gameData})
        await saveGameQuestions(req, res, newGame, questions)
    } else {
        res.status(500).json({
            success: false,
            error: {message: result.message || "No Questions Available. Please try later."}
        })
    }
}

//Read
const read = async function (req, res, game, message) {
    //get its questions
    const game_questions = await prisma.gameQuestion.findMany({
        where: {gameId: game.id},
        select: {
            id: true,
            question: {
                include: {
                    questionType: true,
                },
            }
        }
    })

    var game_questions_formatted = []
    game_questions.forEach((game_question) => {
        let game_question_id = game_question.id;
        let {id, text, time, choices, answer, questionType} = game_question.question;
        let {points} = questionType;

        let formatted_question = {game_question_id, id, text, time, choices, answer, points, selected: null}
        game_questions_formatted.push(formatted_question)
    });

    game['questions'] = game_questions_formatted;

    res.status(200).json({success: true, game, message})
}


exports.validate = async function (req, res) {
    const {game_id, questions} = req.body;

    //create the game
    const game = await prisma.game.findFirst({where: {id: game_id}})
    if (!game) return res.status(404).json({success: false, error: {message: "Game does not exist!"}});

    console.log(game)
    if (game.submittedAt === null) {
        try {
            let {prisma_array, points_obtained, correct_answers, wrong_answers, skipped} = checkAnswers(questions);
            await prisma.$transaction(prisma_array);

            let percent = parseFloat(((points_obtained * 100) / game.pointsAvailable).toFixed(2));
            const updatedGame = await prisma.game.update({
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

            res.status(200).json({success: true, game: updatedGame, message: "Congratulations"})
        } catch (error) {
            res.status(500).json({success: false, error: error})
        }
    } else {
        res.status(404).json({success: false, error: {message: "This game has previously been validated!"}});
    }
}

function checkAnswers(questions) {
    let points_obtained = 0;
    let correct_answers = 0;
    let wrong_answers = 0;
    let skipped = 0;

    let prisma_array = [];

    console.log("==questions===")
    console.log(questions)
    console.log("=====")

    questions.map((question) => {
            const {selected, answer, points} = question;
            let correct = null;

            if (selected === answer) {
                correct = true
                correct_answers++
                points_obtained = points_obtained + points;
            } else if (selected !== null) {
                correct = false
                wrong_answers++
            } else skipped++

            let gq = prisma.gameQuestion.update({where: {id: question.game_question_id}, data: {correct}})
            prisma_array.push(gq)
        }
    );

    return {prisma_array, points_obtained, correct_answers, wrong_answers, skipped};
}
