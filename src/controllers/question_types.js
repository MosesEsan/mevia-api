const prisma = require('../config/prisma')

// @route GET api/question
// @desc Returns all questions
// @access Public
exports.index = async (req, res) => {
    try {
        const questiontypes = await prisma.questionType.findMany()
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', questiontypes.length)
        res.status(200).json(questiontypes)
    } catch (error) {
        throw error
    }
}

//CRUD

// @route POST api/question
// @desc Add a new question
// @access Public
exports.create = async (req, res) => {
    try {
        const questiontype = await prisma.questionType.create({data: {...req.body}})
        res.status(200).json(questiontype)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// @route GET api/question/{id}
// @desc Returns a question prize
// @access Public
exports.read = async function (req, res) {
    try {
        const id = req.params.id;

        let questiontype = await prisma.questionType.findUnique({where: {id: parseInt(id)}})

        res.status(200).json(questiontype);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// @route PUT api/question/{id}
// @desc Update question details
// @access Public
exports.update = async function (req, res) {
    try {
        const data = req.body;
        const id = req.params.id;

        const questiontype = await prisma.questionType.update({where: { id: parseInt(id) }, data})
        res.status(200).json(questiontype);
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message});
    }
};
