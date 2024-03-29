const fs = require('fs');
const {PutObjectCommand} = require("@aws-sdk/client-s3");

const prisma = require('../config/prisma')
const {s3Client, AWS_BUCKET_NAME, REGION} = require("../config/aws");

const logger = require('../../logger')();

// @route GET api/user
// @desc Returns all userss
// @access Public
exports.index = async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', users.length)
        res.status(200).json(users)
    } catch (error) {
        throw error
    }
}

// // @route GET api/user/{id}
// // @desc Returns a specific user
// // @access Public
exports.read = async function (req, res) {
    try {
        user = await get_user(parseInt(req.params.id));
    } catch (error) {
        logger.error(error);
        res.status(500).json(error)
    }
};


const get_user = async (id) => {
    try {
        let user = await prisma.user.findUnique({
            where: {id: parseInt(id)},
            include: {
                ShippingInfo: true,
            }
        })

        if (!user) return res.status(401).json({message: 'User does not exist'});

        const shippingInfo = user.ShippingInfo || []

        if (shippingInfo.length > 0) {
            const {id, ...clone} = shippingInfo[0];
            user = {...user, ...clone};
        }

        delete user['ShippingInfo']

        user = await get_user_stats(user)
        user = await get_user_rank(user)
        return user;
    } catch (error) {
        throw error;
    }
}

// @route PUT api/user/{id}
// @desc Update user details
// @access Public
exports.update = async function (req, res) {
    try {
        let user_id = req.user.id;
        const data = req.body;
        const id = req.params.id;

        //Make sure the passed id is that of the logged in user
        if (user_id.toString() !== id.toString()) return res.status(401).json({error: {message: "Sorry, you don't have the permission to update this data."}});

        const user = await prisma.user.update({where: {id: parseInt(id)}, data})
        res.status(200).json(user);
    } catch (error) {

        console.log(error)
        res.status(500).json(error);
    }
};


const get_user_stats = async (user) => {
    try {
        //Get The Game Points
        const game_points = await prisma.game.aggregate({
            where: {
                userId: parseInt(user.id),
                NOT: {
                    submittedAt: null
                },
            },
            _sum: {
                pointsObtained: true,
            },
            _count: {
                id: true,
            },
        });
        let games_points = game_points._sum.pointsObtained;
        let no_of_games = game_points._count.id;

        //Get The Registration Points
        const user_points = await prisma.userPoints.aggregate({
            where: {
                userId: parseInt(user.id),
                NOT: {
                    source: "TOURNAMENT"
                },
            },
            _sum: {
                points: true,
            },
        });

        const tournament_points = await prisma.userPoints.aggregate({
            where: {
                userId: parseInt(user.id),
                source: "TOURNAMENT"
            },
            _sum: {
                points: true,
            },
        });

        //Get The Daily Rewards Points
        const daily_reward_points = await prisma.dailyReward.aggregate({
            where: {userId: parseInt(user.id)},
            _sum: {
                points: true,
            },
        });
        let daily_rewards_points = daily_reward_points._sum.points

        //Get The Redeemed Points
        const redeems_points = await prisma.redeem.findMany({
            where: {userId: parseInt(user.id)},
            include: {
                Reward: {
                    select: {
                        points: true
                    },
                },
            },
        });
        let total_redeems_points = 0;
        redeems_points.map((redeem, idx) => {
            total_redeems_points = total_redeems_points + redeem.Reward.points
        })

        let current = null
        let next = null
        const user_types = await prisma.userType.findMany();
        user_types.map((user_type, idx) => {
            if (current === null && user_type.minGames <= no_of_games) {
                current = user_type;
            } else if (current !== null && user_type.minGames <= no_of_games && (user_type.minGames > current.minGames)) {
                current = user_type;
            } else if (current !== null && next === null && user_type.minGames > no_of_games) {
                next = user_type;
            }
        })

        let user_type = {current, next}

        let users_points = user_points._sum.points - tournament_points._sum.points - total_redeems_points

        user['points'] = games_points + users_points + daily_rewards_points;
        user['no_of_games'] = no_of_games;
        user['user_type'] = user_type;

        return user;
    } catch (e) {
        console.log(e)
        throw e;
    }
}


