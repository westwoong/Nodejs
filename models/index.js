const User = require('./Users');
const Post = require('./Posts');

User.hasMany(Post);
Post.belongsTo(User);

module.exports = {
    User,
    Post
}