const prisma = require("../config/prisma");
const moment = require("moment");

exports.checkGame = async function (challengeIdentifier, user_id) {
    try {
        let game;
        game = await prisma.game.findFirst({
            where: {
                challengeIdentifier: challengeIdentifier,
                userId:user_id,
            },
            orderBy: {
                initiatedAt: "desc"
            }
        });

        return game;
    } catch (error) {
        throw error
    }
}

const format = 'HH:mm:ss'

exports.getNextGameTime = function (challengeEndTime) {
    let check = moment()
    let month = check.format('M'),
        date = check.format('D'),
        year = check.format('YYYY')

    challengeEndTime = moment(challengeEndTime)
    challengeEndTime.set('year', year);
    challengeEndTime.set('month', month-1);
    challengeEndTime.set('date', date);

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

exports.checkAnswers = function (questions) {
    let points_obtained = 0;
    let correct_answers = 0;
    let wrong_answers = 0;
    let skipped = 0;

    let queries = [];

    questions.map((question) => {
            const {selected, answer, points, points_earned, time_taken} = question;
            let correct = null;

            if (selected === answer) {
                correct = true
                correct_answers++
                points_obtained = points_obtained + points_earned;
            } else if (selected !== null) {
                correct = false
                wrong_answers++
            } else skipped++


        let query = {where: {id: question.game_question_id}, data: {correct, time:time_taken}}
        queries.push(query)
        }
    );

    return {queries, points_obtained, correct_answers, wrong_answers, skipped};
}
