const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const Joi = require("joi"); 
const pino = require("pino");

// ✅ Structured Logging (Production Ready)
const logger = pino({
  level: "info", 
  transport: { target: "pino-pretty" }, // Pretty logs for local debugging
});

// Initialize DynamoDB Client
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "sls-notes-backend";

/** ✅ Standardized Joi Schema */
const noteSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().min(5).required(),
});

/** 📝 Create Note (Now with Advanced Logging & Error Handling) */
module.exports.createNote = async (event) => {
  logger.info({ event }, "📩 Received request to create a note.");

  try {
    const data = JSON.parse(event.body);

    // ✅ Validate input using Joi
    const { error } = noteSchema.validate(data);
    if (error) {
      logger.warn({ error: error.details[0].message }, "⚠️ Validation failed.");
      return { statusCode: 400, body: JSON.stringify({ error: error.details[0].message }) };
    }

    const noteId = Date.now().toString();
    const params = new PutCommand({
      TableName: TABLE_NAME,
      Item: { noteId, title: data.title, content: data.content, createdAt: new Date().toISOString() },
    });

    await docClient.send(params);
    logger.info({ noteId }, "✅ Note successfully created.");
    return { statusCode: 201, body: JSON.stringify({ message: "Note created successfully!", noteId }) };
  } catch (error) {
    logger.error({ error }, "❌ Error in createNote.");
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};

/** 📌 Get All Notes (Optimized with Query & Logging) */
module.exports.getAllNotes = async () => {
  logger.info("📩 Received request to fetch all notes.");

  try {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "noteId >= :zero",
      ExpressionAttributeValues: { ":zero": "0" },
    };

    const result = await docClient.send(new QueryCommand(params));
    logger.info({ itemCount: result.Items.length }, "✅ Successfully fetched all notes.");
    return { statusCode: 200, body: JSON.stringify(result.Items) };
  } catch (error) {
    logger.error({ error }, "❌ Error in getAllNotes.");
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};

/** 🔍 Get Single Note (Now with Detailed Logging & Error Handling) */
module.exports.getNote = async (event) => {
  logger.info({ noteId: event.pathParameters?.id }, "📩 Fetching note.");

  try {
    const noteId = event.pathParameters?.id;

    if (!noteId) {
      logger.warn("⚠️ Note ID is missing in request.");
      return { statusCode: 400, body: JSON.stringify({ error: "Note ID is required" }) };
    }

    const params = new GetCommand({ TableName: TABLE_NAME, Key: { noteId } });
    const result = await docClient.send(params);

    if (!result.Item) {
      logger.warn({ noteId }, "⚠️ Note not found.");
      return { statusCode: 404, body: JSON.stringify({ error: "Note not found" }) };
    }

    logger.info({ noteId }, "✅ Successfully fetched note.");
    return { statusCode: 200, body: JSON.stringify(result.Item) };
  } catch (error) {
    logger.error({ error }, "❌ Error in getNote.");
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};

/** 🗑️ Delete Note (Now with Enhanced Logging) */
module.exports.deleteNote = async (event) => {
  logger.info({ noteId: event.pathParameters?.id }, "📩 Deleting note.");

  try {
    const noteId = event.pathParameters?.id;

    if (!noteId) {
      logger.warn("⚠️ Note ID is missing.");
      return { statusCode: 400, body: JSON.stringify({ error: "Note ID is required" }) };
    }

    const params = new DeleteCommand({ TableName: TABLE_NAME, Key: { noteId } });
    await docClient.send(params);

    logger.info({ noteId }, "✅ Note deleted successfully.");
    return { statusCode: 200, body: JSON.stringify({ message: "Note deleted successfully!" }) };
  } catch (error) {
    logger.error({ error }, "❌ Error in deleteNote.");
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};
