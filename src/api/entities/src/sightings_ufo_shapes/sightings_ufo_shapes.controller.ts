import { Controller,  Post, Body } from '@nestjs/common';
import { Sightings_ufo_shapesService } from './sightings_ufo_shapes.service';
@Controller('sightings-ufo-shapes')
export class SightingsUfoShapesController {
  constructor(private readonly service: Sightings_ufo_shapesService) {}
  @Post()
  async createSightingOrUfoShape(@Body() message: any) {
    const result = await this.service.createSightingOrUfoShape(message);
    return { result };
  }
}
