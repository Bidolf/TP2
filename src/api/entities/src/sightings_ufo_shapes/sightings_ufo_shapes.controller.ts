import {Controller, Post,Get, Body, Param} from '@nestjs/common';
import { Sightings_ufo_shapesService } from './sightings_ufo_shapes.service';
@Controller('api/sightings_ufo_shapes')
export class SightingsUfoShapesController {
  constructor(private readonly service: Sightings_ufo_shapesService) {}
  @Post()
  async createSightingOrUfoShape(@Body() message: any) {
    try {
      const result = await this.service.createSightingOrUfoShape(message);
      return {result};
    } catch (error) {
      console.error(error);
    }
  }
  @Get('sightings')
  async getAllSightings() {
    const sightings = await this.service.getAllSightings();
    return { sightings };
  }

  @Get('sightings/:id')
  async getSightingById(@Param('id') id: string) {
    try {
      const sighting = await this.service.getSightingById(id);
      return sighting;
    } catch (error) {
      console.error('Error retrieving sighting by ID:', error);
    }
  }
  @Get('ufo_shapes')
  async getAllShapes() {
    const shapes = await this.service.getAllShapes();
    return { shapes };
  }
}
