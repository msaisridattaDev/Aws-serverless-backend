const { createNote } = require("../handler");
const AWS = require("aws-sdk-mock");

describe("createNote Lambda Function", () => {
  beforeAll(() => {
    AWS.mock("DynamoDB.DocumentClient", "put", (params, callback) => {
      callback(null, { Attributes: params.Item });
    });
  });

  afterAll(() => {
    AWS.restore("DynamoDB.DocumentClient");
  });

  it("should create a note and return 201 status", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Note",
        content: "Testing note creation",
      }),
    };

    const response = await createNote(event);
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body).message).toBe("Note created!");
  });
});
