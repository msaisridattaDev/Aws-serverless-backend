const { deleteNote } = require("../handler");
const AWS = require("aws-sdk-mock");

describe("deleteNote Lambda Function", () => {
  beforeAll(() => {
    AWS.mock("DynamoDB.DocumentClient", "delete", (params, callback) => {
      callback(null, {});
    });
  });

  afterAll(() => {
    AWS.restore("DynamoDB.DocumentClient");
  });

  it("should delete a note and return 200 status", async () => {
    const event = { pathParameters: { id: "123" } };
    const response = await deleteNote(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe("Note deleted!");
  });
});
