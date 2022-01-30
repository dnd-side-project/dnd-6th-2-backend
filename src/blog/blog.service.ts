import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './interfaces/blog.interface';
import { createBlogDto } from './dto/createBlog.dto';
import { updateBlogDto } from './dto/updateBlog.dto';

@Injectable()
export class BlogService {
  constructor(@InjectModel('Blog') private readonly blogModel: Model<Blog>) {}

  async addPost(BlogDTO: createBlogDto): Promise<Blog> {
    const totalBlog = await this.blogModel.count();
    BlogDTO.blogId = totalBlog + 1;
    const newBlog = await new this.blogModel(BlogDTO);
    return newBlog.save();
  }

  async getPost(id: number): Promise<Blog> {
    const blog = await this.blogModel.findOne({ blogId: id });
    return blog;
  }

  async getPosts(): Promise<Blog[]> {
    const blogs = await this.blogModel.find().exec();
    return blogs;
  }

  async editPost(id: number, updateBlogDTO: updateBlogDto): Promise<Blog> {
    const editedBlog = await this.blogModel.findOneAndUpdate(
      { blogId: id },
      updateBlogDTO,
      { new: true },
    );
    return editedBlog;
  }

  async deletePost(id: number): Promise<any> {
    const deletedBlog = await this.blogModel.findOneAndRemove({ blogId: id });
    return deletedBlog;
  }
}
