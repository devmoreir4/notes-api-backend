import knex from "knex";
import knexConfig from "../../knexfile";
import { env } from "../config/env";

const database = knex(knexConfig[env.nodeEnv]);

export default database;
