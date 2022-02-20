import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/schemas/user.schema';
import { MyPageRepository } from './repository/my-page.repository';

@Injectable()
export class MyPageService {
  constructor(private readonly myPageRepository: MyPageRepository) {}

  async findUserById(userId: string) {
    return await this.myPageRepository.findUserById(userId);
  }

  async getAllArticles(cursor, user: User) {
    return await this.myPageRepository.getAllArticles(cursor, user);
  }

  async getFollowers(user: User) {
    return await this.myPageRepository.getFollowers(user);
  }

  async createCategory(title: string, user: User) {
    return await this.myPageRepository.createCategory(title, user);
  }

  async updateCategory(title: string, categoryId: string, user: User) {
    return await this.myPageRepository.updateCategory(title, categoryId, user);
  }

  async deleteCategory(categoryId: string, user: User) {
    return await this.myPageRepository.deleteCategory(categoryId, user);
  }

  async getCategoryArticle(categoryId: string, cursor, user: User) {
    return await this.myPageRepository.getCategoryArticle(
      categoryId,
      cursor,
      user,
    );
  }

  async updateCategoryArticle(articleId: string, title: string, user: User) {
    return await this.myPageRepository.updateCategoryArticle(
      articleId,
      title,
      user,
    );
  }

  async deleteCategoryArticle(articleId: string) {
    return await this.myPageRepository.deleteCategoryArticle(articleId);
  }

  async getNoCategoryArticle(cursor, user: User) {
    return await this.myPageRepository.getNoCategoryArticle(cursor, user);
  }

  async getCategoryScrap(categoryId: string, cursor, user: User) {
    return await this.myPageRepository.getCategoryScrap(
      categoryId,
      cursor,
      user,
    );
  }

  async updateCategoryScrap(scrapId: string, title: string, user: User) {
    return await this.myPageRepository.updateCategoryScrap(
      scrapId,
      title,
      user,
    );
  }

  async deleteCategoryScrap(scrapId: string) {
    return await this.myPageRepository.deleteCategoryScrap(scrapId);
  }

  async getNoCategoryScrap(cursor, user: User) {
    return await this.myPageRepository.getNoCategoryScrap(cursor, user);
  }
}
