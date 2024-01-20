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
      console.log('Creating sighting:', content);
      const sighting = await this.prisma.sighting.create({
        data: {
          id: content.ID,
          ufo_shape_ref: content.UfoShapeRef,
          date_encounter: "'" + content.DateTimeEncounter.Data + "'",
          time_encounter: "'" + content.DateTimeEncounter.Tempo + "'",
          season_encounter: content.DateTimeEncounter.Season,
          date_documented: "'" + content.DateDocumented.Data + "'",
          country: content.Location.Country,
          region: content.Location.Region,
          locale: content.Location.Locality,
          location_geometry: "'" + content.Location.LocationGeometry + "'",
          encounter_duration_text: content.EncounterDuration.Texto,
          encounter_duration_seconds: content.EncounterDuration.SecondsApproximate,
          description: content.Description,
        },
      });
      console.log(sighting)
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
      });
      if (!existingUfoShape) {
        throw new Error(`Ufo shape with ID ${id} not found`);
      }
       const deleteUfo_shape =await this.prisma.ufo_shape.delete({
        where: { id },
      });
      console.log(deleteUfo_shape)
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