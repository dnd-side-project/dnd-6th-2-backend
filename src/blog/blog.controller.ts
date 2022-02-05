import {
  Controller,
  Get,
  Res,
  HttpStatus,
  Param,
  NotFoundException,
  Post,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { createBlogDto } from './dto/createBlog.dto';
import { updateBlogDto } from './dto/updateBlog.dto';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@ApiTags('blog(CRUD 테스트용)')
@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Post()
  @ApiResponse({ description: '글 작성 API' })
  @ApiBody({ type: createBlogDto })
  @ApiCreatedResponse({
    description: '글 작성 성공 여부',
    schema: {
      example: { success: true },
    },
  })
  async addPost(@Res() res, @Body() createPostDTO: createBlogDto) {
    const newBlog = await this.blogService.addPost(createPostDTO);
    return res.status(HttpStatus.CREATED).json(newBlog);
  }

  @Get('/:blogId')
  @ApiResponse({ description: '특정 글 조회 API' })
  async getPost(@Res() res, @Param('blogId') blogId: number) {
    const blog = await this.blogService.getPost(blogId);
    if (!blog) {
      throw new NotFoundException('Post does not exist!');
    }
    return res.status(HttpStatus.OK).json(blog);
  }

  @Get()
  @ApiResponse({ description: '전체 글 조회 API' })
  async getPosts(@Res() res) {
    const blogs = await this.blogService.getPosts();
    return res.status(HttpStatus.OK).json(blogs);
  }

  @Patch('/:blogId')
  @ApiResponse({ description: '특정 글 수정 API' })
  @ApiBody({ type: createBlogDto })
  async editPost(
    @Res() res,
    @Param('blogId') blogId: number,
    @Body() updatePostDTO: updateBlogDto,
  ) {
    const editedBlog = await this.blogService.editPost(blogId, updatePostDTO);
    if (!editedBlog) {
      throw new NotFoundException('Post does not exist!');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Post has been successfully updated',
      blog: editedBlog,
    });
  }

  @Delete('/:blogId')
  async deletePost(@Res() res, @Param('blogId') blogId: number) {
    const deletedBlog = await this.blogService.deletePost(blogId);
    if (!deletedBlog) {
      throw new NotFoundException('Post does not exist!');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Post has been deleted!',
      blog: deletedBlog,
    });
  }
}
