import { Test, TestingModule } from '@nestjs/testing';
import { SightingsUfoShapesController } from './sightings_ufo_shapes.controller';

describe('SightingsUfoShapesController', () => {
  let controller: SightingsUfoShapesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SightingsUfoShapesController],
    }).compile();

    controller = module.get<SightingsUfoShapesController>(SightingsUfoShapesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
