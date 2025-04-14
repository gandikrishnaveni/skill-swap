const Service = require('../models/Service');

exports.postService = async (req, res) => {
  const { title, description, category } = req.body;

  try {
    const newService = await Service.create({
      title,
      description,
      category,
      postedBy: req.userId
    });
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.getServices = async (req, res) => {
  const services = await Service.find().populate('postedBy', 'name email');
  res.json(services);
};
