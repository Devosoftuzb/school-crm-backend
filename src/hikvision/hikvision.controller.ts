import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Version,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Roles } from 'src/common/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HikvisionService } from './hikvision.service';
import { AddFaceResult, DeleteFaceResult, PingResult } from './hikvision.types';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_ROLES = ['owner', 'administrator', 'superadmin'] as const;

// ─── Guards shortcut ─────────────────────────────────────────────────────────

const AdminGuards = [RolesGuard, JwtAuthGuard];
const AdminRoles = Roles(...ALLOWED_ROLES);

// ─── Controller ──────────────────────────────────────────────────────────────

@ApiTags('Hikvision')
@ApiBearerAuth('access-token')
@Controller('hikvision')
export class HikvisionController {
  constructor(private readonly hikvisionService: HikvisionService) {}

  // ─── Ping ──────────────────────────────────────────────────────────────────

  @Version('1')
  @Get('ping')
  @AdminRoles
  @UseGuards(...AdminGuards)
  @ApiOperation({ summary: 'Qurilma bilan aloqani tekshirish' })
  @ApiResponse({ status: 200, description: 'Qurilma holati' })
  ping(): Promise<PingResult> {
    return this.hikvisionService.ping();
  }

  // ─── Add Face ──────────────────────────────────────────────────────────────

  @Version('1')
  @Post('face/:student_id')
  @AdminRoles
  @UseGuards(...AdminGuards)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(), // buffer da saqlaymiz — diskka yozmaymiz
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Fayl turi qo'llab-quvvatlanmaydi. Faqat: ${ALLOWED_MIME_TYPES.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  @ApiOperation({ summary: "Studentni qurilmaga yuz rasmi bilan qo'shish" })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'student_id', type: Number, description: 'Student ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photo'],
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Yuz rasmi (jpg / png, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Yuz muvaffaqiyatli qo'shildi" })
  @ApiResponse({
    status: 400,
    description: "Fayl yuklanmagan yoki noto'g'ri format",
  })
  @ApiResponse({ status: 404, description: 'Student topilmadi' })
  addFace(
    @Param('student_id', ParseIntPipe) student_id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AddFaceResult> {
    if (!file) {
      throw new BadRequestException('Rasm fayli yuklanmagan (field: photo)');
    }

    return this.hikvisionService.addFace(student_id, file);
  }

  // ─── Delete Face ───────────────────────────────────────────────────────────

  @Version('1')
  @Delete('face/:student_id')
  @AdminRoles
  @UseGuards(...AdminGuards)
  @ApiOperation({ summary: "Studentni qurilmadan o'chirish" })
  @ApiParam({ name: 'student_id', type: Number, description: 'Student ID' })
  @ApiResponse({ status: 200, description: "Yuz muvaffaqiyatli o'chirildi" })
  @ApiResponse({ status: 404, description: 'Student topilmadi' })
  deleteFace(
    @Param('student_id', ParseIntPipe) student_id: number,
  ): Promise<DeleteFaceResult> {
    return this.hikvisionService.deleteFace(student_id);
  }
}
