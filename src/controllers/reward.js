const {PrismaClient} = require('@prisma/client')
const moment = require("moment");

const prisma = new PrismaClient()
const UserController = require('../controllers/user');

const logger = require('../../logger')();

// @route GET api/reward
// @desc Returns all rewards
// @access Public
exports.index = async (req, res) => {
    try {
        let rewards = await prisma.brand.findMany({
            // orderBy: {points: "asc"},
            include:{
                Reward: {
                    orderBy: {points: "asc"},
                    include:{
                        UserType:true
                    }
                }
            }
        })
        //
        // const games_played = await prisma.game.aggregate({
        //     where: {
        //         userId: parseInt(req.user.id),
        //         NOT: {submittedAt: null}
        //     },
        //     _count: {id: true}
        // });
        // let no_of_games = games_played._count.id;
        //
        // rewards = await checkIfRedeemable(rewards, no_of_games);

        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', rewards.length)
        res.status(200).json(rewards)
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
}

//CRUD

// @route POST api/reward
// @desc Add a new reward
// @access Public
exports.create = async (req, res) => {
    try {
        const reward = await prisma.reward.create({data: {...req.body }})
        res.status(200).json(reward)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


// @route GET api/reward/{id}
// @desc Returns a specific reward
// @access Public
exports.read = async function (req, res) {
    try {
        const id = req.params.id;

        let reward = await prisma.reward.findUnique({where: {id: parseInt(id)}})

        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json({error});
    }
};


// @route PUT api/reward/{id}
// @desc Update reward details
// @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.params.id;

        const reward = await prisma.reward.update({where: { id: parseInt(id) }, data})
        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json({error});
    }
};


exports.redeem = async (req, res) => {
    try {
        let can_redeem = false;

        console.log(req.body)

        const user = UserController.get_user_stats(req.user);
        const reward = await prisma.reward.findFirst({where: {id: parseInt(req.body.reward_id)}});
        if (!reward) return res.status(401).json({message: `Reward not found`});

        //Check if the user has enough points
        let points_required = parseInt(reward.points);
        if (user.points >= points_required) can_redeem = true;
        if (!can_redeem) return res.status(401).json({message: `You need ${points_required} points to redeem this reward.`});


        //Check if theres a gift card available
        const gift_card = await prisma.giftCard.findFirst({where: {id: parseInt(reward.id), redeemId: null}});
        if (!gift_card) return res.status(401).json({message: `Sorry this reward is not available at this time.`});


        let data = {rewardId:reward.id, userId:user.id, dateClaimed :new Date()}
        let redeemed = await prisma.redeem.create({data})

        await updateGiftCard(req, res,{redeemed, gift_card})


    } catch (error) {
        res.status(500).json({error});
    }
}

async function updateGiftCard(req, res, {redeemed, gift_card}) {
    try {
        const updated = await prisma.giftCard.update({
            where: {id: parseInt(gift_card.id)},
            data: {redeemId: redeemed.id}})

        console.log(updated)

        res.status(200).json({message: `You have successfully redeemed your reward. \n  You can view your reward in your "My Rewards". We'll also send you an email with your gift voucher, please make sure to check your spam if not received.\n.`});
    } catch (error) {
        // delete the redeemed if it fails to update the giftcard table
        await prisma.redeem.delete({where: {id: redeemed.id}})
        res.status(500).json({error})
    }
}

exports.user_rewards = async function (req, res) {
    try {
        let rewards = await prisma.redeem.findMany({
            where: {
                userId: parseInt(req.user.id)
            },
            include: {
                Reward: true,
                GiftCard: {
                    include: {
                        Brand:true
                    }
                },
            },
        })

        rewards = formatRewards(rewards)
        console.log(rewards)
        res.status(200).json(rewards);
    } catch (error) {
        console.log("===")
        console.log(error)
        console.log("===")
        res.status(500).json(error)
    }
};

function formatRewards(rewards) {
    let all_rewards = []
    rewards.forEach((obj, idx) => {
        let reward = obj["Reward"]
        delete reward["id"]

        let gift_cards = obj["GiftCard"]
        obj["gift_card"] = gift_cards.length > 0 ? gift_cards[0] : null

        let brand = obj["gift_card"]["Brand"]
        obj = {...obj, ...reward, brand}
        delete obj["GiftCard"]
        delete obj["Reward"]
        all_rewards.push(obj)
    });

    return all_rewards;
}
