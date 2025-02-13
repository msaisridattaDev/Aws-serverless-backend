const { getAllNotes } = require("../handler");
const AWS = require("aws-sdk-mock");

describe("getAllNotes Lambda Function", () => {
  beforeAll(() => {
    AWS.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
      callback(null, { Items: [{ noteId: "123", title: "Test Note" }] });
    });
  });

  afterAll(() => {
    AWS.restore("DynamoDB.DocumentClient");
  });

  it("should return all notes with 200 status", async () => {
    const response = await getAllNotes();
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).length).toBeGreaterThan(0);
  });
});
