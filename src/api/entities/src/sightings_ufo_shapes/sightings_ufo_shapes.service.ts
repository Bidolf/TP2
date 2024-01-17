import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
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
          date_encounter: content.DateTimeEncounter.date,
          time_encounter: content.DateTimeEncounter.time,
          season_encounter: content.DateTimeEncounter.Season,
          date_documented: content.DateDocumented.date,
          country: content.Location.Country,
          region: content.Location.Region,
          locale: content.Location.Locality,
          location_geometry: {
            latitude: content.Location.Latitude,
            longitude: content.Location.Longitude,
          },
          encounter_duration_text: content.EncounterDuration.text,
          encounter_duration_seconds: content.EncounterDuration.SecondsApproximate,
          description: content.Description,
        },
      });
      return sighting;
    }else if (message.type === 'ufo_shape' && message.content) {
      const content = message.content;
      const ufoShape = await this.prisma.ufo_shape.create({
        data: {
          id: content.ID,
          shape_name: content.Value,
        },
      });
      return ufoShape;
    }else {
      // Handle other message types or invalid messages
      return { message: 'Invalid message format' };
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
