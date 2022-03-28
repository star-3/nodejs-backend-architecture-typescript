import Joi from '@hapi/joi';
import { JoiObjectId, JoiUrlEndpoint } from '../../../helpers/validator';

// main schema for blogCreate and blogUpdate
const blogSchema = Joi.object().keys({
  title: Joi.string().min(3).max(500),
  description: Joi.string().min(3).max(2000),
  text: Joi.string().max(50000),
  blogUrl: JoiUrlEndpoint().max(200),
});

// optional schema that will be merged with blogSchema
const optionalSchema = {
  imgUrl: Joi.string().optional().uri().max(200),
  score: Joi.number().optional().min(0).max(1),
  tags: Joi.array().optional().min(1).items(Joi.string().uppercase()),
};

export default {
  blogUrl: Joi.object().keys({
    endpoint: JoiUrlEndpoint().required().max(200),
  }),
  blogId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  blogTag: Joi.object().keys({
    tag: Joi.string().required(),
  }),
  pagination: Joi.object().keys({
    pageNumber: Joi.number().required().integer().min(1),
    pageItemCount: Joi.number().required().integer().min(1),
  }),
  authorId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  blogCreate: blogSchema.options({presence: 'required'}).append(optionalSchema),
  blogUpdate: blogSchema.options({presence: 'optional'}).append(optionalSchema),
};
