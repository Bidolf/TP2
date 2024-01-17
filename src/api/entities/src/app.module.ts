import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Sightings_ufo_shapesService } from './sightings_ufo_shapes/sightings_ufo_shapes.service';
import { SightingsUfoShapesController } from './sightings_ufo_shapes/sightings_ufo_shapes.controller';
import { SightingsUfoShapesModule } from './sightings_ufo_shapes/sightings_ufo_shapes.module';

@Module({
  imports: [SightingsUfoShapesModule],
  controllers: [AppController, SightingsUfoShapesController],
  providers: [AppService, Sightings_ufo_shapesService],
})
export class AppModule {}
