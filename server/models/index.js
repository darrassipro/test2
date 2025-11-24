const {User} = require("./User");
const {Post} = require("./Post");
const {PostFile} = require("./PostFile");
const {FavoritePost} = require("./FavoritePost");
const {PostLike} = require("./PostLike");
const {Comment} = require("./Comment");
const {CommentLike} = require("./CommentLike");
const {PostShare} = require("./PostShare");
const {Story} = require("./Story");
const {StoryView} = require("./StoryView");
const {StoryHighlight} = require("./StoryHighlight");
const {Label} = require("./Label");
const {EmailVerification} = require("./EmailVerification");
const {Community} = require("./Community");
const {CommunityFile} = require("./CommunityFile");
const {CommunityMembership} = require("./CommunityMembership");
const {CommCategory} = require("./CommCategory");
const {RCommCategory} = require("./RCommCategory");
const {PostCategory} = require("./PostCategory");
const {Follow} = require("./Follow");
const {Admin} = require("./Admin");
const {ProductCategory} = require("./ProductCategory");
const {Product} = require("./Product");
const {ProductFile} = require("./ProductFile");
const {ProductImage} = require("./ProductImage");
const {Route} = require("./Route");
const {VisitedTrace} = require("./VisitedTrace");
const {Rating} = require("./Rating");

// Associations User <-> Post
User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "user" });

// Associations Community <-> Post
Community.hasMany(Post, { foreignKey: "communityId", as: "posts" });
Post.belongsTo(Community, { foreignKey: "communityId", as: "community" });

// Associations Post <-> PostFile
Post.hasMany(PostFile, { foreignKey: "postId", as: "postFiles" });
PostFile.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Associations User <-> Post (Many-to-Many via FavoritePost)
User.hasMany(FavoritePost, { foreignKey: "userId", as: "favoritePosts" });
FavoritePost.belongsTo(User, { foreignKey: "userId", as: "user" });

Post.hasMany(FavoritePost, { foreignKey: "postId", as: "favoritedBy" });
FavoritePost.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Associations User <-> Post (Many-to-Many via PostLike)
User.hasMany(PostLike, { foreignKey: "userId", as: "postLikes" });
PostLike.belongsTo(User, { foreignKey: "userId", as: "user" });

Post.hasMany(PostLike, { foreignKey: "postId", as: "likedBy" });
PostLike.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Associations Post <-> Comment
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Associations User <-> Comment
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });

// Associations Comment <-> Comment (Auto-référence pour les réponses)
Comment.hasMany(Comment, { foreignKey: "replyId", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "replyId", as: "parentComment" });

// Associations Comment <-> CommentLike
Comment.hasMany(CommentLike, { foreignKey: "commentId", as: "likes" });
CommentLike.belongsTo(Comment, { foreignKey: "commentId", as: "comment" });

// Associations User <-> CommentLike
User.hasMany(CommentLike, { foreignKey: "userId", as: "commentLikes" });
CommentLike.belongsTo(User, { foreignKey: "userId", as: "user" });

// Associations Post <-> PostShare
Post.hasMany(PostShare, { foreignKey: "postId", as: "shares" });
PostShare.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Associations User <-> PostShare
User.hasMany(PostShare, { foreignKey: "userId", as: "postShares" });
PostShare.belongsTo(User, { foreignKey: "userId", as: "user" });

// Associations User <-> Story
User.hasMany(Story, { foreignKey: "userId", as: "stories" });
Story.belongsTo(User, { foreignKey: "userId", as: "user" });

// Associations Story <-> StoryView
Story.hasMany(StoryView, { foreignKey: "storyId", as: "views" });
StoryView.belongsTo(Story, { foreignKey: "storyId", as: "story" });

// Associations User <-> StoryView (via viewerId)
User.hasMany(StoryView, { foreignKey: "viewerId", as: "storyViews" });
StoryView.belongsTo(User, { foreignKey: "viewerId", as: "viewer" });

// Associations Story <-> StoryHighlight
Story.hasMany(StoryHighlight, { foreignKey: "storyId", as: "highlights" });
StoryHighlight.belongsTo(Story, { foreignKey: "storyId", as: "story" });

// Associations User <-> StoryHighlight
User.hasMany(StoryHighlight, { foreignKey: "userId", as: "storyHighlights" });
StoryHighlight.belongsTo(User, { foreignKey: "userId", as: "user" });

// Associations Label <-> StoryHighlight
Label.hasMany(StoryHighlight, { foreignKey: "labelId", as: "storyHighlights" });
StoryHighlight.belongsTo(Label, { foreignKey: "labelId", as: "label" });

// Associations User <-> Community (Creator)
User.hasMany(Community, { foreignKey: "creatorUserId", as: "createdCommunities" });
Community.belongsTo(User, { foreignKey: "creatorUserId", as: "creator" });

