import {Controller, Post,Get, Body, NotFoundException} from '@nestjs/common';
import { Sightings_ufo_shapesService } from './sightings_ufo_shapes.service';
@Controller('sightingsufoshapes')
export class SightingsUfoShapesController {
  constructor(private readonly service: Sightings_ufo_shapesService) {}
  @Post()
  async createSightingOrUfoShape(@Body() message: any) {
    try {
      const result = await this.service.createSightingOrUfoShape(message);
      console.log(result)
      return {result};
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        // Resource not found
        return { error: 'Sighting or UFO shape not found', statusCode: 404 };
      } else {
        // Other errors
        return { error: 'Internal server error', statusCode: 500 };
      }
    }
  }
  @Get()
  async getAllSightings() {
    const sightings = await this.service.getAllSightings();
    return { sightings };
  }
}
