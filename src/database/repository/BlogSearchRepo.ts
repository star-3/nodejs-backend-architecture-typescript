import Blog, { BlogModel } from '../model/Blog';
import BlogRepo from './BlogRepo';

export default class BlogSearchRepo {
  public static searchSimilarBlogs(blog: Blog, limit: number): Promise<Blog[]> {
    return BlogModel.find(
      {
        $text: { $search: blog.title, $caseSensitive: false },
        status: true,
        isPublished: true,
        _id: { $ne: blog._id },
      },
      {
        similarity: { $meta: 'textScore' },
      },
    )
      .populate('author', BlogRepo.AUTHOR_DETAIL)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .sort({ similarity: { $meta: 'textScore' } })
      .lean<Blog>()
      .exec();
  }

  public static search(query: string, limit: number): Promise<Blog[]> {
    return BlogModel.find(
      {
        $text: { $search: query, $caseSensitive: false },
        status: true,
        isPublished: true,
      },
      {
        similarity: { $meta: 'textScore' },
      },
    )
      .select('-status -description')
      .limit(limit)
      .sort({ similarity: { $meta: 'textScore' } })
      .lean<Blog>()
      .exec();
  }

  public static searchLike(query: string, limit: number): Promise<Blog[]> {
    return BlogModel.find({
      title: { $regex: `.*${query}.*`, $options: 'i' },
      status: true,
      isPublished: true,
    })
      .select('-status -description')
      .limit(limit)
      .sort({ score: -1 })
      .lean<Blog>()
      .exec();
  }
}
