const moment = require("moment");
const logger = require('../../logger')();

const prisma = require("../config/prisma");

// // @route GET api/
// // @desc
// // @access Public
exports.index = async function (req, res) {
    try {
        let type = (req.body.type) ? req.body.type : "week";
        let data = await getLeaderboard(10, type);

        res.status(200).json(data);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error)
    }
};


async function getLeaderboard(limit, type=null) {

    let leaderboard = []
    let selected_type = null
    let title = ""


    if (type){
        leaderboard = await runQuery(type, limit)
    }else{
        let types = ["today", "week", "month"]
        let titles = ["Today's", "This Week", "This Month"]

        for (let i = 0; i < types.length; i++) {
            if (leaderboard.length === 0){
                let type = types[i]
                selected_type = type
                title = titles[i]
                let response = await runQuery(type, limit)

                if (response.length > 0) {
                    leaderboard = response;
                    break;
                }
            }
        }
    }

    let top_leaders = []
    leaderboard.map((user, idx) => {
        user['id'] = idx + 1;
        if (idx < 3) top_leaders.push(user)
    })

    return {
        leaderboard,
        top_leaders,
        title: `${title} Leaders`,
        // message: `The current reigning champions of the ${selected_type}`
    };
}


async function runQuery(type, limit=10) {
    try {
        const today = moment()
        let startOfWeek = today.startOf('isoWeek').format('YYYY-MM-DD HH:mm');
        let endOfWeek = today.endOf('isoWeek').format('YYYY-MM-DD HH:mm');

        let start = moment(startOfWeek)
        let end = moment(endOfWeek)

        if (type === "today") {
            // Today
            let startOfDay = moment().startOf('day').format('YYYY-MM-DD HH:mm');
            let endOfDay = moment().endOf('day').format('YYYY-MM-DD HH:mm');

            start = moment(startOfDay)
            end = moment(endOfDay)
        } else if (type === "month") {
            // Month
            let startOfMonth = moment().startOf('month').format('YYYY-MM-DD HH:mm');
            let endOfMonth = moment().endOf('month').format('YYYY-MM-DD HH:mm');

            start = moment(startOfMonth)
            end = moment(endOfMonth)
        }

        const leaderboard = await prisma.$queryRaw`
        SELECT @rank := @rank + 1 rank, user_id, username, image, points, points_available, no_of_games_played, ceil(average) as average 
        FROM
        (
            SELECT user.id as user_id, user.username, user.image, COALESCE(points_obtained, 0) AS points, COALESCE(points_available, 0) AS points_available, 
            COALESCE(no_of_games_played, 0) AS no_of_games_played,
            (points_obtained/no_of_games_played) as average
            FROM user
            INNER JOIN 
            (SELECT game.userId as user_id, user.username, user.image, SUM((CASE WHEN gq.correct is True THEN qt.points ELSE 0 END)) as points_obtained
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
        ) as f , (SELECT @rank := 0) m LIMIT ${limit}`;

        return leaderboard;

    } catch (error) {
        throw error;
    }
}

exports.runQuery = runQuery;
exports.getLeaderboard = getLeaderboard;
