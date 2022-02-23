import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from 'src/auth/schemas/category.schema';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { Scrap, ScrapDocument } from 'src/feed/schemas/scrap.schema';

export class MyPageRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Scrap.name) private scrapModel: Model<ScrapDocument>,
  ) {}

  async findUserById(userId: string): Promise<User> {
    const user = await this.userModel
      .findById(userId)
      .populate(['subscribeUser', 'categories'])
      .exec();

    if (!user) {
      throw new UnauthorizedException('가입되어 있지 않은 이메일입니다.');
    }
    return user;
  }

  async getPagedArticle(filter) {
    return await this.articleModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(15)
      .populate(['user', 'relay'])
      .exec();
  }

  async getLastArticle(user: User) {
    return await this.articleModel
      .find({ user: user._id, public: true })
      .sort({ _id: -1 })
      .limit(1);
  }

  async getAllArticles(cursor, user: User) {
    let filter;
    if (!cursor) {
      const last = await this.getLastArticle(user);
      const lastId = last[0]._id;
      filter = { user: user._id, public: true, _id: { $lte: lastId } };
    } else {
      filter = { user: user._id, public: true, _id: { $lt: cursor } };
    }
    return await this.getPagedArticle(filter);
  }

  async getFollowers(user: User) {
    return await this.userModel.find({ subscribeUser: user._id }).exec();
  }

  async getAllCategory(user: User) {
    return await this.categoryModel.find({ user }).sort({ title: 1 }).exec();
  }

  async createCategory(title: string, user: User) {
    const category = new this.categoryModel({ user, title });
    await category.save();
    await this.userModel.findByIdAndUpdate(user._id, {
      $push: { categories: category._id },
    });
    return category;
  }

  async updateCategory(title: string, categoryId: string, user: User) {
    const check = await this.categoryModel.exists({ user, title });
    if (!check) {
      return await this.categoryModel.findByIdAndUpdate(
        categoryId,
        { title },
        { new: true },
      );
    } else {
      throw new BadRequestException('요청하신 카테고리는 이미 존재합니다.');
    }
  }

  async checkCategory(categoryId: string, user: User) {
    const check = await this.categoryModel.exists({ _id: categoryId, user });
    if (!check) {
      throw new NotFoundException('요청하신 카테고리가 존재하지 않습니다.');
    }
  }

  async deleteCategory(categoryId: string, user: User) {
    await this.checkCategory(categoryId, user);

    await this.articleModel.updateMany(
      { category: categoryId },
      { $set: { category: null } },
    );
    await this.scrapModel.updateMany(
      { category: categoryId },
      { $set: { category: null } },
    );
    await this.userModel.findByIdAndUpdate(user._id, {
      $pull: { categories: categoryId },
    });
    return await this.categoryModel.findByIdAndDelete(categoryId);
  }

  async getCategoryLast(categoryId: string, user: User) {
    return await this.articleModel
      .find({ user, category: categoryId, public: true })
      .sort({ _id: -1 })
      .limit(1);
  }

  async getCategoryArticle(categoryId: string, cursor, user: User) {
    await this.checkCategory(categoryId, user);

    let filter;
    if (!cursor) {
      const last = await this.getCategoryLast(categoryId, user);
      const lastId = last[0]._id;
      filter = {
        user,
        category: categoryId,
        public: true,
        _id: { $lte: lastId },
      };
    } else {
      filter = {
        user,
        category: categoryId,
        public: true,
        _id: { $lt: cursor },
      };
    }
    return await this.getPagedArticle(filter);
  }

  async updateCategoryArticle(articleId: string, title: string, user: User) {
    const category = await this.categoryModel.findOne({ user, title });
    const article = await this.articleModel.findByIdAndUpdate(
      articleId,
      { category: category._id },
      { new: true },
    );
    if (!category || !article) {
      throw new NotFoundException();
    }
    return article;
  }

  async deleteCategoryArticle(articleId: string) {
    try {
      return await this.articleModel.findByIdAndUpdate(articleId, {
        $set: { category: null },
      });
    } catch (e) {
      throw new NotFoundException('요청하신 글이 존재하지 않습니다.');
    }
  }

  async getLastNoCategoryArticle(user: User) {
    return await this.articleModel
      .find({ user, category: null, public: true })
      .sort({ _id: -1 })
      .limit(1);
  }

  async getNoCategoryArticle(cursor, user: User) {
    let filter;
    if (!cursor) {
      const last = await this.getLastNoCategoryArticle(user);
      const lastId = last[0]._id;
      filter = { user, category: null, public: true, _id: { $lte: lastId } };
    } else {
      filter = { user, category: null, public: true, _id: { $lt: cursor } };
    }
    return await this.getPagedArticle(filter);
  }

  async getPagedScrap(filter) {
    return await this.scrapModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(15)
      .populate(['user', 'article'])
      .exec();
  }

  async getLastScrap(categoryId: string, user: User) {
    return await this.scrapModel
      .find({ user, category: categoryId })
      .sort({ _id: -1 })
      .limit(1);
  }

  async getCategoryScrap(categoryId: string, cursor, user: User) {
    await this.checkCategory(categoryId, user);

    let filter;
    if (!cursor) {
      const last = await this.getLastScrap(categoryId, user);
      const lastId = last[0]._id;
      filter = {
        user,
        category: categoryId,
        _id: { $lte: lastId },
      };
    } else {
      filter = {
        user,
        category: categoryId,
        _id: { $lt: cursor },
      };
    }
    return await this.getPagedScrap(filter);
  }

  async updateCategoryScrap(scrapId: string, title: string, user: User) {
    const category = await this.categoryModel.findOne({ user, title });
    const scrap = await this.scrapModel.findByIdAndUpdate(
      scrapId,
      { category: category._id },
      { new: true },
    );
    if (!category || !scrap) {
      throw new NotFoundException();
    }
    return scrap;
  }

  async deleteCategoryScrap(scrapId: string) {
    try {
      return await this.scrapModel.findByIdAndUpdate(scrapId, {
        $set: { category: null },
      });
    } catch (e) {
      throw new NotFoundException('요청하신 스크랩이 존재하지 않습니다.');
    }
  }

  async getLastNoCategoryScrap(user: User) {
    return await this.scrapModel
      .find({ user, category: null })
      .sort({ _id: -1 })
      .limit(1);
  }

  async getNoCategoryScrap(cursor, user: User) {
    let filter;
    if (!cursor) {
      const last = await this.getLastNoCategoryScrap(user);
      const lastId = last[0]._id;
      filter = { user, category: null, _id: { $lte: lastId } };
    } else {
      filter = { user, category: null, _id: { $lt: cursor } };
    }
    return await this.getPagedScrap(filter);
  }
}
