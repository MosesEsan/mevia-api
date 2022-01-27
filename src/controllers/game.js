const moment = require('moment')
const prisma = require('../config/prisma')

const QuestionController = require('../controllers/question');
const ChallengeController = require('../controllers/challenge');

const format = 'HH:mm:ss'

function getNextGameTime(challengeEndTime) {
    //calculate the time for the next game
    let timePlusThirty = moment().add(30, 'minutes')
    timePlusThirty = moment(timePlusThirty, format)

    let nextGame = null;
    //If the next game is before the end of the current challenge
    if (timePlusThirty.isBefore(challengeEndTime)) {
        nextGame = new Date(timePlusThirty.format("YYYY-MM-DDTHH:mm:ss.000Z"));
    }

    return nextGame;
}

async function saveGameQuestions(req, res, game, questions) {
    try {
        //create the game questions
        let formatted_questions = []
        questions.forEach((question) =>
            formatted_questions.push({gameId: game.id, questionId: question.id}));

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
    const challenge = await ChallengeController.checkWeeklyChallenge();

    if (challenge && challenge.WeeklyPrize.length > 0){
        //Before creating a game check if the available challenge times
        let result = await ChallengeController.checkChallenges(user_id, challenge)

        //if it has a next game and the next game available is ready (prev game submitted)
        // (creates new game)
        if (result.new_game_avail === true) {
            let current_challenge = {...challenge, ...result.current_challenge}
            await store(req, res, current_challenge)
        }

        //if is valid is true (prev game not submitted, next game in future) (return the the gajme)
        else if (result.current_game_avail === true && result.current_game !== null) {
            await read(req, res, result.current_game, "Game already exist.")
        }

        //if it has a next game but the next game available is not ready (prev game submitted)
        else if (result.next_game !== null) {
            res.status(200).json(result)
        }

        else {
            res.status(200).json(result)
        }
    }else{
        res.status(401).json({error: {message: "No Challenges available."}})
    }
}

//Create
const store = async function (req, res, challenge) {
    let user_id = req.user.id;
    let {challenge_end_time, challenge_identifier} = challenge;

    //calculate the time for the next game
    let nextGame = getNextGameTime(challenge_end_time);

    //get the questions
    const result = await QuestionController.random();

    if (result.success === true) {
        let {questions, points_available, time_available} = result.data;

        let gameData = {
            userId: user_id,
            challengeIdentifier: challenge_identifier,
            pointsAvailable: points_available, timeAvailable: time_available,
            weeklyChallengeId: challenge.id
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
            game: {
                include: {
                    WeeklyChallenge: {
                        include: {
                            WeeklyPrize: {
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

    // console.log(game_questions)


    let index = 0
    let prizes = []
    let all_prizes = []
    let weekly_challenge = ""
    let game_questions_formatted = []
    game_questions.forEach((game_question) => {
        //extract the prizes from the first record -
        if (index === 0) {
            weekly_challenge = game_question.game.WeeklyChallenge;
            all_prizes = game_question.game.WeeklyChallenge.WeeklyPrize;
        }

        let game_question_id = game_question.id;
        let {id, text, time, choice_one, choice_two, choice_three, choice_four, answer, questionType} = game_question.question;
        let {points} = questionType;

        let formatted_question = {game_question_id, id, text, time, answer, points, selected: null}
        formatted_question["choices"] = JSON.stringify([choice_one, choice_two, choice_three,choice_four])

        game_questions_formatted.push(formatted_question)
        index++;
    });

    all_prizes.forEach((prize) => {
        let the_prize = prize.Prize;
        the_prize['position'] = prize.position;
        prizes.push(the_prize)
    });

    game['weekly_challenge'] = weekly_challenge;
    game['questions'] = game_questions_formatted;
    game['prizes'] = prizes;

    res.status(200).json({success: true, game, message})
}




exports.validate = async function (req, res) {
    const {game_id, questions} = req.body;

    const game = await prisma.game.findFirst({where: {id: game_id}})
    if (!game) return res.status(404).json({success: false, error: {message: "Game does not exist!"}});

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
            res.status(500).json({error})
        }
    } else {
        res.status(404).json({error: {message: "This game has previously been validated!"}});
    }
}


// @route GET api/user/{id}/games/
// @desc Returns all games for a specific user
// @access Public
exports.user_games = async function (req, res) {
    try {
        const id = req.params.id;
        const games = await prisma.game.findMany({
            where: {
                userId: parseInt(id),
                NOT: {
                    submittedAt: null
                },
            },
            include:{
                WeeklyChallenge:true
            }
        });

        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({error})
    }
};

function checkAnswers(questions) {
    let points_obtained = 0;
    let correct_answers = 0;
    let wrong_answers = 0;
    let skipped = 0;

    let prisma_array = [];

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