exports.get_user_points = async function (req, res) {
    try {
        let user = req.user;

        let all_points = []
        //Get The Game Points
        const game_points = await prisma.game.findMany({
            where: {
                userId: parseInt(user.id),
                NOT: {
                    submittedAt: null
                },
            },
            select: {
                submittedAt: true,
                pointsObtained: true
            }
        });

        game_points.map((obj, idx) => {
            all_points.push({
                type: "game",
                text: "New Game",
                points: obj["pointsObtained"],
                date: obj.submittedAt,
                deduct: false
            })
        })

        //Get The Registration Points
        const user_points = await prisma.userPoints.findMany({
            where: {
                userId: parseInt(user.id),
                NOT: {
                    source: "TOURNAMENT"
                },
            },
            select: {
                createdAt: true,
                points: true
            }
        });

        user_points.map((obj, idx) => {
            all_points.push({
                type: "welcome",
                text: "Welcome Gift",
                points: obj["points"],
                date: obj.createdAt,
                deduct: false
            })
        })

        const tournament_points = await prisma.userPoints.findMany({
            where: {
                userId: parseInt(user.id),
                source: "TOURNAMENT"
            },
            select: {
                createdAt: true,
                points: true
            }
        });

        tournament_points.map((obj, idx) => {
            all_points.push({
                type: "tournament_registration",
                text: "Tournament Registration",
                points: obj["points"],
                date: obj.createdAt,
                deduct: true
            })
        })

        //Get The Daily Rewards Points
        const daily_reward_points = await prisma.dailyReward.findMany({
            where: {userId: parseInt(user.id)},
            select: {
                createdAt: true,
                points: true
            }
        });

        daily_reward_points.map((obj, idx) => {
            all_points.push({
                type: "daily_reward",
                text: "Daily Reward",
                points: obj["points"],
                date: obj.createdAt,
                deduct: false
            })
        })

        //Get The Redeemed Points
        const redeems = await prisma.redeem.findMany({
            where: {userId: parseInt(user.id)},
            include: {
                Reward: {
                    select: {
                        createdAt: true,
                        points: true
                    }
                }
            }
        });

        redeems.map((obj, idx) => {
            all_points.push({
                type: "redeem",
                text: obj["Reward"]["name"],
                points: obj["Reward"]["points"],
                date: obj.createdAt,
                deduct: true
            })
        })

        all_points.sort(function (a, b) {
            let dateA = new Date(a.date), dateB = new Date(b.date)
            return dateA - dateB
        });

        res.status(200).json(all_points.reverse());
    } catch (e) {
        throw e;
    }
}

const get_user_games_stats = async (user) => {
    try {
        const games_played = await prisma.game.aggregate({
            where: {
                userId: parseInt(user.id),
                NOT: {submittedAt: null}
            },
            _count: {id: true}
        });

        return games_played._count.id;
    } catch (e) {
        throw e;
    }
}

