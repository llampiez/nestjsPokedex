import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(field: string) {
    let query: any;

    if (!isNaN(+field)) {
      query = { number: +field };
    } else if (isValidObjectId(field)) {
      query = { _id: field };
    } else {
      query = { name: field.toLowerCase().trim() };
    }

    const pokemon = await this.pokemonModel.findOne(query);

    if (!pokemon) {
      throw new NotFoundException(
        `A pokemon has not been found with the id, number or name equal to: ${field}`,
      );
    }

    return pokemon;
  }

  async update(field: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(field);

      if (updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name
          .toLocaleLowerCase()
          .trim();

      await pokemon.updateOne(updatePokemonDto);

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const pokemon = await this.findOne(id);

    await pokemon.deleteOne();
  }

  private handleExceptions(error: any) {
    if (error.code === 11000)
      throw new BadRequestException(
        `There is already a pokemon in the database with the same name-number: ${JSON.stringify(error.keyValue)}`,
      );

    console.log(error);
    throw new InternalServerErrorException();
  }
}