// Associations Community <-> CommCategory (Many-to-Many via RCommCategory)
Community.belongsToMany(CommCategory, { 
	through: RCommCategory, 
	foreignKey: "communityId", 
	as: "categories" 
});
CommCategory.belongsToMany(Community, { 
	through: RCommCategory, 
	foreignKey: "communityCategoryId", 
	as: "communities" 
});

// Associations pour RCommCategory
RCommCategory.belongsTo(Community, { foreignKey: "communityId", as: "community" });
RCommCategory.belongsTo(CommCategory, { foreignKey: "communityCategoryId", as: "category" });

// Associations Community <-> CommunityFile
Community.hasMany(CommunityFile, { foreignKey: "communityId", as: "communityFiles" });
CommunityFile.belongsTo(Community, { foreignKey: "communityId", as: "community" });

// Associations Post <-> PostCategory
Post.belongsTo(PostCategory, { foreignKey: "postCategory", as: "category" });
PostCategory.hasMany(Post, { foreignKey: "postCategory", as: "posts" });

// Associations User <-> Community (Many-to-Many via CommunityMembership)
User.belongsToMany(Community, { 
	through: CommunityMembership, 
	foreignKey: "userId", 
	as: "communities" 
});
Community.belongsToMany(User, { 
	through: CommunityMembership, 
	foreignKey: "communityId", 
	as: "members" 
});

// Associations pour CommunityMembership
CommunityMembership.belongsTo(User, { foreignKey: "userId", as: "user" });
CommunityMembership.belongsTo(Community, { foreignKey: "communityId", as: "community" });

// Associations User <-> User (Many-to-Many via Follow)
User.belongsToMany(User, { 
	through: Follow, 
	foreignKey: "followerId", 
	as: "following",
	otherKey: "followingId"
});
User.belongsToMany(User, { 
	through: Follow, 
	foreignKey: "followingId", 
	as: "followers",
	otherKey: "followerId"
});

// Associations pour Follow
Follow.belongsTo(User, { foreignKey: "followerId", as: "follower" });
Follow.belongsTo(User, { foreignKey: "followingId", as: "following" });

// Associations Community <-> User (Many-to-Many via Admin)
Community.belongsToMany(User, { 
	through: Admin, 
	foreignKey: "communityId", 
	as: "admins" 
});
User.belongsToMany(Community, { 
	through: Admin, 
	foreignKey: "userId", 
	as: "adminCommunities" 
});

// Associations pour Admin
Admin.belongsTo(Community, { foreignKey: "communityId", as: "community" });
Admin.belongsTo(User, { foreignKey: "userId", as: "user" });

// Associations ProductCategory <-> Product
ProductCategory.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(ProductCategory, { foreignKey: "categoryId", as: "category" });

// Associations Community <-> Product
Community.hasMany(Product, { foreignKey: "communityId", as: "products" });
Product.belongsTo(Community, { foreignKey: "communityId", as: "community" });

// Associations User <-> Product
User.hasMany(Product, { foreignKey: "userId", as: "products" });
Product.belongsTo(User, { foreignKey: "userId", as: "user" });

// Associations Product <-> ProductFile
Product.hasMany(ProductFile, { foreignKey: "productId", as: "productFiles" });
ProductFile.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Associations Product <-> ProductImage
Product.hasMany(ProductImage, { foreignKey: "productId", as: "productImages" });
ProductImage.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Associations Community <-> Route
Community.hasMany(Route, { foreignKey: "communityId", as: "routes" });
Route.belongsTo(Community, { foreignKey: "communityId", as: "community" });

// Associations Route <-> VisitedTrace
Route.hasMany(VisitedTrace, { foreignKey: "routeId", as: "visitedTraces" });
VisitedTrace.belongsTo(Route, { foreignKey: "routeId", as: "route" });

// Associations Post <-> VisitedTrace
Post.belongsTo(VisitedTrace, { foreignKey: "visitedTraceId", as: "visitedTrace" });
VisitedTrace.hasMany(Post, { foreignKey: "visitedTraceId", as: "posts" });

// Associations Produit <-> Note :
Product.hasMany(Rating, { foreignKey: 'productId', as: 'ratings' });
Rating.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Associations Utilisateur <-> Note :
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Associations Utilisateur <-> Route
Route.belongsTo(User, { foreignKey: 'creatorUserId', as: 'creator' });
//Associations Route <-> Community
 Route.belongsTo(Community, { foreignKey: 'communityId' });

module.exports = {
	User,
	Post,
	PostFile,
	FavoritePost,
	PostLike,
	Comment,
	CommentLike,
	PostShare,
	Story,
	StoryView,
	StoryHighlight,
	Label,
	EmailVerification,
	Community,
	CommunityFile,
	CommunityMembership,
	CommCategory,
	RCommCategory,
	PostCategory,
	Follow,
	Admin,
	ProductCategory,
	Product,
	ProductFile,
	ProductImage,
	Route,
	VisitedTrace,
	Rating,
};