import { Test, TestingModule } from '@nestjs/testing';
import { Sightings_ufo_shapesService } from './sightings_ufo_shapes.service';

describe('SightingsService', () => {
  let service: Sightings_ufo_shapesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Sightings_ufo_shapesService],
    }).compile();

    service = module.get<Sightings_ufo_shapesService>(Sightings_ufo_shapesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
