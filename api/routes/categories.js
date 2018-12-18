//Requiring third party models
const router = require('express').Router();

//Requiring model and validation methods
const {Category, validate} = require('../models/category.model');

router.get('/', async (req, res) => {
    const categories = await Category.find({}).exec();
    res.send(categories);
});
/* router.get('/:id', categories.getOne); */
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }

    let category = new Category({
        name: req.body.name,
        company: req.body.company
    });
    category = await category.save();

    res.send(category);
});
/* router.put('/:id', categories.update);
router.delete('/:id', categories.delete); */

module.exports = router;