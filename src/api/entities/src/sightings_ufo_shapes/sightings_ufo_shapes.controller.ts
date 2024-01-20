import {Controller, Post,Get, Put, Delete,  Body, Param} from '@nestjs/common';
import { Sightings_ufo_shapesService } from './sightings_ufo_shapes.service';
@Controller('api/sightings_ufo_shapes')
export class SightingsUfoShapesController {
  constructor(private readonly service: Sightings_ufo_shapesService) {}
  @Post()
  async createSightingOrUfoShape(@Body() message: any) {
    try {
      await this.service.createSightingOrUfoShape(message);
      return {message: 'Entity created successfully'};
    } catch (error) {
      console.error(error);
    }
  }
  @Put('sightings/:id')
  async updateSighting(@Param('id') id: string, @Body() updatedSightingData: any) {
    try {
      await this.service.updateSighting(id, updatedSightingData);
      return { message: 'Sighting updated successfully' };
    } catch (error) {
      console.error(error);
    }
  }
  @Delete('sightings/:id')
  async deleteSighting(@Param('id') id: string) {
    try {
      await this.service.deleteSighting(id);
      return { message: 'Sighting deleted successfully' };
    } catch (error) {
      console.error(error);
    }
  }
  @Get('sightings/:id')
  async getSightingById(@Param('id') id: string) {
    try {
      const sighting = await this.service.getSightingById(id);
      return sighting;
    } catch (error) {
      console.error(error);
    }
  }
  @Get('ufo_shapes/:id')
  async getUfoShapeById(@Param('id') id: string) {
    try {
      const ufoShape = await this.service.getUfoShapeById(id);
      return ufoShape;
    } catch (error) {
      console.error(error);
    }
  }
  @Put('ufo_shapes/:id')
  async updateUfoShape(@Param('id') id: string, @Body() updatedUfoShapeData: any) {
    try {
      await this.service.updateUfoShape(id, updatedUfoShapeData);
      return { message: 'Ufo_shape updated successfully' };
    } catch (error) {
      console.error(error);
    }
  }
  @Delete('ufo_shapes/:id')
  async deleteUfoShape(@Param('id') id: string) {
    try {
      await this.service.deleteUfoShape(id);
      return { message: 'Ufo shape deleted successfully' };
    } catch (error) {
      console.error(error);
    }
  }
  @Get('ufo_shapes')
  async getAllShapes() {
    try{
      const shapes = await this.service.getAllShapes();
      return { shapes };
    } catch (error) {
      console.error(error);
    }
  }
  @Get('sightings')
  async getAllSightings() {
    try{
      const sightings = await this.service.getAllSightings();
      return { sightings };
    } catch (error) {
      console.error(error);
    }
  }
  @Get('SightingbyUfoShape/:ufoShapeId')
  async getSightingsByUfoShape(@Param('ufoShapeId') ufoShapeId: string) {
    try {
      const sighting = await this.service.getSightingsByUfoShape(ufoShapeId);
      return sighting;
    } catch (error) {
      console.error(error);
    }
  }

  @Get('ufoShapeBySighting/:sightingId')
  async getUfoShapeBySighting(@Param('sightingId') sightingId: string) {
    try {
      const ufo_shape = await this.service.getUfoShapeBySightingId(sightingId);
      return ufo_shape;
    } catch (error) {
      console.error(error);
    }
  }
}
