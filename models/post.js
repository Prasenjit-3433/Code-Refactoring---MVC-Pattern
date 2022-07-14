const mongodb = require("mongodb");

const db = require("../data/database");
const { post } = require("../routes/auth");

const ObjectId = mongodb.ObjectId;

class Post {
  constructor(title, content, id) {
    this.title = title;
    this.content = content;
    if (id) {
      // `id` is a raw string. we have to convert it to mongodb id object:
      this.id = new ObjectId(id.trim()); // <- this ObjectId constructor throws an error if it receives an id that 
                                        //     does't follow mongodb id format.
    }
  }

  static async fetchAll() {
    const posts = await db.getDb().collection("posts").find().toArray();

    return posts;
  }

  async fetch() {
    if (!this.id) {
        return;
      }

    const postDocument = await db.getDb().collection('posts').findOne({ _id: this.id });
    this.title = postDocument.title;
    this.content = postDocument.content;
  }

  async save() {
    let result;

    if (this.id) {
      result = await db
        .getDb()
        .collection("posts")
        .updateOne(
          { _id: this.id },
          { $set: { title: this.title, content: this.content } }
        );
    } else {
      result = await db.getDb().collection("posts").insertOne({
        title: this.title,
        content: this.content,
      });
    }

    return result;
  }

  async delete() {
   if (!this.id) {
      return;
    }  if (!this.id) {
      return;
    }
    const result = await db
      .getDb()
      .collection("posts")
      .deleteOne({ _id: this.id });

    return result;
  }
}

// Note: Whilst it makes sense to call save, delete method on an instantiated post - a concrete Post obeject, but if we're about to
//       fetch a list of posts, we have no single post object yet --- Here the `static method` comes into play.

// "STATIC METHOD": it is just like another method but you don't call them on the instancited obeject, instead on the class
//                  itself.

module.exports = Post;
