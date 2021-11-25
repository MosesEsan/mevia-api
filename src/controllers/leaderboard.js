const {PrismaClient} = require('@prisma/client')
const moment = require("moment");

const prisma = new PrismaClient()

const logger = require('../../logger')();


// // @route GET api/user/{id}
// // @desc Returns a specific user
// // @access Public
exports.index = async function (req, res) {
    try {
        let type = (req.body.type) ? req.body.type : "week";

        const today = moment();
        let startOfWeek = today.startOf('week').format('YYYY-MM-DD HH:mm');
        let endOfWeek = today.endOf('week').format('YYYY-MM-DD HH:mm');

        let start = moment(startOfWeek).add(1, 'days')
        let end = moment(endOfWeek).add(1, 'days')

        if (type === "today") {
            // Today
            let startOfDay = moment().startOf('day').format('YYYY-MM-DD HH:mm');
            let endOfDay = moment().endOf('day').format('YYYY-MM-DD HH:mm');

            start = moment(startOfDay)
            end = moment(endOfDay)

            console.log("Start")
            console.log(start)
            console.log(end)
            console.log("End")

        } else if (type === "month") {
            // Month
            let startOfMonth = moment().startOf('month').format('YYYY-MM-DD HH:mm');
            let endOfMonth = moment().endOf('month').format('YYYY-MM-DD HH:mm');

            start = moment(startOfMonth)
            end = moment(endOfMonth)
        }


        console.log(new Date(start))
        console.log(new Date(end))

        const leaderboard = await prisma.$queryRaw`
            SELECT user.id as user_id, user.username, COALESCE(points_obtained, 0) AS points, COALESCE(points_available, 0) AS points_available, 
            COALESCE(no_of_games_played, 0) AS no_of_games_played,
            (points_obtained/no_of_games_played) as average
            FROM user
            INNER JOIN 
            (SELECT game.userId as user_id, user.username, SUM((CASE WHEN gq.correct is True THEN qt.points ELSE 0 END)) as points_obtained
            FROM game_question gq
            INNER JOIN game  ON gq.gameId = game.id 
            INNER JOIN question ON gq.questionId = question.id 
            INNER JOIN question_type qt ON question.questionTypeId = qt.id
            INNER JOIN user ON game.userId = user.id
            WHERE game.submittedAt IS NOT NULL
            AND game.initiatedAt BETWEEN ${new Date(start)} AND ${new Date(end)}
            GROUP BY user_id
            ORDER BY points_obtained desc) game_points ON game_points.user_id = user.id 
            LEFT JOIN (
            SELECT userId, COUNT(*) AS no_of_games_played
            FROM game
            WHERE game.submittedAt IS NOT NULL
            AND game.initiatedAt BETWEEN ${new Date(start)} AND ${new Date(end)}
            GROUP BY userId) no_of_games_played ON no_of_games_played.userId = user.id
            LEFT JOIN (
            SELECT userId, SUM(game.pointsAvailable) as points_available
            FROM game
            WHERE game.submittedAt IS NOT NULL
            AND game.initiatedAt BETWEEN ${new Date(start)} AND ${new Date(end)}
            GROUP BY userId) points_available ON points_available.userId = user.id
            ORDER BY points desc, no_of_games_played desc 
            LIMIT 10`

        console.log("leaderboard")
        console.log(leaderboard)
        console.log("leaderboard")


        let top_leaders = []
        leaderboard.map((user, idx) => {
            user['id'] = idx + 1;
            user['rank'] = idx + 1;
            if (idx < 3) top_leaders.push(user)
        })

        res.status(200).json({success: true, data: {leaderboard, top_leaders}});
    } catch (e) {
        logger.error(e);
        res.status(500).json({success: false, message: e.message})
    }
};


// UNION
// (SELECT
// game.userId as user_id,
//     user.username,
//     0 as points_obtained,
//     sum(game.pointsAvailable) as points_available,
//     count(game.userId) as no_of_games_played,
//     (sum(qt.points)/count(game.userId)) as average
//
// FROM game_question gq
// INNER JOIN question ON gq.questionId = question.id
// INNER JOIN game ON gq.gameId = game.id
// INNER JOIN question_type qt ON question.questionTypeId = qt.id
// INNER JOIN user ON game.userId = user.id
// WHERE game.submittedAt IS NOT NULL AND gq.correct is False AND game.initiatedAt BETWEEN ${new Date(start)} AND ${new Date(end)}
// GROUP BY game.userId
// ORDER BY points_obtained desc, no_of_games_played desc)