const get_user_rank = async function (user) {
    try {
        const userRank = await prisma.$queryRaw`
            SELECT *
            FROM (
                     SELECT @rank := @rank + 1 rank, user_id, username, image, points_obtained, points_available, no_of_games_played, correct_answers, wrong_answers, ceil(average) as average , (points_obtained/points_available) * 100 as success_rate
                     FROM
                         (
                         SELECT user.id as user_id, user.username, user.image, COALESCE (points_obtained, 0) AS points_obtained, COALESCE (points_available, 0) AS points_available,
                         COALESCE (no_of_games_played, 0) AS no_of_games_played,
                         COALESCE (correct_answers, 0) AS correct_answers,
                         COALESCE (wrong_answers, 0) AS wrong_answers,
                         (points_obtained/no_of_games_played) as average
                         FROM user
                         INNER JOIN
                         (SELECT game.userId as user_id, user.username, user.image, SUM ((CASE WHEN gq.correct is True THEN qt.points ELSE 0 END)) as points_obtained
                         FROM game_question gq
                         INNER JOIN game ON gq.gameId = game.id
                         INNER JOIN question ON gq.questionId = question.id
                         INNER JOIN question_type qt ON question.questionTypeId = qt.id
                         INNER JOIN user ON game.userId = user.id
                         WHERE game.submittedAt IS NOT NULL
                         GROUP BY user_id
                         ORDER BY points_obtained desc) game_points ON game_points.user_id = user.id
                         LEFT JOIN (
                         SELECT userId, COUNT (*) AS no_of_games_played
                         FROM game
                         WHERE game.submittedAt IS NOT NULL
                         GROUP BY userId) no_of_games_played ON no_of_games_played.userId = user.id
                         LEFT JOIN (
                         SELECT userId, COUNT (*) AS correct_answers
                         FROM game_question gq
                         INNER JOIN game ON gq.gameId = game.id
                         WHERE game.submittedAt IS NOT NULL AND gq.correct is True
                         GROUP BY userId) correct_answers ON correct_answers.userId = user.id
                         LEFT JOIN (
                         SELECT userId, COUNT (*) AS wrong_answers
                         FROM game_question gq
                         INNER JOIN game ON gq.gameId = game.id
                         WHERE game.submittedAt IS NOT NULL AND gq.correct is False
                         GROUP BY userId) wrong_answers ON wrong_answers.userId = user.id
                         LEFT JOIN (
                         SELECT userId, SUM (game.pointsAvailable) as points_available
                         FROM game
                         WHERE game.submittedAt IS NOT NULL
                         GROUP BY userId) points_available ON points_available.userId = user.id
                         ORDER BY points_obtained desc, no_of_games_played desc
                         ) as f, (SELECT @rank := 0) m) as h
            WHERE h.user_id = ${user.id}`;

        if (userRank.length > 0) {
            let user_rank = userRank[0]
            user = {...user, ...user_rank}
        }

        return user;
    } catch (error) {
        console.log(error)
        return user;
    }
}

exports.profile_image = async function (req, res) {
    try {
        if (!req.file) return res.status(400).json({error: {message: 'No files were uploaded.'}});

        let user_id = req.user.id;
        const id = req.params.id;

        //Make sure the passed id is that of the logged in user
        if (user_id.toString() !== id.toString()) return res.status(401).json({error: {message: "Sorry, you don't have the permission to update this data."}});

        //Attempt to upload
        const url = await upload_image(req);

        const user = await prisma.user.update({where: {id: parseInt(id)}, data: {image: url}})

        res.status(200).json(user);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
};


exports.shipping_info = async function (req, res) {
    try {
        let user_id = req.user.id;
        const data = req.body;
        const id = req.params.id;

        //Make sure the passed id is that of the logged in user
        if (user_id.toString() !== id.toString()) return res.status(401).json({error: {message: "Sorry, you don't have the permission to update this data."}});

        const shippingInfo = await prisma.shippingInfo.upsert({
            where: {userId: parseInt(id)},
            update: data,
            create: {...data, userId: user_id},
        })

        res.status(200).json(shippingInfo);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};


const upload_image = async function (req) {
    // Read content from the file
    const fileStream = fs.createReadStream(req.file.path);

// Set the parameters
    const params = {
        Bucket: AWS_BUCKET_NAME, // The name of the bucket. For example, 'sample_bucket_101'.
        Key: `users/${req.file.filename}`,
        Body: fileStream,
        ACL: "public-read", // enable public access for this object
    };

    // Create an object and upload it to the Amazon S3 bucket.
    try {
        await s3Client.send(new PutObjectCommand(params));
        return `https://${params.Bucket}.s3.${REGION}.amazonaws.com/${params.Key}`; // For unit tests.
    } catch (err) {
        console.log("Error", err);
    }
};


exports.get_user_stats = get_user_stats;
exports.get_user_games_stats = get_user_games_stats;
exports.get_user_rank = get_user_rank;
exports.get_user = get_user;

