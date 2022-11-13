const models = require('../models');

const { Domo } = models;

const makerPage = (req, res) => res.render('app');

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'Both name and age are required!' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({ name: newDomo.name, age: newDomo.age });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists!' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const getDomos = (req, res) => Domo.findByOwner(req.session.account._id, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred!' });
  }

  return res.json({ domos: docs });
});

const deleteDomo = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'No ID provided for Domo to delete!' });
  }

  // https://stackoverflow.com/questions/27482806/check-if-id-exists-in-a-collection-with-mongoose
  const count = await Domo.countDocuments({ _id: id });
  if (count === 0) return res.status(400).json({ error: `No Domo with ID of ${id} exists!` });

  await Domo.findByIdAndDelete(id);
  return res.status(200).json({ message: `Domo with ID of ${id} deleted!` });
};

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
  deleteDomo,
};
