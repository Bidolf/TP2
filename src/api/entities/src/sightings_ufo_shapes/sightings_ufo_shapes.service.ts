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
      try {
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
          latitude:content.Location.Latitude,
          longitude:content.Location.Longitude,
          encounter_duration_text: content.EncounterDuration.Texto,
          encounter_duration_seconds: content.EncounterDuration.SecondsApproximate,
          description: content.Description,
        },
      });
       console.log(sighting)
      } catch (error) {
        console.error('Error creating Sighting:', error);
      }
    }else if (message.type === 'ufo_shape' && message.content) {
      const content = message.content;
      const ufoShape = await this.prisma.ufo_shape.create({
        data: {
          id: content.ID,
          shape_name: content.Value,
        },
      });
      console.log(ufoShape)
    }else {
      throw new Error('Invalid message format');
    }
  }
  async updateSighting(id: string, updatedSightingData: any) {
    const existingSighting = await this.prisma.sighting.findUnique({
        where: { id },
      });
      if (!existingSighting) {
        throw new Error(`Sighting with ID ${id} not found`);
      }
      const updatedSighting = await this.prisma.sighting.update({
        where: { id },
        data: updatedSightingData,
      });
      console.log(updatedSighting);
  }

  async deleteSighting(id: string) {
    const existingSighting = await this.prisma.sighting.findUnique({
        where: { id },
      });
      if (!existingSighting) {
        throw new Error(`Sighting with ID ${id} not found`);
      }
      const deleteSighting = await this.prisma.sighting.delete({
        where: { id },
      });
      console.log(deleteSighting)
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
  async getUfoShapeById(id: string) {
    const ufoShape = await this.prisma.ufo_shape.findUnique({
        where: { id },
      });
      if (!ufoShape) {
        throw new Error(`Ufo shape with ID ${id} not found`);
      }
      return ufoShape;
  }
  async updateUfoShape(id: string, updatedUfoShapeData: any) {
    const existingUfoShape = await this.prisma.ufo_shape.findUnique({
        where: { id },
      });
      if (!existingUfoShape) {
        throw new Error(`Ufo shape with ID ${id} not found`);
      }
      const updatedUfoShape = await this.prisma.ufo_shape.update({
        where: { id },
        data: updatedUfoShapeData,
      });
      console.log(updatedUfoShape);
  }
  async deleteUfoShape(id: string) {
    const existingUfoShape = await this.prisma.ufo_shape.findUnique({
        where: { id },
        include: { sightings: true },
      });
      if (!existingUfoShape) {
        throw new Error(`Ufo shape with ID ${id} not found`);
      }
      const updateSightings = existingUfoShape.sightings.map((sighting) =>
      this.prisma.sighting.update({
       where: { id: sighting.id },
        data: { ufo_shape_ref: null },
      })
   );
   await Promise.all(updateSightings);
   const deleteUfoShape = await this.prisma.ufo_shape.delete({
      where: { id },
   });
   console.log(deleteUfoShape);
  }
  async getAllSightings() {
    const sightings = await this.prisma.sighting.findMany();
    if (sightings.length === 0) {
         throw new Error('No sightings found');
    }
     return sightings;
  }
  async getAllShapes() {
    const ufo_shapes = await this.prisma.ufo_shape.findMany();
    if (ufo_shapes.length === 0) {
         throw new Error('No ufo_shapes found');
    }
     return ufo_shapes;

  }

  async getSightingsByUfoShape(ufoShapeId: string) {
    const sightings = await this.prisma.sighting.findMany({
      where: { ufo_shape_ref: ufoShapeId },
    });
    if (sightings.length === 0) {
         throw new Error(`No sightings found for ufoShapeId ${ufoShapeId}`);
    }
     return sightings;
  }

  async getUfoShapeBySightingId(sightingId: string)  {
    const sighting = await this.prisma.sighting.findUnique({
      where: { id: sightingId },
      include: { ufoShape: true },
    });
    if (!sighting) {
      throw new Error(`Sighting with ID ${sightingId} not found`);
    }
    return sighting.ufoShape;
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}