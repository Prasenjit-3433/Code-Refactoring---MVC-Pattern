const Post = require("../models/post");
const validationSession = require("../util/validation-session");
const validation = require("../util/validation");

// **** These functions are not actually controllers, these are called `actions` of this controller file and the grouping of these
//      functions that act on a certain feature like blog, authentication that makes up a controller.

function getHome(req, res) {
  res.render("welcome");
}

async function getAdmin(req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }

  const posts = await Post.fetchAll();

  const sessionErrorData = validationSession.getSessionErrorData(req, {
    title: "",
    content: "",
  });

  res.render("admin", {
    posts: posts,
    inputData: sessionErrorData,
  });
}

async function createPost(req, res) {
  const enteredTitle = req.body.title;
  const enteredContent = req.body.content;

  if (!validation.postIsValid(enteredTitle, enteredContent)) {
    validationSession.flashErrorToSession(
      req,
      {
        message: "Invalid input - please check your data.",
        title: enteredTitle,
        content: enteredContent,
      },
      function () {
        res.redirect("/admin");
      }
    );

    return; // or return res.redirect('/admin'); => Has the same effect
  }

  const post = new Post(enteredTitle, enteredContent);

  // await this process before redirecting to admin page, otherwise the added post will not be seen:
  await post.save();

  // Note: we can await here because the save() method is an async function and all async functions/ methods return
  //       promises by default

  res.redirect("/admin");
}

async function getSinglePost(req, res, next) {
  let post;
  try {
    // created an instance without title, content:
    post = new Post(null, null, req.params.id);
  } catch (error) {
    // forward the error to the default error-handling middleware:
    // return next(error);

    return res.render('404');
  }

  // Then called fetch method on it to fill `title`, `id` internally:
  await post.fetch();

  // Check: we created a Post object but whether we were able to populate that with `title`, `content`:
  if (!post.title || !post.content) {
    return res.render("404"); // 404.ejs is missing at this point - it will be added later!
  }

  const sessionErrorData = validationSession.getSessionErrorData(req, {
    title: post.title,
    content: post.content,
  });

  res.render("single-post", {
    post: post,
    inputData: sessionErrorData,
  });
}

async function updatePost(req, res) {
  const enteredTitle = req.body.title;
  const enteredContent = req.body.content;

  if (!validation.postIsValid(enteredTitle, enteredContent)) {
    validationSession.flashErrorToSession(
      req,
      {
        message: "Invalid input - please check your data.",
        title: enteredTitle,
        content: enteredContent,
      },
      function () {
        res.redirect(`/posts/${req.params.id}/edit`);
      }
    );

    return;
  }

  const post = new Post(enteredTitle, enteredContent, req.params.id);
  // await this process before redirecting to admin page, otherwise the added post will not be seen:
  await post.save();

  // Note: we can await here because the save() method is an async function and all async functions/ methods return
  //       promises by default

  res.redirect("/admin");
}

async function deletePost(req, res) {
  // Passing `null` as arg for title, content as we're not creating any instance of the Post class:
  const post = new Post(null, null, req.params.id);
  await post.delete();

  res.redirect("/admin");
}

module.exports = {
  getHome: getHome,
  getAdmin: getAdmin,
  createPost: createPost,
  getSinglePost: getSinglePost,
  updatePost: updatePost,
  deletePost: deletePost,
};
