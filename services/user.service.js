"use strict";

const DbMixin = require("../mixins/db.mixin");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "users",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("users")],


	settings: {
		// Available fields in the responses
		fields: [
			"_id",
			"name",
			"password",
		],

		// Validator for the `create` & `insert` actions.
		entityValidator: {
			name: "string|min:3",
			password: "number|positive"
		}
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * Get all users from  users.db collection
		 */
		getUsers: {
			rest: "GET /users",
			/** @param {Context} ctx */
			async handler(ctx) {
				const doc = await this.adapter.find();
				const json = await this.transformDocuments(ctx,ctx.params, doc);

				return json;
			}
		},


		addUser: {
			rest: "POST /users",
			params:{
				name :"string",
				password:"number|integer|string",
			},
			/** @param {Context} ctx */
			async handler(ctx) {
				const newData = {
					name : ctx.params.name,
					password : ctx.params.password
				};
				const doc = await this.adapter.insert(newData);
				const json = await this.transformDocuments(ctx,ctx.params, doc);

				return json;
			}
		},

		updateUser: {
			rest: "PUT /users",
			params:{
				id:"string",
				name :"string",
				password:"number|integer|string",
			},
			/** @param {Context} ctx */
			async handler(ctx) {
				const newData = {
					"name" : ctx.params.name,
					"password" : ctx.params.password
				};
				const doc = await this.adapter.updateById(ctx.params.id, { $set:newData});
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				await this.entityChanged("updated", json, ctx);

				return json;
			}
		},


		deleteUser: {
			rest: "DELETE /users",
			params:{
				id:"string"
			},
			/** @param {Context} ctx */
			async handler(ctx) {
				const doc = await this.adapter.removeById(ctx.params.id);
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				await this.entityChanged("deleted", json, ctx);

				return json;
			}
		},



	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Loading sample data to the collection.
		 * It is called in the DB.mixin after the database
		 * connection establishing & the collection is empty.
		 */
		async seedDB() {
			await this.adapter.insertMany([
				{ name: "Shreyansh", password:"1234" },
				{ name: "Rahul", password:"123" },
			]);
		}
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
