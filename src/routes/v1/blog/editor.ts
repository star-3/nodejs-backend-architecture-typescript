import express, {Response} from 'express';
import { SuccessResponse, SuccessMsgResponse } from '../../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import { BadRequestError, ForbiddenError } from '../../../core/ApiError';
import BlogRepo from '../../../database/repository/BlogRepo';
import { RoleCode } from '../../../database/model/Role';
import { Types } from 'mongoose';
import validator, { ValidationSource } from '../../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../../helpers/asyncHandler';
import authentication from '../../../auth/authentication';
import authorization from '../../../auth/authorization';
import role from '../../../helpers/role';
import Blog from "../../../database/model/Blog";

const router = express.Router();
const defaultBlogsSuccessResponse = function (blogs: Blog[] | Blog, res: Response): Response {
  return new SuccessResponse('success', blogs).send(res);
};

/*-------------------------------------------------------------------------*/
// Below all APIs are private APIs protected for Access Token and Editor's Role
router.use('/', authentication, role(RoleCode.EDITOR), authorization);
/*-------------------------------------------------------------------------*/

router.put(
  '/publish/:id',
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blog = await BlogRepo.findBlogAllDataById(new Types.ObjectId(req.params.id));
    if (!blog) throw new BadRequestError('Blog does not exists');

    blog.isDraft = false;
    blog.isSubmitted = false;
    blog.isPublished = true;
    blog.text = blog.draftText;
    if (!blog.publishedAt) blog.publishedAt = new Date();

    await BlogRepo.update(blog);
    return new SuccessMsgResponse('Blog published successfully').send(res);
  }),
);

router.put(
  '/unpublish/:id',
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blog = await BlogRepo.findBlogAllDataById(new Types.ObjectId(req.params.id));
    if (!blog) throw new BadRequestError('Blog does not exists');

    blog.isDraft = true;
    blog.isSubmitted = false;
    blog.isPublished = false;

    await BlogRepo.update(blog);
    return new SuccessMsgResponse('Blog unpublished successfully').send(res);
  }),
);

router.delete(
  '/id/:id',
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blog = await BlogRepo.findBlogAllDataById(new Types.ObjectId(req.params.id));
    if (!blog) throw new BadRequestError('Blog does not exists');

    blog.status = false;

    await BlogRepo.update(blog);
    return new SuccessMsgResponse('Blog deleted successfully').send(res);
  }),
);

router.get(
  '/published/all',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blogs = await BlogRepo.findAllPublished();
    return defaultBlogsSuccessResponse(blogs, res);
  }),
);

router.get(
  '/submitted/all',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blogs = await BlogRepo.findAllSubmissions();
    return defaultBlogsSuccessResponse(blogs, res);
  }),
);

router.get(
  '/drafts/all',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blogs = await BlogRepo.findAllDrafts();
    return defaultBlogsSuccessResponse(blogs, res);
  }),
);

router.get(
  '/id/:id',
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blog = await BlogRepo.findBlogAllDataById(new Types.ObjectId(req.params.id));

    if (!blog) throw new BadRequestError('Blog does not exists');
    if (!blog.isSubmitted && !blog.isPublished) throw new ForbiddenError('This blog is private');

    defaultBlogsSuccessResponse(blog, res);
  }),
);

export default router;
