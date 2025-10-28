const { Post } = require('../models');

function ensureAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

async function index(req, res) {
  const userId = req.session.user.id;
  const posts = await Post.findAll({ where: { user_id: userId }, order: [['created_at', 'DESC']] });
  res.render('posts', { posts });
}

function newForm(req, res) {
  res.render('post_form', { post: null, error: null });
}

async function create(req, res) {
  try {
    const userId = req.session.user.id;
    const { title, body } = req.body;
    if (!title) return res.render('post_form', { post: null, error: 'Title required' });
    await Post.create({ user_id: userId, title, body });
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.render('post_form', { post: null, error: 'Create failed' });
  }
}

async function editForm(req, res) {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.redirect('/posts');
  res.render('post_form', { post, error: null });
}

async function update(req, res) {
  const { title, body } = req.body;
  const post = await Post.findByPk(req.params.id);
  if (post) {
    await post.update({ title, body });
  }
  res.redirect('/posts');
}

async function remove(req, res) {
  const post = await Post.findByPk(req.params.id);
  if (post) await post.destroy();
  res.redirect('/posts');
}

module.exports = { ensureAuth, index, newForm, create, editForm, update, remove };
