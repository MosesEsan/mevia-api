const prisma = require('../config/prisma')

// @route GET api/question
// @desc Returns all questions
// @access Public
exports.index = async (req, res) => {
    try {
        const categories = await prisma.questionCategory.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', categories.length)
        res.status(200).json(categories)
    } catch (error) {
        res.status(500).json(error);
    }
}

//CRUD

// @route POST api/question
// @desc Add a new question
// @access Public
exports.create = async (req, res) => {
    try {
        const category = await prisma.questionCategory.create({data: {...req.body}})
        res.status(200).json(category)
    } catch (error) {
        res.status(500).json(error);
    }
};

// @route GET api/question/{id}
// @desc Returns a question prize
// @access Public
exports.read = async function (req, res) {
    try {
        const id = req.params.id;

        let category = await prisma.questionCategory.findUnique({where: {id: parseInt(id)}})

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json(error);
    }
};

// @route PUT api/question/{id}
// @desc Update question details
// @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.params.id;

        const category = await prisma.questionCategory.update({where: { id: parseInt(id) }, data})
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json(error);
    }
};
