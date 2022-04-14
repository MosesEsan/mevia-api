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
        let rewards = await prisma.rewardType.findMany({
            include: {
                Reward: {
                    orderBy: {points: "asc"},
                    include: {
                        UserType: true,
                        Brand: true,
                        RewardType: true
                    }
                }
            }
        })

        let formatted = []
        rewards.map((obj, idx) => {
            let reward = obj.Reward;
            let name = obj.name;
            let data = {}
            let images = {}
            let websites = {}
            let brands = []
            let all_brands = []

            reward.map((item, index) => {
                let brandName = item.Brand.name;
                let brandImage = item.Brand.image;
                let brandWebsite = item.Brand.website;
                let keys = Object.keys(data);
                if (!keys.includes(brandName)){
                    data[brandName] = []
                    images[brandName] = brandImage
                    websites[brandName] = brandWebsite
                }
            })

            reward.map((item, index) => {
                let name = item.Brand.name;
                let arr = data[name]
                arr.push(item)
            })

            Object.keys(data).map((key, index) => {
                let this_brand = {name:key, image:images[key],  website:websites[key], rewards:data[key]}
                all_brands.push(this_brand)
            })

            obj['brands'] = all_brands
            formatted.push()
        })

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
        const reward = await prisma.reward.create({data: {...req.body}})
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
        res.status(500).json(error);
    }
};


// @route PUT api/reward/{id}
// @desc Update reward details
// @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.params.id;

        const reward = await prisma.reward.update({where: {id: parseInt(id)}, data})
        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json(error);
    }
};


exports.redeem = async (req, res) => {
    try {
        let can_redeem = false;


        //Check if the user has redeemed anything this week (one reward per week)
        let today = moment();
        let startOfWeek = today.startOf('week').format('YYYY-MM-DD HH:mm');
        const redeem = await prisma.redeem.findFirst({
            where: {
                userId: parseInt(req.user.id),
                createdAt: {gte: new Date(startOfWeek)},
            },
        })
        if (redeem) return res.status(401).json({message: `Unfortunately, you can only redeem one reward per week.`});

        //Check if user has previously redeemed this reward
        const checkReward = await prisma.redeem.findFirst({
            where: {
                userId: parseInt(req.user.id),
                rewardId: parseInt(req.body.reward_id),
            },
        })
        if (checkReward) return res.status(401).json({message: `Unfortunately, all rewards are limited to one per person.`});


        const user = await UserController.get_user_stats(req.user);
        const reward = await prisma.reward.findFirst({
            where: {
                id: parseInt(req.body.reward_id)
            },
            include: {
                UserType: true,
                RewardType: true
            }
        });
        if (!reward) return res.status(401).json({message: `Reward not found`});

        //Check the user type
        let user_type = reward.UserType.name;
        if (user.user_type.current.name !== user_type) return res.status(401).json({message: `You need to be a ${user_type.toUpperCase()} user to redeem this reward.`});

        //Check if the user has enough points
        let points_required = parseInt(reward.points);
        if (user.points >= points_required) can_redeem = true;
        if (!can_redeem) return res.status(401).json({message: `You need ${points_required} points to redeem this reward.`});

        let data = {rewardId: reward.id, userId: user.id}
        await prisma.redeem.create({data})

        //Check the reward message
        let rewardMessage = reward.RewardType.message;
        let message = `You have successfully redeemed your reward. ${rewardMessage} You can also can view your reward in your profile under "My Rewards".`
        res.status(200).json({message});
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
}


exports.setRedeemedPrize = async (req, res) => {
    try {
        //Check if the redem is available
        const redeem = await prisma.redeem.findFirst({where: {id: parseInt(req.body.redeemId)}});
        if (!redeem) return res.status(401).json({message: `Redeem Object not found`});

        //Check if the gift card is available
        const gift_card = await prisma.giftCard.findFirst({where: {id: parseInt(req.body.giftCardId)}});
        if (!gift_card) return res.status(401).json({message: `Sorry this giftcard was not found.`});

        //update the redeem object with the giftcard id
        const redeemed = await prisma.redeem.update({where: {id: parseInt(id)}, data: {giftCardId: gift_card.id}})

        res.status(200).json({message: `You have successfully set the reward.`});

        //update the gift card object with the giftcard id
        // await updateGiftCard(req, res,{redeemed, gift_card})
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
}

async function updateGiftCard(req, res, {redeemed, gift_card}) {
    try {
        const updated = await prisma.giftCard.update({
            where: {id: parseInt(gift_card.id)},
            data: {redeemId: redeemed.id}
        })

        res.status(200).json({
            message: `You have successfully redeemed your reward. \n  You will receive your gift card via email in the next 12h, please make sure to check your spam if not received. 
        You can also can view your reward in your profile under "My Rewards".`
        });
    } catch (error) {
        // delete the redeemed if it fails to update the giftcard table
        await prisma.redeem.delete({where: {id: redeemed.id}})
        res.status(500).json(error)
    }
}

exports.user_rewards = async function (req, res) {
    try {
        let rewards = await prisma.redeem.findMany({
            where: {
                userId: parseInt(req.user.id)
            },
            include: {
                Reward: {
                    include: {
                        Brand: true
                    }
                },
                GiftCard: true,
            },
        })

        rewards = formatRewards(rewards)
        res.status(200).json(rewards);
    } catch (error) {
        console.log(error)
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
