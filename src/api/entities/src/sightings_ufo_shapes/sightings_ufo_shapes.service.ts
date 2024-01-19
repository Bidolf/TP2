import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient} from '@prisma/client';
@Injectable()
export class Sightings_ufo_shapesService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  private readonly prisma: PrismaClient;
  constructor() {
    super();
    this.prisma = new PrismaClient();
  }
  async createSightingOrUfoShape(message: any) {
    if (message.type === 'sighting' && message.content) {
      const content = message.content;
      const sighting = await this.prisma.sighting.create({
        data: {
          id: content.ID,
          ufo_shape_ref: content.UfoShapeRef,
          date_encounter: content.DateTimeEncounter.Data,
          time_encounter: content.DateTimeEncounter.Tempo,
          season_encounter: content.DateTimeEncounter.Season,
          date_documented: content.DateDocumented.Data,
          country: content.Location.Country,
          region: content.Location.Region,
          locale: content.Location.Locality,
          location_geometry: `POINT(${content.Location.Latitude} ${content.Location.Longitude})`,
          encounter_duration_text: content.EncounterDuration.Texto,
          encounter_duration_seconds: content.EncounterDuration.SecondsApproximate,
          description: content.Description,
        },
      });
      console.log(sighting)
      return sighting;
    }else if (message.type === 'ufo_shape' && message.content) {
      const content = message.content;
      const ufoShape = await this.prisma.ufo_shape.create({
        data: {
          id: content.ID,
          shape_name: content.Value,
        },
      });
      console.log(ufoShape)
      return ufoShape;
    }else {
      throw new Error(`Invalid message format`);
    }
  }

  async getSightingById(id: string)  {
    const sighting = await this.prisma.sighting.findUnique({
      where: {
        id: id,
      },
    });
    if (!sighting) {
      throw new Error(`Sighting with ID ${id} not found`);
    }
    return sighting;
  }

  async getAllSightings() {
    return this.prisma.sighting.findMany();
  }
  async getAllShapes() {
    return this.prisma.ufo_shape.findMany();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}