import { Module } from '@nestjs/common';
import { SightingsUfoShapesController } from './sightings_ufo_shapes.controller';
import { Sightings_ufo_shapesService } from './sightings_ufo_shapes.service';

@Module({controllers: [SightingsUfoShapesController],
  providers: [Sightings_ufo_shapesService],})
export class SightingsUfoShapesModule {}
